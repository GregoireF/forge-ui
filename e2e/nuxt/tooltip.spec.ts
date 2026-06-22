import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Tooltip — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.getByRole("button", { name: "Survol (400ms)" });

  test("tooltip is not visible on load", async ({ page }) => {
    await expect(page.getByRole("tooltip")).not.toBeVisible();
  });

  test("tooltip appears on hover after openDelay", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
  });

  test("tooltip has role=tooltip", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    await expect(page.getByRole("tooltip").first()).toHaveAttribute("role", "tooltip");
  });

  test("trigger has aria-describedby pointing to tooltip id", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    const describedBy = await trigger(page).getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test("tooltip closes on Escape", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip").first()).not.toBeVisible();
  });

  test("tooltip closes when pointer moves away", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip").first()).not.toBeVisible({ timeout: 2000 });
  });

  test("interactive tooltip stays open when pointer moves to content", async ({ page }) => {
    const iTrigger = page.getByRole("button", { name: "Interactive" });
    await iTrigger.hover();
    const tooltip = page.getByRole("tooltip").first();
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await tooltip.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip.getByRole("link")).toBeVisible();
  });

  // WAI-ARIA: keyboard focus must also reveal the tooltip (no delay)
  test("tooltip appears on keyboard focus (no delay)", async ({ page }) => {
    await trigger(page).focus();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 500 });
  });

  test("tooltip hides when focus leaves the trigger", async ({ page }) => {
    await trigger(page).focus();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 500 });
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tooltip").first()).not.toBeVisible({ timeout: 1000 });
  });
});
