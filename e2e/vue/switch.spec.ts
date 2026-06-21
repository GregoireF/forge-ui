import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("Switch — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const firstSwitch = (page: import("@playwright/test").Page) =>
    page.getByRole("switch").nth(0);

  const disabledSwitch = (page: import("@playwright/test").Page) =>
    page.getByRole("switch").nth(1);

  const invalidSwitch = (page: import("@playwright/test").Page) =>
    page.getByRole("switch").nth(2);

  test("first switch starts unchecked", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
  });

  test("clicking first switch turns it on", async ({ page }) => {
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("clicking again turns it off", async ({ page }) => {
    await firstSwitch(page).click();
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
  });

  test("disabled switch does not toggle", async ({ page }) => {
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
    await disabledSwitch(page).click({ force: true });
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("invalid switch has aria-invalid=true", async ({ page }) => {
    await expect(invalidSwitch(page)).toHaveAttribute("aria-invalid", "true");
  });

  test("Space key toggles switch", async ({ page }) => {
    await firstSwitch(page).focus();
    await page.keyboard.press("Space");
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("switch has role=switch", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("role", "switch");
  });
});
