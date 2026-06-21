import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Switch — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const switches = (page: import("@playwright/test").Page) =>
    page.getByRole("switch");

  const firstSwitch = (page: import("@playwright/test").Page) =>
    switches(page).nth(0);

  const disabledSwitch = (page: import("@playwright/test").Page) =>
    switches(page).nth(1);

  const invalidSwitch = (page: import("@playwright/test").Page) =>
    switches(page).nth(2);

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  test("switches exist on load", async ({ page }) => {
    await expect(firstSwitch(page)).toBeVisible();
  });

  test("first switch starts unchecked (off)", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
  });

  test("second switch starts checked and disabled", async ({ page }) => {
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("invalid switch has aria-invalid=true", async ({ page }) => {
    await expect(invalidSwitch(page)).toHaveAttribute("aria-invalid", "true");
  });

  // ---------------------------------------------------------------------------
  // Toggle
  // ---------------------------------------------------------------------------

  test("clicking first switch turns it on", async ({ page }) => {
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  test("clicking first switch again turns it off", async ({ page }) => {
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "true");
    await firstSwitch(page).click();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
  });

  test("disabled switch does not toggle on click", async ({ page }) => {
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
    await disabledSwitch(page).click({ force: true });
    await expect(disabledSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  // ---------------------------------------------------------------------------
  // Keyboard
  // ---------------------------------------------------------------------------

  test("Space key toggles switch", async ({ page }) => {
    await firstSwitch(page).focus();
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "false");
    await page.keyboard.press("Space");
    await expect(firstSwitch(page)).toHaveAttribute("aria-checked", "true");
  });

  // ---------------------------------------------------------------------------
  // ARIA / data attributes
  // ---------------------------------------------------------------------------

  test("switch has role=switch", async ({ page }) => {
    await expect(firstSwitch(page)).toHaveAttribute("role", "switch");
  });

  test("switch has data-forge-scope=switch", async ({ page }) => {
    const el = page.locator('[data-forge-scope="switch"][data-forge-part="root"]').first();
    await expect(el).toHaveAttribute("data-forge-scope", "switch");
  });

  test("switch has data-state=off initially", async ({ page }) => {
    const root = page.locator('[data-forge-scope="switch"][data-forge-part="root"]').first();
    await expect(root).toHaveAttribute("data-state", "off");
  });

  test("switch has data-state=on after toggle", async ({ page }) => {
    const root = page.locator('[data-forge-scope="switch"][data-forge-part="root"]').first();
    await firstSwitch(page).click();
    await expect(root).toHaveAttribute("data-state", "on");
  });
});
