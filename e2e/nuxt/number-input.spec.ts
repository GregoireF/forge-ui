import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("NumberInput — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const input = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="number-input-input"]');
  const increment = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="number-input-increment"]');
  const decrement = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="number-input-decrement"]');
  const disabledInput = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="number-input-input-disabled"]');

  // ---------------------------------------------------------------------------
  // WAI-ARIA §3.21 Spinbutton
  // ---------------------------------------------------------------------------

  test("input has role=spinbutton", async ({ page }) => {
    await expect(input(page)).toHaveAttribute("role", "spinbutton");
  });

  test("aria-valuenow is 50 initially", async ({ page }) => {
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "-1", 10);
    expect(valuenow).toBe(50);
  });

  test("aria-valuemin is 0", async ({ page }) => {
    const valuemin = parseInt((await input(page).getAttribute("aria-valuemin")) ?? "-1", 10);
    expect(valuemin).toBe(0);
  });

  test("aria-valuemax is 100", async ({ page }) => {
    const valuemax = parseInt((await input(page).getAttribute("aria-valuemax")) ?? "-1", 10);
    expect(valuemax).toBe(100);
  });

  test("input has an accessible name via aria-label", async ({ page }) => {
    const label = await input(page).getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // SSR: spinbutton attributes présents dès le HTML initial
  // ---------------------------------------------------------------------------

  // WAI-ARIA §3.21 + SSR: les attributs spinbutton doivent être dans le HTML initial
  // pour les utilisateurs de screen readers sur navigateurs sans JS.
  test("SSR: aria-valuenow present in initial HTML (no hydration needed)", async ({ page }) => {
    const html = await page.content();
    expect(html).toContain("aria-valuenow");
  });

  test("SSR: role=spinbutton present in initial HTML", async ({ page }) => {
    const html = await page.content();
    expect(html).toContain('role="spinbutton"');
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowUp increments value by step (50 → 51)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("ArrowUp");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(51);
  });

  test("ArrowDown decrements value by step (50 → 49)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("ArrowDown");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(49);
  });

  // WAI-ARIA §3.21: PageUp/PageDown move by a large step (largeStep = step × 10 = 10).
  test("PageUp increments value by largeStep (50 → 60)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("PageUp");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(60);
  });

  test("PageDown decrements value by largeStep (50 → 40)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("PageDown");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(40);
  });

  test("Home sets value to min (0)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("Home");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "-1", 10);
    expect(valuenow).toBe(0);
  });

  test("End sets value to max (100)", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("End");
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "-1", 10);
    expect(valuenow).toBe(100);
  });

  // ---------------------------------------------------------------------------
  // Stepper buttons
  // ---------------------------------------------------------------------------

  test("increment button click increments value (50 → 51)", async ({ page }) => {
    await increment(page).click();
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(51);
  });

  test("decrement button click decrements value (50 → 49)", async ({ page }) => {
    await decrement(page).click();
    const valuenow = parseInt((await input(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(49);
  });

  // WAI-ARIA §3.21: at min, decrement trigger MUST be aria-disabled.
  test("at min value: decrement trigger has aria-disabled=true", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("Home");
    await expect(decrement(page)).toHaveAttribute("aria-disabled", "true");
  });

  // WAI-ARIA §3.21: at max, increment trigger MUST be aria-disabled.
  test("at max value: increment trigger has aria-disabled=true", async ({ page }) => {
    await input(page).focus();
    await page.keyboard.press("End");
    await expect(increment(page)).toHaveAttribute("aria-disabled", "true");
  });

  // ---------------------------------------------------------------------------
  // Disabled state
  // ---------------------------------------------------------------------------

  test("disabled input has aria-disabled=true", async ({ page }) => {
    await expect(disabledInput(page)).toHaveAttribute("aria-disabled", "true");
  });

  test("disabled input has data-disabled attribute", async ({ page }) => {
    await expect(disabledInput(page)).toHaveAttribute("data-disabled", "");
  });

  // ---------------------------------------------------------------------------
  // Form submission
  // ---------------------------------------------------------------------------

  test("hidden input has correct name and initial value", async ({ page }) => {
    const hidden = page.locator('input[type="hidden"][name="quantity"]').first();
    await expect(hidden).toHaveAttribute("value", "50");
  });

  // ---------------------------------------------------------------------------
  // Data attributes
  // ---------------------------------------------------------------------------

  test("input has data-forge-scope=number-input", async ({ page }) => {
    await expect(input(page)).toHaveAttribute("data-forge-scope", "number-input");
  });

  test("input has data-forge-part=input", async ({ page }) => {
    await expect(input(page)).toHaveAttribute("data-forge-part", "input");
  });

  // ---------------------------------------------------------------------------
  // Axe accessibility
  // ---------------------------------------------------------------------------

  test("no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="number-input"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
