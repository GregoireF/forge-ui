import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("AlertDialog — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="alert-dialog"][data-forge-part="trigger"]');

  const content = (page: import("@playwright/test").Page) =>
    page.getByRole("alertdialog");

  test("alertdialog is hidden on load", async ({ page }) => {
    await expect(content(page)).not.toBeVisible();
  });

  test("opens on trigger click", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
  });

  test("cancel button closes it", async ({ page }) => {
    await trigger(page).click();
    await page.locator('[data-forge-scope="alert-dialog"][data-forge-part="cancel"]').click();
    await expect(content(page)).not.toBeVisible();
  });

  test("Escape does NOT close alert dialog", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(content(page)).toBeVisible();
  });

  test("outside click does NOT close alert dialog", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(content(page)).toBeVisible();
  });

  test("has role=alertdialog", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("role", "alertdialog");
  });

  test("has aria-modal=true", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("aria-modal", "true");
  });

  test("has accessible name via aria-labelledby", async ({ page }) => {
    await trigger(page).click();
    const labelledBy = await content(page).getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test("has description via aria-describedby", async ({ page }) => {
    await trigger(page).click();
    const describedBy = await content(page).getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test("content has data-state=open when open", async ({ page }) => {
    await trigger(page).click();
    await expect(content(page)).toHaveAttribute("data-state", "open");
  });

  test("trigger has data-state=closed on load", async ({ page }) => {
    await expect(trigger(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has data-state=open when open", async ({ page }) => {
    await trigger(page).click();
    await expect(trigger(page)).toHaveAttribute("data-state", "open");
  });

  // WAI-ARIA §3.2: focus MUST move inside the alertdialog on open
  test("focus moves inside alert dialog on open", async ({ page }) => {
    await trigger(page).click();
    const dialog = content(page);
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  test("focus returns to trigger after cancel", async ({ page }) => {
    await trigger(page).click();
    await page.locator('[data-forge-scope="alert-dialog"][data-forge-part="cancel"]').click();
    await expect(trigger(page)).toBeFocused();
  });

  // WAI-ARIA §3.2 focus trap: Tab MUST NOT escape the alert dialog
  test("Tab key wraps focus within alert dialog", async ({ page }) => {
    await trigger(page).click();
    const dialog = content(page);
    const actionBtn = page.locator('[data-forge-scope="alert-dialog"][data-forge-part="action"]');
    await actionBtn.focus();
    await page.keyboard.press("Tab");
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  // WAI-ARIA §3.2 focus trap: Shift+Tab MUST NOT escape the alert dialog
  test("Shift+Tab key wraps focus within alert dialog", async ({ page }) => {
    await trigger(page).click();
    const dialog = content(page);
    await dialog.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  test("content is rendered in body (portal)", async ({ page }) => {
    await trigger(page).click();
    const isBodyChild = await page.evaluate(() => {
      const el = document.querySelector('[role="alertdialog"]');
      return el?.closest("body") !== null;
    });
    expect(isBodyChild).toBe(true);
  });
});
