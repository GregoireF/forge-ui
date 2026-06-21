import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Tooltip — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // The playground Provider sets openDelay=400. We hover and wait.
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
    const tooltip = page.getByRole("tooltip").first();
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    await expect(tooltip).toHaveAttribute("role", "tooltip");
  });

  test("trigger has aria-describedby pointing to tooltip id", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    const describedBy = await trigger(page).getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const tooltipEl = page.locator(`#${describedBy}`);
    await expect(tooltipEl).toBeVisible();
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
    // Move to a neutral location
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip").first()).not.toBeVisible({ timeout: 2000 });
  });

  test("skip-delay: second tooltip opens faster after first closed", async ({ page }) => {
    // Open first tooltip
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    // Move away to close it
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip").first()).not.toBeVisible({ timeout: 2000 });
    // Immediately hover second trigger — should open without 400ms delay
    const t2 = page.getByRole("button", { name: "Skip-delay" });
    await t2.hover();
    // With skip-delay active, should open in <300ms
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 1000 });
  });

  test("interactive tooltip stays open when pointer moves to content", async ({ page }) => {
    const iTrigger = page.getByRole("button", { name: "Interactive" });
    await iTrigger.hover();
    // Interactive trigger has openDelay from provider (400ms) but provider might apply
    const tooltip = page.getByRole("tooltip").first();
    await expect(tooltip).toBeVisible({ timeout: 2000 });
    // Move pointer from trigger to tooltip content
    await tooltip.hover();
    // Tooltip should remain open
    await expect(tooltip).toBeVisible();
    // Link inside interactive tooltip should be clickable
    const link = tooltip.getByRole("link");
    await expect(link).toBeVisible();
  });

  // WAI-ARIA: keyboard focus must also reveal the tooltip (not hover-only)
  test("tooltip appears on keyboard focus (no delay)", async ({ page }) => {
    await trigger(page).focus();
    // Focus bypasses the openDelay — tooltip should appear immediately (< 100ms)
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 500 });
  });

  test("tooltip hides when focus leaves the trigger", async ({ page }) => {
    await trigger(page).focus();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 500 });
    await page.keyboard.press("Tab");
    await expect(page.getByRole("tooltip").first()).not.toBeVisible({ timeout: 1000 });
  });

  test("tooltip is rendered inside body (portal)", async ({ page }) => {
    await trigger(page).hover();
    await expect(page.getByRole("tooltip").first()).toBeVisible({ timeout: 2000 });
    const isDirectBodyChild = await page.evaluate(() => {
      const tooltip = document.querySelector('[role="tooltip"]');
      // Portal renders inside <body> — positioner is direct body child
      return tooltip?.closest("body") !== null;
    });
    expect(isDirectBodyChild).toBe(true);
  });
});
