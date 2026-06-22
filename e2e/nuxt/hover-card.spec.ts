import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("HoverCard — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.getByText("@forge-ui").first();

  const content = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="hover-card"][data-forge-part="content"]').first();

  test("hover card is hidden on load", async ({ page }) => {
    await expect(content(page)).not.toBeVisible();
  });

  test("hover on trigger shows content after delay", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
  });

  test("content shows text about forge-ui", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await expect(content(page)).toContainText("forge-ui");
  });

  test("content stays open when pointer moves into it", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await content(page).hover();
    await expect(content(page)).toBeVisible();
  });

  test("content closes when pointer leaves", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await page.mouse.move(0, 0);
    await expect(content(page)).not.toBeVisible({ timeout: 2000 });
  });

  test("trigger has aria-haspopup=dialog", async ({ page }) => {
    const haspopup = await trigger(page).getAttribute("aria-haspopup");
    expect(haspopup).toBe("dialog");
  });

  test("content has data-state=open when visible", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await expect(content(page)).toHaveAttribute("data-state", "open");
  });

  test("content is rendered in body (portal)", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    const isBodyChild = await page.evaluate(() => {
      const el = document.querySelector('[data-forge-scope="hover-card"][data-forge-part="content"]');
      return el?.closest("body") !== null;
    });
    expect(isBodyChild).toBe(true);
  });

  // WAI-ARIA: focus also opens hover card without delay
  test("hover card opens immediately on keyboard focus", async ({ page }) => {
    await trigger(page).focus();
    await expect(content(page)).toBeVisible({ timeout: 500 });
  });

  test("hover card closes when focus leaves", async ({ page }) => {
    await trigger(page).focus();
    await expect(content(page)).toBeVisible({ timeout: 500 });
    await page.keyboard.press("Tab");
    await expect(content(page)).not.toBeVisible({ timeout: 1000 });
  });
});
