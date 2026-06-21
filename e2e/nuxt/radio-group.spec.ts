import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("RadioGroup — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const radioReact = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="radio-item-react"] [role="radio"]');
  const radioVue = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="radio-item-vue"] [role="radio"]');
  const radioAngular = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="radio-item-angular"] [role="radio"]');

  test("React radio is checked on load", async ({ page }) => {
    await expect(radioReact(page)).toHaveAttribute("aria-checked", "true");
  });

  test("Vue radio is unchecked on load", async ({ page }) => {
    await expect(radioVue(page)).toHaveAttribute("aria-checked", "false");
  });

  test("clicking Vue radio selects it", async ({ page }) => {
    await radioVue(page).click();
    await expect(radioVue(page)).toHaveAttribute("aria-checked", "true");
  });

  test("clicking Vue radio deselects React", async ({ page }) => {
    await radioVue(page).click();
    await expect(radioReact(page)).toHaveAttribute("aria-checked", "false");
  });

  test("ArrowDown moves focus from React to Vue", async ({ page }) => {
    await radioReact(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(radioVue(page)).toBeFocused();
  });

  test("ArrowUp moves focus from Vue to React", async ({ page }) => {
    await radioReact(page).click();
    await radioVue(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(radioReact(page)).toBeFocused();
  });

  test("radios have role=radio", async ({ page }) => {
    await expect(radioReact(page)).toHaveAttribute("role", "radio");
    await expect(radioVue(page)).toHaveAttribute("role", "radio");
    await expect(radioAngular(page)).toHaveAttribute("role", "radio");
  });
});
