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

  test("switches exist on load", async ({ page }) => {
    await expect(page.getByRole("switch")).toHaveCount(3);
  });

  test("first switch starts unchecked", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
  });

  test("second switch starts checked and disabled", async ({ page }) => {
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
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

  // WAI-ARIA: aria-disabled informs AT the switch cannot be interacted with,
  // even though it is visible and focusable.
  test("disabled switch has aria-disabled=true", async ({ page }) => {
    await expect(disabledSwitch(page)).toHaveAttribute("aria-disabled", "true");
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

  test("switch has data-forge-scope=switch", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("data-forge-scope", "switch");
  });

  test("switch has data-state=off initially", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("data-state", "off");
  });

  test("switch has data-state=on after toggle", async ({ page }) => {
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("data-state", "on");
  });
});
