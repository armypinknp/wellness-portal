import { readFileSync } from "node:fs";
import { choose, expect, test } from "./fixtures";

test.describe("device-only saving", () => {
  test("save, reload, reopen, export and delete", async ({ page }) => {
    await choose(page, "Save on This Device");
    await page.goto("/calm-room/breath");
    await page.getByRole("button", { name: "Save to my device" }).click();
    await expect(page.getByText("Saved to My Saved Items on this device.")).toBeVisible();

    await page.goto("/saved-items");
    await page.reload(); // persisted, not just in memory
    await page.getByRole("button", { name: "Open item" }).click();
    await expect(
      page.getByRole("heading", { name: "Breathing exercise (placeholder)" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Return to activity" })).toHaveAttribute(
      "href",
      "/calm-room/breath",
    );

    await page.getByRole("button", { name: "My Saved Items" }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Download collection" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe("wellness-portal-saved-items.zip");
    const zip = readFileSync((await file.path())!);
    expect(zip.subarray(0, 2).toString()).toBe("PK");

    await page.getByRole("button", { name: "Delete all" }).click();
    await page.getByRole("button", { name: "Delete permanently" }).click();
    await expect(page.getByText("No saved items yet.")).toBeVisible(); // transaction resolved
    await page.reload();
    await expect(page.getByText("No saved items yet.")).toBeVisible();
  });

  test("Continue Without Saving never writes items", async ({ page }) => {
    await choose(page, "Continue Without Saving");
    await page.goto("/calm-room/breath");
    await page.getByRole("button", { name: "Save to my device" }).click();
    // Offers the choice instead of saving silently.
    await expect(page.getByRole("heading", { name: "YOUR PRIVACY, YOUR CHOICE" })).toBeVisible();
    await page.goto("/saved-items");
    await expect(page.getByText("No saved items yet.")).toBeVisible();
  });
});
