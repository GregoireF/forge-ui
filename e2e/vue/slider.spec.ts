import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("Slider — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const thumb = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="slider-thumb"]');
  const track = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="slider-track"]');
  const valueDisplay = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="slider-value"]');

  test("slider thumb exists with role=slider", async ({ page }) => {
    await expect(thumb(page)).toHaveAttribute("role", "slider");
  });

  test("aria-valuenow is 50 initially", async ({ page }) => {
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "-1");
    expect(valuenow).toBe(50);
  });

  test("aria-valuemin is 0", async ({ page }) => {
    const valuemin = parseInt(await thumb(page).getAttribute("aria-valuemin") ?? "-1");
    expect(valuemin).toBe(0);
  });

  test("aria-valuemax is 100", async ({ page }) => {
    const valuemax = parseInt(await thumb(page).getAttribute("aria-valuemax") ?? "-1");
    expect(valuemax).toBe(100);
  });

  test("track is visible", async ({ page }) => {
    await expect(track(page)).toBeVisible();
  });

  test("value display shows 50", async ({ page }) => {
    await expect(valueDisplay(page)).toContainText("50");
  });

  test("ArrowRight increments value by 1", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("ArrowRight");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(51);
  });

  test("ArrowLeft decrements value by 1", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("ArrowLeft");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(49);
  });

  test("Home sets value to min (0)", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("Home");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "-1");
    expect(valuenow).toBe(0);
  });

  test("End sets value to max (100)", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("End");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "-1");
    expect(valuenow).toBe(100);
  });

  // WAI-ARIA §3.23: PageUp/PageDown move by a large step (10% of range = 10 on [0,100])
  test("PageUp increments value by 10% of range", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("PageUp");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(60);
  });

  test("PageDown decrements value by 10% of range", async ({ page }) => {
    await thumb(page).focus();
    await page.keyboard.press("PageDown");
    const valuenow = parseInt(await thumb(page).getAttribute("aria-valuenow") ?? "0");
    expect(valuenow).toBe(40);
  });
});
