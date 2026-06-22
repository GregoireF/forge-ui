import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Accordion — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const triggerWhat = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="accordion-trigger-what"]');

  const triggerWhy = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="accordion-trigger-why"]');

  const contentWhat = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="accordion-content-what"]');

  const contentWhy = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="accordion-content-why"]');

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  test("both content panels are hidden on load", async ({ page }) => {
    await expect(contentWhat(page)).not.toBeVisible();
    await expect(contentWhy(page)).not.toBeVisible();
  });

  test("both triggers are visible on load", async ({ page }) => {
    await expect(triggerWhat(page)).toBeVisible();
    await expect(triggerWhy(page)).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  test("clicking first trigger opens first panel", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toBeVisible();
  });

  test("clicking second trigger opens second panel", async ({ page }) => {
    await triggerWhy(page).click();
    await expect(contentWhy(page)).toBeVisible();
  });

  test("in single mode, opening second closes first", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toBeVisible();
    await triggerWhy(page).click();
    await expect(contentWhy(page)).toBeVisible();
    await expect(contentWhat(page)).not.toBeVisible();
  });

  test("clicking open trigger again closes it (collapsible=true)", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toBeVisible();
    await triggerWhat(page).click();
    await expect(contentWhat(page)).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has aria-expanded=false when closed", async ({ page }) => {
    await expect(triggerWhat(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(triggerWhat(page)).toHaveAttribute("aria-expanded", "true");
  });

  // ---------------------------------------------------------------------------
  // Data attributes
  // ---------------------------------------------------------------------------

  test("trigger has data-state=closed when panel closed", async ({ page }) => {
    await expect(triggerWhat(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has data-state=open when panel open", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(triggerWhat(page)).toHaveAttribute("data-state", "open");
  });

  test("content has data-state=open when visible", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toHaveAttribute("data-state", "open");
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation — WAI-ARIA §3.1: arrow keys move focus between header buttons
  // ---------------------------------------------------------------------------

  test("ArrowDown moves focus from first trigger to second", async ({ page }) => {
    await triggerWhat(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(triggerWhy(page)).toBeFocused();
  });

  test("ArrowUp moves focus from second trigger to first", async ({ page }) => {
    await triggerWhy(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(triggerWhat(page)).toBeFocused();
  });

  test("ArrowDown wraps from last trigger to first (WAI-ARIA: circular)", async ({ page }) => {
    await triggerWhy(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(triggerWhat(page)).toBeFocused();
  });

  test("Home moves focus to first trigger from any position", async ({ page }) => {
    await triggerWhy(page).focus();
    await page.keyboard.press("Home");
    await expect(triggerWhat(page)).toBeFocused();
  });

  test("End moves focus to last trigger", async ({ page }) => {
    await triggerWhat(page).focus();
    await page.keyboard.press("End");
    await expect(triggerWhy(page)).toBeFocused();
  });

  test("Enter key toggles the focused accordion item", async ({ page }) => {
    await triggerWhat(page).focus();
    await page.keyboard.press("Enter");
    await expect(contentWhat(page)).toBeVisible();
  });

  test("Space key toggles the focused accordion item", async ({ page }) => {
    await triggerWhat(page).focus();
    await page.keyboard.press(" ");
    await expect(contentWhat(page)).toBeVisible();
  });

  // WAI-ARIA §3.1: trigger aria-controls must point to content, content
  // role=region must have aria-labelledby pointing back to the trigger.
  test("trigger aria-controls points to content id", async ({ page }) => {
    const controlsId = await triggerWhat(page).getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    await expect(contentWhat(page)).toHaveAttribute("id", controlsId!);
  });

  test("content role=region has aria-labelledby pointing to its trigger", async ({ page }) => {
    const triggerId = await triggerWhat(page).getAttribute("id");
    await expect(contentWhat(page)).toHaveAttribute("role", "region");
    await expect(contentWhat(page)).toHaveAttribute("aria-labelledby", triggerId!);
  });
});
