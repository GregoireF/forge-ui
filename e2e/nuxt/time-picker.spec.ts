import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("TimePicker — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const group = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-group"]');
  const hours = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-hours"]');
  const minutes = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-minutes"]');
  const seconds = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-seconds"]');
  const period = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-period"]');

  test("group is visible", async ({ page }) => {
    await expect(group(page)).toBeVisible();
  });

  test("hours has role=spinbutton", async ({ page }) => {
    await expect(hours(page)).toHaveAttribute("role", "spinbutton");
    await expect(hours(page)).toHaveAttribute("aria-label", "Hours");
  });

  test("period segment is visible in 12-hour mode", async ({ page }) => {
    await expect(period(page)).toBeVisible();
  });

  test("ArrowUp on hours sets value", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "12");
  });

  test("ArrowRight on hours moves focus to minutes", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(minutes(page)).toBeFocused();
  });

  test("ArrowRight on minutes moves focus to seconds", async ({ page }) => {
    await minutes(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(seconds(page)).toBeFocused();
  });

  test("SSR: time picker group is in initial HTML", async ({ page }) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(URL);
    await expect(group(page)).toBeVisible();
  });

  test("no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
