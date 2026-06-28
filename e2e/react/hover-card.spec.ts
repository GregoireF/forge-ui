import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("HoverCard — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const trigger = (page: import("@playwright/test").Page) => page.getByText("@forge-ui").first();

  const content = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="hover-card"][data-forge-part="content"]').first();

  // ---------------------------------------------------------------------------
  // Visibility
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // Grace period — stays open when moving into content
  // ---------------------------------------------------------------------------

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

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has aria-haspopup=dialog", async ({ page }) => {
    const haspopup = await trigger(page).getAttribute("aria-haspopup");
    expect(haspopup).toBe("dialog");
  });

  // WAI-ARIA: aria-controls must reference the content id so AT can navigate to it.
  test("trigger aria-controls points to content id", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    const controlsId = await trigger(page).getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    await expect(content(page)).toHaveAttribute("id", controlsId!);
  });

  test("trigger aria-expanded=false when closed", async ({ page }) => {
    const expanded = await trigger(page).getAttribute("aria-expanded");
    expect(expanded).toBe("false");
  });

  test("trigger aria-expanded=true when open", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await expect(trigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("content has data-state=open when visible", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    await expect(content(page)).toHaveAttribute("data-state", "open");
  });

  // ---------------------------------------------------------------------------
  // Keyboard — WAI-ARIA: HoverCard opens on focus (no delay, unlike hover)
  // ---------------------------------------------------------------------------

  test("hover card opens immediately on keyboard focus (no openDelay)", async ({ page }) => {
    await trigger(page).focus();
    // Focus must open without delay — 500ms timeout is generous
    await expect(content(page)).toBeVisible({ timeout: 500 });
  });

  test("hover card closes when focus leaves trigger", async ({ page }) => {
    await trigger(page).focus();
    await expect(content(page)).toBeVisible({ timeout: 500 });
    await page.keyboard.press("Tab");
    await expect(content(page)).not.toBeVisible({ timeout: 1000 });
  });

  // ---------------------------------------------------------------------------
  // Portal
  // ---------------------------------------------------------------------------

  test("content is rendered in body (portal)", async ({ page }) => {
    await trigger(page).hover();
    await expect(content(page)).toBeVisible({ timeout: 2000 });
    const isBodyChild = await page.evaluate(() => {
      const el = document.querySelector(
        '[data-forge-scope="hover-card"][data-forge-part="content"]',
      );
      return el?.closest("body") !== null;
    });
    expect(isBodyChild).toBe(true);
  });
});
