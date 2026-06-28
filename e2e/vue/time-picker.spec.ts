import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("TimePicker — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const group = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="time-picker-group"]');
  const hours = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="time-picker-hours"]');
  const minutes = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="time-picker-minutes"]');
  const seconds = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="time-picker-seconds"]');
  const period = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="time-picker-period"]');

  test("group is visible", async ({ page }) => {
    await expect(group(page)).toBeVisible();
  });

  test("hours has role=spinbutton and aria-label=Hours", async ({ page }) => {
    await expect(hours(page)).toHaveAttribute("role", "spinbutton");
    await expect(hours(page)).toHaveAttribute("aria-label", "Hours");
  });

  test("minutes has aria-valuemax=59", async ({ page }) => {
    await expect(minutes(page)).toHaveAttribute("aria-valuemax", "59");
  });

  test("period segment is visible", async ({ page }) => {
    await expect(period(page)).toBeVisible();
  });

  test("ArrowUp on hours sets it (wraps in 12-hour)", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "12");
  });

  test("ArrowRight on hours moves focus to minutes", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(minutes(page)).toBeFocused();
  });

  test("ArrowLeft on minutes moves focus to hours", async ({ page }) => {
    await minutes(page).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(hours(page)).toBeFocused();
  });

  test("ArrowRight on minutes moves focus to seconds", async ({ page }) => {
    await minutes(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(seconds(page)).toBeFocused();
  });

  test("typing sets hours value", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.type("9");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "9");
  });

  test("group has data-forge-scope=time-picker", async ({ page }) => {
    await expect(group(page)).toHaveAttribute("data-forge-scope", "time-picker");
  });

  test("no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
