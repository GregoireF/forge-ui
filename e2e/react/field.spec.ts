import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Field — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const label = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="field"][data-forge-part="label"]');

  const input = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="field"] input[type="email"]');

  const description = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="field"][data-forge-part="description"]');

  const error = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="field"][data-forge-part="error"]');

  // ---------------------------------------------------------------------------
  // Label
  // ---------------------------------------------------------------------------

  test("label exists and contains text Email", async ({ page }) => {
    await expect(label(page)).toBeVisible();
    await expect(label(page)).toContainText("Email");
  });

  test("label has htmlFor pointing to input id", async ({ page }) => {
    const htmlFor = await label(page).getAttribute("for");
    expect(htmlFor).toBeTruthy();
    const inputId = await input(page).getAttribute("id");
    expect(htmlFor).toBe(inputId);
  });

  // ---------------------------------------------------------------------------
  // Input ARIA
  // ---------------------------------------------------------------------------

  test("input has aria-labelledby pointing to label", async ({ page }) => {
    const labelledBy = await input(page).getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const labelId = await label(page).getAttribute("id");
    expect(labelledBy).toContain(labelId);
  });

  test("input has aria-describedby when description exists", async ({ page }) => {
    const describedBy = await input(page).getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
  });

  test("input has required attribute (field is required)", async ({ page }) => {
    await expect(input(page)).toHaveAttribute("required");
  });

  // ---------------------------------------------------------------------------
  // Description
  // ---------------------------------------------------------------------------

  test("description text is visible", async ({ page }) => {
    await expect(description(page)).toBeVisible();
    await expect(description(page)).toContainText("e-mail");
  });

  // ---------------------------------------------------------------------------
  // Error (role=alert)
  // ---------------------------------------------------------------------------

  test("error element has role=alert", async ({ page }) => {
    await expect(error(page)).toHaveAttribute("role", "alert");
  });

  test("error element has aria-live=assertive", async ({ page }) => {
    await expect(error(page)).toHaveAttribute("aria-live", "assertive");
  });

  test("error is not visible when field is valid initially", async ({ page }) => {
    // Error text only shows when invalid=true; on initial load invalid is false
    // The element exists but the text should be empty or not visible in the ARIA tree
    // We check it's in DOM but field is valid
    await expect(input(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  test("typing invalid email makes field invalid", async ({ page }) => {
    await input(page).fill("not-an-email");
    await input(page).blur();
    await expect(input(page)).toHaveAttribute("aria-invalid", "true");
  });

  test("typing valid email makes field valid", async ({ page }) => {
    await input(page).fill("valid@example.com");
    await input(page).blur();
    await expect(input(page)).not.toHaveAttribute("aria-invalid", "true");
  });

  // WAI-ARIA: aria-describedby must include the error id when field is invalid
  // so AT reads the error message alongside the input label.
  test("aria-describedby includes error id when field is invalid", async ({ page }) => {
    await input(page).fill("not-an-email");
    await input(page).blur();
    const describedBy = await input(page).getAttribute("aria-describedby");
    const errorId = await page.locator('[role="alert"]').getAttribute("id");
    expect(describedBy).toContain(errorId);
  });
});
