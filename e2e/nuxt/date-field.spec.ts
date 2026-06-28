import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("DateField — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const group = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-field-group"]');
  const month = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-field-month"]');
  const day = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-field-day"]');
  const year = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-field-year"]');
  const valueDisplay = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="date-field-value"]');

  test("group is visible with role=group and aria-label=Date", async ({ page }) => {
    await expect(group(page)).toBeVisible();
    await expect(group(page)).toHaveAttribute("role", "group");
    await expect(group(page)).toHaveAttribute("aria-label", "Date");
  });

  test("segments have role=spinbutton", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("role", "spinbutton");
    await expect(day(page)).toHaveAttribute("role", "spinbutton");
    await expect(year(page)).toHaveAttribute("role", "spinbutton");
  });

  test("month has aria-valuemin=1 and aria-valuemax=12", async ({ page }) => {
    await expect(month(page)).toHaveAttribute("aria-valuemin", "1");
    await expect(month(page)).toHaveAttribute("aria-valuemax", "12");
  });

  test("ArrowUp on month sets it to 1 from blank", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "1");
  });

  test("ArrowRight on month moves focus to day", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(day(page)).toBeFocused();
  });

  test("typing digit sets month value", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.type("6");
    await expect(month(page)).toHaveAttribute("aria-valuenow", "6");
  });

  test("full date assembled and displayed", async ({ page }) => {
    await month(page).focus();
    await page.keyboard.type("3");
    await day(page).focus();
    await page.keyboard.type("15");
    await year(page).focus();
    await page.keyboard.type("2025");
    await expect(valueDisplay(page)).toContainText("2025-03-15");
  });

  test("SSR: date field is in initial HTML without JS", async ({ page }) => {
    await page.setJavaScriptEnabled(false);
    await page.goto(URL);
    await expect(group(page)).toBeVisible();
  });

  test("no axe violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
});
