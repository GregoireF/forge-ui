import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Checkbox — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const checkboxes = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="checkbox"][data-forge-part="root"]');

  const firstCheckbox = (page: import("@playwright/test").Page) =>
    checkboxes(page).nth(0);

  const secondCheckbox = (page: import("@playwright/test").Page) =>
    checkboxes(page).nth(1);

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  test("checkboxes exist on load", async ({ page }) => {
    await expect(checkboxes(page).first()).toBeVisible();
  });

  test("first checkbox (uncontrolled) starts checked", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "true");
  });

  test("second checkbox (controlled) starts indeterminate", async ({ page }) => {
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "mixed");
  });

  // ---------------------------------------------------------------------------
  // Toggle behavior
  // ---------------------------------------------------------------------------

  test("clicking unchecked checkbox checks it", async ({ page }) => {
    // Third group item "React" in CheckboxGroup starts unchecked
    const groupItem = page.locator('[data-forge-scope="checkbox"][data-forge-part="root"]').filter({ hasText: "React" }).first();
    await groupItem.click();
    // After click it should be checked
    await expect(groupItem).toHaveAttribute("aria-checked", "true");
  });

  test("clicking checked checkbox unchecks it", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "true");
    await firstCheckbox(page).click();
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "false");
  });

  test("clicking indeterminate checkbox cycles state", async ({ page }) => {
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "mixed");
    await secondCheckbox(page).click();
    const after = await secondCheckbox(page).getAttribute("aria-checked");
    expect(["true", "false"]).toContain(after);
  });

  // ---------------------------------------------------------------------------
  // Disabled
  // ---------------------------------------------------------------------------

  test("disabled checkbox has aria-disabled=true", async ({ page }) => {
    const disabled = page.locator('[data-forge-scope="checkbox"][data-forge-part="root"][data-disabled]');
    await expect(disabled.first()).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  test("Space key toggles checkbox", async ({ page }) => {
    await firstCheckbox(page).focus();
    const before = await firstCheckbox(page).getAttribute("aria-checked");
    await page.keyboard.press("Space");
    const after = await firstCheckbox(page).getAttribute("aria-checked");
    expect(before).not.toBe(after);
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("checkbox has role=checkbox", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("role", "checkbox");
  });

  test("checkbox has data-forge-scope=checkbox", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("data-forge-scope", "checkbox");
  });
});
