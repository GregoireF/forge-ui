import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Accordion — Nuxt (forge-ui)", () => {
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

  test("both content panels are hidden on load", async ({ page }) => {
    await expect(contentWhat(page)).not.toBeVisible();
    await expect(contentWhy(page)).not.toBeVisible();
  });

  test("clicking first trigger opens first panel", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toBeVisible();
  });

  test("in single mode, opening second closes first", async ({ page }) => {
    await triggerWhat(page).click();
    await triggerWhy(page).click();
    await expect(contentWhy(page)).toBeVisible();
    await expect(contentWhat(page)).not.toBeVisible();
  });

  test("clicking open trigger again closes it (collapsible)", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(contentWhat(page)).toBeVisible();
    await triggerWhat(page).click();
    await expect(contentWhat(page)).not.toBeVisible();
  });

  test("trigger has aria-expanded=false when closed", async ({ page }) => {
    await expect(triggerWhat(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(triggerWhat(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("trigger has data-state=closed when panel closed", async ({ page }) => {
    await expect(triggerWhat(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has data-state=open when panel open", async ({ page }) => {
    await triggerWhat(page).click();
    await expect(triggerWhat(page)).toHaveAttribute("data-state", "open");
  });
});
