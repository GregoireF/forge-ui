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
});
