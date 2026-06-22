import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Popover — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.getByRole("button", { name: "Ouvrir popover" });

  const content = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="popover"][data-forge-part="content"]').first();

  test("popover is hidden on load", async ({ page }) => {
    await expect(content(page)).not.toBeVisible();
  });

  test("opens on trigger click", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
  });

  test("closes on × button", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.locator('[data-forge-scope="popover"][data-forge-part="close"]').first().click();
    await expect(content(page)).not.toBeVisible();
  });

  test("closes on Escape", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(content(page)).not.toBeVisible();
  });

  test("closes on outside click", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(content(page)).not.toBeVisible();
  });

  test("trigger has data-state=closed on load", async ({ page }) => {
    await expect(trigger(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has aria-expanded=false on load", async ({ page }) => {
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await trigger(page).click();
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("trigger has aria-haspopup", async ({ page }) => {
    const val = await trigger(page).getAttribute("aria-haspopup");
    expect(val).toBeTruthy();
  });

  test("content has data-state=open when open", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("data-state", "open");
  });

  test("content has data-forge-scope=popover", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("data-forge-scope", "popover");
  });

  test("content is rendered in body (portal)", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    const isBodyChild = await page.evaluate(() => {
      const el = document.querySelector('[data-forge-scope="popover"][data-forge-part="content"]');
      return el?.closest("body") !== null;
    });
    expect(isBodyChild).toBe(true);
  });

  // WAI-ARIA §3.10: focus returns to trigger after closing
  test("focus returns to trigger after closing with Escape", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(content(page)).not.toBeVisible();
    await expect(trigger(page)).toBeFocused();
  });

  test("focus returns to trigger after closing with × button", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.locator('[data-forge-scope="popover"][data-forge-part="close"]').first().click();
    await expect(content(page)).not.toBeVisible();
    await expect(trigger(page)).toBeFocused();
  });
});
