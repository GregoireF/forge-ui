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
});
