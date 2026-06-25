import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("TimePicker — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const group = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-group"]');
  const hours = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-hours"]');
  const minutes = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-minutes"]');
  const seconds = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-seconds"]');
  const period = (page: import("@playwright/test").Page) => page.locator('[data-testid="time-picker-period"]');

  // ---------------------------------------------------------------------------
  // Structure & ARIA
  // ---------------------------------------------------------------------------

  test("group is visible", async ({ page }) => {
    await expect(group(page)).toBeVisible();
  });

  test("hours has role=spinbutton and aria-label=Hours", async ({ page }) => {
    await expect(hours(page)).toHaveAttribute("role", "spinbutton");
    await expect(hours(page)).toHaveAttribute("aria-label", "Hours");
  });

  test("minutes has role=spinbutton and aria-label=Minutes", async ({ page }) => {
    await expect(minutes(page)).toHaveAttribute("role", "spinbutton");
    await expect(minutes(page)).toHaveAttribute("aria-label", "Minutes");
  });

  test("seconds has role=spinbutton and aria-label=Seconds", async ({ page }) => {
    await expect(seconds(page)).toHaveAttribute("role", "spinbutton");
    await expect(seconds(page)).toHaveAttribute("aria-label", "Seconds");
  });

  test("period segment is visible in 12-hour mode", async ({ page }) => {
    await expect(period(page)).toBeVisible();
  });

  test("hours has aria-valuemin=1 and aria-valuemax=12 (12-hour mode)", async ({ page }) => {
    await expect(hours(page)).toHaveAttribute("aria-valuemin", "1");
    await expect(hours(page)).toHaveAttribute("aria-valuemax", "12");
  });

  test("minutes has aria-valuemin=0 and aria-valuemax=59", async ({ page }) => {
    await expect(minutes(page)).toHaveAttribute("aria-valuemin", "0");
    await expect(minutes(page)).toHaveAttribute("aria-valuemax", "59");
  });

  test("seconds has aria-valuemin=0 and aria-valuemax=59", async ({ page }) => {
    await expect(seconds(page)).toHaveAttribute("aria-valuemin", "0");
    await expect(seconds(page)).toHaveAttribute("aria-valuemax", "59");
  });

  // ---------------------------------------------------------------------------
  // WAI-ARIA Spinbutton — keyboard interaction
  // ---------------------------------------------------------------------------

  test("ArrowUp on hours sets it to 12 (12-hour wrap from blank)", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "12");
  });

  test("typing 8 sets hours to 8", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.type("8");
    await expect(hours(page)).toHaveAttribute("aria-valuenow", "8");
  });

  test("ArrowUp on minutes sets it to 0 from blank", async ({ page }) => {
    await minutes(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(minutes(page)).toHaveAttribute("aria-valuenow", "0");
  });

  test("Backspace clears hours", async ({ page }) => {
    await hours(page).focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Backspace");
    await expect(hours(page)).not.toHaveAttribute("aria-valuenow");
  });

  // ---------------------------------------------------------------------------
  // Segment navigation
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // CSS contract
  // ---------------------------------------------------------------------------

  test("group has data-forge-scope=time-picker", async ({ page }) => {
    await expect(group(page)).toHaveAttribute("data-forge-scope", "time-picker");
  });

  test("hours has data-forge-part=segment-hours", async ({ page }) => {
    await expect(hours(page)).toHaveAttribute("data-forge-part", "segment-hours");
  });

  // ---------------------------------------------------------------------------
  // Axe
  // ---------------------------------------------------------------------------

  test("no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
