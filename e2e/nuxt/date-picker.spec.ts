import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("DatePicker — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-trigger"]');
  const content = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-content"]');
  const header = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-header"]');
  const next = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-next"]');

  test("trigger is visible", async ({ page }) => {
    await expect(trigger(page)).toBeVisible();
  });

  test("calendar is hidden before trigger click", async ({ page }) => {
    await expect(content(page)).not.toBeVisible();
  });

  test("clicking trigger opens the calendar", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
  });

  test("calendar header shows a label when open", async ({ page }) => {
    await trigger(page).click();
    await expect(header(page)).not.toBeEmpty();
  });

  test("next month button changes header label", async ({ page }) => {
    await trigger(page).click();
    const initial = await header(page).textContent();
    await next(page).click();
    const updated = await header(page).textContent();
    expect(updated).not.toBe(initial);
  });

  test("SSR: trigger is in initial HTML without JS", async ({ page }) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(URL);
    await expect(trigger(page)).toBeVisible();
  });

  test("no axe violations when closed", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
