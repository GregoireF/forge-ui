import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Progress — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const track = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="progress-track"]');
  const indeterminate = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="progress-indeterminate"]');

  test("progressbar exists with role=progressbar", async ({ page }) => {
    await expect(track(page)).toHaveAttribute("role", "progressbar");
  });

  test("aria-valuenow is 42 initially", async ({ page }) => {
    const valuenow = parseInt(await track(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(42);
  });

  test("aria-valuemin is 0", async ({ page }) => {
    const valuemin = parseInt(await track(page).getAttribute("aria-valuemin") ?? "-1");
    expect(valuemin).toBe(0);
  });

  test("aria-valuemax is 100", async ({ page }) => {
    const valuemax = parseInt(await track(page).getAttribute("aria-valuemax") ?? "-1");
    expect(valuemax).toBe(100);
  });

  test("+10 button increases value to 52", async ({ page }) => {
    await page.getByRole("button", { name: "+10" }).first().click();
    const valuenow = parseInt(await track(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(52);
  });

  test("−10 button decreases value to 32", async ({ page }) => {
    await page.getByRole("button", { name: "−10" }).first().click();
    const valuenow = parseInt(await track(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(32);
  });

  test("indeterminate progress root exists", async ({ page }) => {
    await expect(indeterminate(page)).toBeVisible();
  });

  test("indeterminate progressbar has no aria-valuenow", async ({ page }) => {
    const indeterminateTrack = indeterminate(page).locator('[role="progressbar"]');
    const valuenow = await indeterminateTrack.getAttribute("aria-valuenow");
    expect(valuenow).toBeNull();
  });
});
