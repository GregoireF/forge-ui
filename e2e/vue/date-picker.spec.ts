import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("DatePicker — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-trigger"]');
  const content = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-content"]');
  const header = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-header"]');
  const prev = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-prev"]');
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

  test("calendar header shows a month/year label", async ({ page }) => {
    await trigger(page).click();
    await expect(header(page)).not.toBeEmpty();
  });

  test("prev/next month buttons are visible when open", async ({ page }) => {
    await trigger(page).click();
    await expect(prev(page)).toBeVisible();
    await expect(next(page)).toBeVisible();
  });

  test("next month button changes header label", async ({ page }) => {
    await trigger(page).click();
    const initial = await header(page).textContent();
    await next(page).click();
    const updated = await header(page).textContent();
    expect(updated).not.toBe(initial);
  });

  test("no axe violations when closed", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
