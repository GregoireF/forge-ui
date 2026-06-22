import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("Checkbox — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const firstCheckbox = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="checkbox"][data-forge-part="root"]').nth(0);

  const secondCheckbox = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="checkbox"][data-forge-part="root"]').nth(1);

  test("checkboxes exist on load", async ({ page }) => {
    await expect(firstCheckbox(page)).toBeVisible();
  });

  test("first checkbox starts checked", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "true");
  });

  test("second checkbox starts indeterminate", async ({ page }) => {
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "mixed");
  });

  test("clicking unchecked checkbox checks it", async ({ page }) => {
    await firstCheckbox(page).click(); // → unchecked
    await firstCheckbox(page).click(); // → checked
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "true");
  });

  test("clicking checked checkbox unchecks it", async ({ page }) => {
    await firstCheckbox(page).click();
    await expect(firstCheckbox(page)).toHaveAttribute("aria-checked", "false");
  });

  test("Space key toggles checkbox", async ({ page }) => {
    await firstCheckbox(page).focus();
    const before = await firstCheckbox(page).getAttribute("aria-checked");
    await page.keyboard.press("Space");
    const after = await firstCheckbox(page).getAttribute("aria-checked");
    expect(before).not.toBe(after);
  });

  test("checkbox has role=checkbox", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("role", "checkbox");
  });

  test("disabled checkbox has data-disabled attribute", async ({ page }) => {
    const disabled = page.locator('[data-forge-scope="checkbox"][data-forge-part="root"][data-disabled]');
    await expect(disabled.first()).toBeVisible();
  });

  // WAI-ARIA: disabled checkbox must expose aria-disabled=true so AT can
  // announce it is non-interactive, not just visually dimmed.
  test("disabled checkbox has aria-disabled=true", async ({ page }) => {
    const thirdCheckbox = page.locator('[data-forge-scope="checkbox"][data-forge-part="root"]').nth(2);
    await expect(thirdCheckbox).toHaveAttribute("aria-disabled", "true");
  });

  test("checkbox has data-forge-scope=checkbox", async ({ page }) => {
    await expect(firstCheckbox(page)).toHaveAttribute("data-forge-scope", "checkbox");
  });

  test("clicking indeterminate checkbox cycles state", async ({ page }) => {
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "mixed");
    await secondCheckbox(page).click();
    const after = await secondCheckbox(page).getAttribute("aria-checked");
    expect(["true", "false"]).toContain(after);
  });

  // WAI-ARIA §3.7: clicking indeterminate → checked (not unchecked)
  test("clicking indeterminate checkbox transitions to checked (WAI-ARIA §3.7)", async ({ page }) => {
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "mixed");
    await secondCheckbox(page).click();
    await expect(secondCheckbox(page)).toHaveAttribute("aria-checked", "true");
  });
});
