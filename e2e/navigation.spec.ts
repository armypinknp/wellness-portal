import { choose, expect, test } from "./fixtures";

const routes = [
  "/",
  "/art-room",
  "/gallery",
  "/calm-room",
  "/calm-room/breath",
  "/recovery-rooms",
  "/recovery-rooms/crisis",
  "/library",
  "/library/self-care",
  "/resource/self-care-1",
  "/not-broken",
  "/not-broken/module-1",
  "/opportunities",
  "/partners",
  "/partner-sessions",
  "/journals",
  "/decision-support",
  "/toolkit",
  "/saved-items",
  "/privacy",
];

test.describe("anonymous navigation", () => {
  for (const route of routes) {
    test(`${route} renders without errors, CSP violations or third-party requests`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page.locator("#main")).toBeVisible();
      await expect(page.getByRole("button", { name: "Quick Exit" }).first()).toBeVisible();
    });
  }

  test("Continue Without Saving reaches every area without identity questions", async ({
    page,
  }) => {
    await choose(page, "Continue Without Saving");
    for (const route of routes) {
      await page.goto(route);
      await expect(page.locator('input[type="email"], input[name*="name" i]')).toHaveCount(0);
    }
  });
});

test.describe("Quick Exit", () => {
  test("button replaces the page with the neutral site", async ({ page }) => {
    await page.goto("/privacy");
    await page.getByRole("button", { name: "Quick Exit" }).first().click();
    await expect(page).toHaveURL(/weather\.com/);
    await expect(page).toHaveTitle("Neutral");
  });

  test("Esc exits from the page but not while typing (D4)", async ({ page }) => {
    await choose(page, "Continue Without Saving");
    await page.goto("/decision-support");
    const field = page.locator("textarea").first();
    if (await field.count()) {
      await field.focus();
      await page.keyboard.press("Escape");
      await expect(page).toHaveURL(/decision-support/);
      await field.blur();
    }
    await page.locator("h1").click();
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/weather\.com/);
  });
});

test("strict CSP blocks injected inline scripts (XSS defence)", async ({ page, guard }) => {
  guard.allowCspViolation = true; // the violation is the expected outcome
  await page.goto("/");
  const ran = await page.evaluate(async () => {
    const s = document.createElement("script");
    s.textContent = "window.__injected = true";
    document.body.append(s);
    await new Promise((r) => setTimeout(r, 50));
    return (window as unknown as { __injected?: boolean }).__injected === true;
  });
  expect(ran).toBe(false);
});
