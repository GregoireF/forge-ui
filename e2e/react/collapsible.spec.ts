import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Collapsible — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="collapsible-trigger"]');

  const content = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="collapsible-content"]');

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  test("content is hidden on load", async ({ page }) => {
    await expect(content(page)).not.toBeVisible();
  });

  test("trigger is visible on load", async ({ page }) => {
    await expect(trigger(page)).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------------------------

  test("clicking trigger reveals content", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
  });

  test("clicking trigger again hides content", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await trigger(page).click();
    await expect(content(page)).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has aria-expanded=false when closed", async ({ page }) => {
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await trigger(page).click();
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("trigger has aria-controls pointing to content", async ({ page }) => {
    const controls = await trigger(page).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    const contentId = await content(page).getAttribute("id");
    expect(controls).toBe(contentId);
  });

  // ---------------------------------------------------------------------------
  // Data attributes
  // ---------------------------------------------------------------------------

  test("trigger has data-state=closed when collapsed", async ({ page }) => {
    await expect(trigger(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has data-state=open when expanded", async ({ page }) => {
    await trigger(page).click();
    await expect(trigger(page)).toHaveAttribute("data-state", "open");
  });

  test("content has data-state=open when visible", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("data-state", "open");
  });

  test("content has data-forge-scope=collapsible", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("data-forge-scope", "collapsible");
  });
});
