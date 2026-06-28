import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("DateRangePicker — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-range-picker-trigger"]');
  const content = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-range-picker-content"]');
  const header = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-range-picker-header"]');
  const clear = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-range-picker-clear"]');
  const next = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-range-picker-next"]');

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

  test("header shows a label when open", async ({ page }) => {
    await trigger(page).click();
    await expect(header(page)).not.toBeEmpty();
  });

  test("clear button is visible when open", async ({ page }) => {
    await trigger(page).click();
    await expect(clear(page)).toBeVisible();
  });

  test("next month button changes header", async ({ page }) => {
    await trigger(page).click();
    const initial = await header(page).textContent();
    await next(page).click();
    const updated = await header(page).textContent();
    expect(updated).not.toBe(initial);
  });

  test("no axe violations when closed", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
