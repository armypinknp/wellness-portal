import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every test fails on console errors (incl. CSP violations), page errors, or
 * any request leaving the Portal's origin: saved content must never be
 * transmitted, and no third-party resources are allowed.
 */
export const test = base.extend<{ guard: { offOrigin: string[]; allowCspViolation: boolean } }>({
  guard: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      const offOrigin: string[] = [];
      const state = { offOrigin, allowCspViolation: false };
      page.on("console", (m) => {
        if (m.type() !== "error") return;
        if (state.allowCspViolation && m.text().includes("Content Security Policy")) return;
        problems.push(`console: ${m.text()}`);
      });
      page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
      page.on("request", (r) => {
        const url = r.url();
        if (!url.startsWith(baseURL!) && !url.startsWith("data:") && !url.startsWith("blob:"))
          offOrigin.push(url);
      });
      // Quick Exit's neutral site: answer locally so tests never hit the network.
      await page.route("https://www.weather.com/**", (route) =>
        route.fulfill({ contentType: "text/html", body: "<title>Neutral</title>" }),
      );
      await use(state);
      expect(problems, "console/page errors").toEqual([]);
      expect(
        offOrigin.filter((u) => !u.startsWith("https://www.weather.com")),
        "requests leaving the Portal",
      ).toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };

/** Dismiss the first-visit intro by choosing a saving preference. */
export async function choose(
  page: Page,
  option: "Save on This Device" | "Continue Without Saving",
) {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip intro" }).first().click();
  await page.getByRole("button", { name: option }).click();
  await page.getByRole("button", { name: "Enter the portal" }).click();
}
