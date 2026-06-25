import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("DateField — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const group = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-field-group"]');
  const month = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-field-month"]');
  const day = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-field-day"]');
  const year = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-field-year"]');
  const valueDisplay = (page: import("@playwright/test").Page) => page.locator('[data-testid="date-field-value"]');

  // ---------------------------------------------------------------------------
  // Structure & ARIA
  // ---------------------------------------------------------------------------

  test("group is visible with role=group", async ({ page }) => {
    await expect(group(page)).toBeVisible();
    await expect(group(page)).toHaveAttribute("role", "group");
  });

  test("group has aria-label=Date", async ({ page }) => {
    await expect(group(page)).toHaveAttribute("aria-label", "Date");
  });

  test("month segment exists with role=spinbutton", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("role", "spinbutton");
  });

  test("day segment exists with role=spinbutton", async ({ page }) => {
    await expect(day(page)).toHaveAttribute("role", "spinbutton");
  });

  test("year segment exists with role=spinbutton", async ({ page }) => {
    await expect(year(page)).toHaveAttribute("role", "spinbutton");
  });

  test("month has aria-label=Month", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("aria-label", "Month");
  });

  test("day has aria-label=Day", async ({ page }) => {
    await expect(day(page)).toHaveAttribute("aria-label", "Day");
  });

  test("year has aria-label=Year", async ({ page }) => {
    await expect(year(page)).toHaveAttribute("aria-label", "Year");
  });

  test("month has aria-valuemin=1 and aria-valuemax=12", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("aria-valuemin", "1");
    await expect(month(page)).toHaveAttribute("aria-valuemax", "12");
  });

  // ---------------------------------------------------------------------------
  // WAI-ARIA Spinbutton — keyboard interaction
  // ---------------------------------------------------------------------------

  test("ArrowUp on month sets it to 1 (from blank)", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "1");
  });

  test("ArrowUp twice on month sets it to 2", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "2");
  });

  test("ArrowDown on blank month wraps to 12", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "12");
  });

  test("typing digit 6 sets month to 6", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.type("6");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "6");
  });

  test("Backspace clears month after setting it", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Backspace");
    await expect(month(page)).not.toHaveAttribute("aria-valuenow");
  });

  // ---------------------------------------------------------------------------
  // Segment navigation
  // ---------------------------------------------------------------------------

  test("ArrowRight on month moves focus to day", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(day(page)).toBeFocused();
  });

  test("ArrowLeft on day moves focus back to month", async ({ page }) => {
    await day(page).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(month(page)).toBeFocused();
  });

  test("ArrowRight on day moves focus to year", async ({ page }) => {
    await day(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(year(page)).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // Full date value
  // ---------------------------------------------------------------------------

  test("assembled date displays when all segments filled", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.type("3");
    await day(page).focus();
    await page.keyboard.type("15");
    await year(page).focus();
    await page.keyboard.type("2025");
    await expect(valueDisplay(page)).toContainText("2025-03-15");
  });

  // ---------------------------------------------------------------------------
  // CSS contract / data attributes
  // ---------------------------------------------------------------------------

  test("group has data-forge-scope=date-field", async ({ page }) => {
    await expect(group(page)).toHaveAttribute("data-forge-scope", "date-field");
  });

  test("month has data-forge-part=segment-month", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("data-forge-part", "segment-month");
  });

  test("day has data-forge-part=segment-day", async ({ page }) => {
    await expect(day(page)).toHaveAttribute("data-forge-part", "segment-day");
  });

  test("year has data-forge-part=segment-year", async ({ page }) => {
    await expect(year(page)).toHaveAttribute("data-forge-part", "segment-year");
  });

  // ---------------------------------------------------------------------------
  // Axe a11y audit
  // ---------------------------------------------------------------------------

  test("date field has no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
