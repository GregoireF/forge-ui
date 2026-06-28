import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("Progress — Vue (forge-ui)", () => {
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
    const valuenow = parseInt((await track(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(42);
  });

  test("aria-valuemin is 0", async ({ page }) => {
    const valuemin = parseInt((await track(page).getAttribute("aria-valuemin")) ?? "-1", 10);
    expect(valuemin).toBe(0);
  });

  test("aria-valuemax is 100", async ({ page }) => {
    const valuemax = parseInt((await track(page).getAttribute("aria-valuemax")) ?? "-1", 10);
    expect(valuemax).toBe(100);
  });

  test("fill is visible", async ({ page }) => {
    await expect(
      page.locator('[data-forge-scope="progress"][data-forge-part="fill"]').first(),
    ).toBeVisible();
  });

  test("value text element is visible", async ({ page }) => {
    await expect(
      page.locator('[data-forge-scope="progress"][data-forge-part="value-text"]').first(),
    ).toBeVisible();
  });

  test("+10 button increases value to 52", async ({ page }) => {
    await page.getByRole("button", { name: "+10" }).first().click();
    const valuenow = parseInt((await track(page).getAttribute("aria-valuenow")) ?? "0", 10);
    expect(valuenow).toBe(52);
  });

  test("−10 button decreases value to 32", async ({ page }) => {
    await page.getByRole("button", { name: "−10" }).first().click();
    const valuenow = parseInt((await track(page).getAttribute("aria-valuenow")) ?? "0", 10);
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

  test("indeterminate progressbar has data-state=indeterminate", async ({ page }) => {
    const indeterminateTrack = indeterminate(page).locator('[role="progressbar"]');
    await expect(indeterminateTrack).toHaveAttribute("data-state", "indeterminate");
  });

  // WAI-ARIA §3.14: aria-valuetext provides human-readable description
  // so AT announces "loading" instead of silence for indeterminate progress.
  test("aria-valuetext shows percentage for determinate progress", async ({ page }) => {
    await expect(track(page)).toHaveAttribute("aria-valuetext", "42%");
  });

  test('aria-valuetext is "loading" for indeterminate progress', async ({ page }) => {
    const indeterminateTrack = indeterminate(page).locator('[role="progressbar"]');
    await expect(indeterminateTrack).toHaveAttribute("aria-valuetext", "loading");
  });

  // WAI-ARIA §3.14: progressbar must have an accessible name.
  // The playground passes aria-label via prop passthrough — verify it reaches the DOM.
  test("progressbar has an accessible name via aria-label", async ({ page }) => {
    const label = await track(page).getAttribute("aria-label");
    expect(label).toBeTruthy();
  });
});
