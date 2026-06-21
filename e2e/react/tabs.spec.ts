import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("Tabs — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const tabList = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-list"]');

  const triggerReact = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-trigger-react"]');

  const triggerVue = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-trigger-vue"]');

  const triggerNuxt = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-trigger-nuxt"]');

  const panelReact = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-panel-react"]');

  const panelVue = (page: import("@playwright/test").Page) =>
    page.locator('[data-testid="tabs-panel-vue"]');

  // ---------------------------------------------------------------------------
  // Initial state (defaultValue="react")
  // ---------------------------------------------------------------------------

  test("tablist exists with role=tablist", async ({ page }) => {
    await expect(tabList(page)).toHaveAttribute("role", "tablist");
  });

  test("React tab is selected on load", async ({ page }) => {
    await expect(triggerReact(page)).toHaveAttribute("aria-selected", "true");
  });

  test("React panel is visible on load", async ({ page }) => {
    await expect(panelReact(page)).toBeVisible();
  });

  test("Vue panel is hidden on load", async ({ page }) => {
    await expect(panelVue(page)).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Click navigation
  // ---------------------------------------------------------------------------

  test("clicking Vue tab shows Vue panel and hides React panel", async ({ page }) => {
    await triggerVue(page).click();
    await expect(panelVue(page)).toBeVisible();
    await expect(panelReact(page)).not.toBeVisible();
  });

  test("clicked tab gets aria-selected=true", async ({ page }) => {
    await triggerVue(page).click();
    await expect(triggerVue(page)).toHaveAttribute("aria-selected", "true");
    await expect(triggerReact(page)).toHaveAttribute("aria-selected", "false");
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowRight moves focus to next tab trigger", async ({ page }) => {
    await triggerReact(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(triggerVue(page)).toBeFocused();
  });

  test("ArrowLeft moves focus to previous tab trigger", async ({ page }) => {
    await triggerVue(page).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(triggerReact(page)).toBeFocused();
  });

  test("ArrowRight wraps from last to first tab", async ({ page }) => {
    await triggerNuxt(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(triggerReact(page)).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("triggers have role=tab", async ({ page }) => {
    await expect(triggerReact(page)).toHaveAttribute("role", "tab");
    await expect(triggerVue(page)).toHaveAttribute("role", "tab");
  });

  test("panels have role=tabpanel", async ({ page }) => {
    await expect(panelReact(page)).toHaveAttribute("role", "tabpanel");
  });

  test("inactive tab has aria-selected=false", async ({ page }) => {
    await expect(triggerVue(page)).toHaveAttribute("aria-selected", "false");
  });
});
