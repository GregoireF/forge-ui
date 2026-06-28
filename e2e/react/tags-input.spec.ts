import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("TagsInput — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const root = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="root"]');

  const tagInput = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="input"]');

  const tags = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="tag"]');

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  test("tags input root is visible", async ({ page }) => {
    await expect(root(page)).toBeVisible();
  });

  test("initial tag TypeScript is visible", async ({ page }) => {
    await expect(
      page.locator('[data-forge-scope="tags-input"]').getByText("TypeScript"),
    ).toBeVisible();
  });

  test("initial tag React is visible", async ({ page }) => {
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("React")).toBeVisible();
  });

  test("input is focusable", async ({ page }) => {
    await tagInput(page).focus();
    await expect(tagInput(page)).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // Adding tags
  // ---------------------------------------------------------------------------

  test("Enter key adds a new tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).fill("Nuxt");
    await page.keyboard.press("Enter");
    await expect(tags(page)).toHaveCount(countBefore + 1);
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("Nuxt")).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Removing tags
  // ---------------------------------------------------------------------------

  test("clicking × on a tag removes it", async ({ page }) => {
    const countBefore = await tags(page).count();
    const deleteBtn = page
      .locator('[data-forge-scope="tags-input"][data-forge-part="tag-delete"]')
      .first();
    await deleteBtn.click();
    await expect(tags(page)).toHaveCount(countBefore - 1);
  });

  test("Backspace on empty input removes last tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).focus();
    await page.keyboard.press("Backspace");
    await expect(tags(page)).toHaveCount(countBefore - 1);
  });

  // WAI-ARIA: delete button aria-label must include the tag value so AT
  // announces which tag will be removed, not just "button".
  test("tag delete button has aria-label containing tag value", async ({ page }) => {
    const deleteBtn = page
      .locator('[data-forge-scope="tags-input"][data-forge-part="tag-delete"]')
      .first();
    const label = await deleteBtn.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label).toContain("TypeScript");
  });

  // WAI-ARIA: input aria-labelledby must point to the label element
  test("input has aria-labelledby pointing to label", async ({ page }) => {
    const labelledBy = await tagInput(page).getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const labelEl = page.locator(`#${labelledBy}`);
    await expect(labelEl).toBeVisible();
  });

  // onBlur with pending text commits the tag (connect sends ADD_TAG before BLUR)
  test("blurring input with text commits the pending tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).fill("SvelteKit");
    await page.mouse.click(5, 5); // blur away
    await expect(tags(page)).toHaveCount(countBefore + 1);
    await expect(
      page.locator('[data-forge-scope="tags-input"]').getByText("SvelteKit"),
    ).toBeVisible();
  });

  // WAI-ARIA: a live region lets AT announce tag add/remove without interrupting the user.
  test("live region exists with role=status and aria-live=polite", async ({ page }) => {
    const liveRegion = page
      .locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]')
      .first();
    await expect(liveRegion).toBeAttached();
    await expect(liveRegion).toHaveAttribute("role", "status");
    await expect(liveRegion).toHaveAttribute("aria-live", "polite");
    await expect(liveRegion).toHaveAttribute("aria-atomic", "true");
  });

  test("live region announces added tag", async ({ page }) => {
    const liveRegion = page
      .locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]')
      .first();
    await tagInput(page).fill("Svelte");
    await tagInput(page).press("Enter");
    await expect(liveRegion).toContainText("Svelte");
    await expect(liveRegion).toContainText("added");
  });
});
