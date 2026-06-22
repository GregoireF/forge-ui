import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("TagsInput — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const root = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="root"]');

  const tagInput = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="input"]');

  const tags = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="tags-input"][data-forge-part="tag"]');

  test("tags input root is visible", async ({ page }) => {
    await expect(root(page)).toBeVisible();
  });

  test("initial tag TypeScript is visible", async ({ page }) => {
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("TypeScript")).toBeVisible();
  });

  test("initial tag Nuxt is visible", async ({ page }) => {
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("Nuxt")).toBeVisible();
  });

  test("input is focusable", async ({ page }) => {
    await tagInput(page).focus();
    await expect(tagInput(page)).toBeFocused();
  });

  test("Enter key adds a new tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).fill("React");
    await page.keyboard.press("Enter");
    await expect(tags(page)).toHaveCount(countBefore + 1);
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("React")).toBeVisible();
  });

  test("clicking × on a tag removes it", async ({ page }) => {
    const countBefore = await tags(page).count();
    await page.locator('[data-forge-scope="tags-input"][data-forge-part="tag-delete"]').first().click();
    await expect(tags(page)).toHaveCount(countBefore - 1);
  });

  test("Backspace on empty input removes last tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).focus();
    await page.keyboard.press("Backspace");
    await expect(tags(page)).toHaveCount(countBefore - 1);
  });

  // onBlur with pending text commits the tag (connect sends ADD_TAG before BLUR)
  test("blurring input with text commits the pending tag", async ({ page }) => {
    const countBefore = await tags(page).count();
    await tagInput(page).fill("SvelteKit");
    await page.mouse.click(5, 5); // blur away
    await expect(tags(page)).toHaveCount(countBefore + 1);
    await expect(page.locator('[data-forge-scope="tags-input"]').getByText("SvelteKit")).toBeVisible();
  });
});
