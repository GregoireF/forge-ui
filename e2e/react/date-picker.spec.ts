import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("DatePicker — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-trigger"]');
  const content = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-content"]');
  const header = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-header"]');
  const grid = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-picker-grid"]');
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

  test("calendar grid is rendered when open", async ({ page }) => {
    await trigger(page).click();
    await expect(grid(page)).toBeVisible();
  });

  test("clicking next month button changes header text", async ({ page }) => {
    await trigger(page).click();
    const initialLabel = await header(page).textContent();
    await next(page).click();
    const newLabel = await header(page).textContent();
    expect(newLabel).not.toBe(initialLabel);
  });

  test("no axe violations when closed", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
