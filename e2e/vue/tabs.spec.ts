import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("Tabs — Vue (forge-ui)", () => {
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

  test("clicking Vue tab shows Vue panel", async ({ page }) => {
    await triggerVue(page).click();
    await expect(panelVue(page)).toBeVisible();
    await expect(panelReact(page)).not.toBeVisible();
  });

  test("clicked tab gets aria-selected=true", async ({ page }) => {
    await triggerVue(page).click();
    await expect(triggerVue(page)).toHaveAttribute("aria-selected", "true");
    await expect(triggerReact(page)).toHaveAttribute("aria-selected", "false");
  });

  test("ArrowRight moves focus to next tab", async ({ page }) => {
    await triggerReact(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(triggerVue(page)).toBeFocused();
  });

  test("ArrowLeft moves focus to previous tab", async ({ page }) => {
    await triggerVue(page).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(triggerReact(page)).toBeFocused();
  });

  test("ArrowRight wraps from last to first", async ({ page }) => {
    await triggerNuxt(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(triggerReact(page)).toBeFocused();
  });

  // WAI-ARIA §3.26: Home/End navigate to first/last tab
  test("Home key moves focus to first tab", async ({ page }) => {
    await triggerNuxt(page).focus();
    await page.keyboard.press("Home");
    await expect(triggerReact(page)).toBeFocused();
  });

  test("End key moves focus to last tab", async ({ page }) => {
    await triggerReact(page).focus();
    await page.keyboard.press("End");
    await expect(triggerNuxt(page)).toBeFocused();
  });

  // WAI-ARIA §3.26: automatic mode activates tab on ArrowRight (focus + select simultaneously)
  test("ArrowRight activates the focused tab (automatic mode)", async ({ page }) => {
    await triggerReact(page).focus();
    await page.keyboard.press("ArrowRight");
    await expect(triggerVue(page)).toHaveAttribute("aria-selected", "true");
    await expect(panelVue(page)).toBeVisible();
  });

  test("inactive tab has aria-selected=false", async ({ page }) => {
    await expect(triggerVue(page)).toHaveAttribute("aria-selected", "false");
  });

  test("triggers have role=tab", async ({ page }) => {
    await expect(triggerReact(page)).toHaveAttribute("role", "tab");
  });

  test("panels have role=tabpanel", async ({ page }) => {
    await expect(panelReact(page)).toHaveAttribute("role", "tabpanel");
  });

  // WAI-ARIA §3.22: trigger aria-controls must point to its panel id, and
  // the panel aria-labelledby must point back to the trigger id.
  test("trigger aria-controls points to its panel", async ({ page }) => {
    const controlsId = await triggerReact(page).getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    await expect(panelReact(page)).toHaveAttribute("id", controlsId!);
  });

  test("panel aria-labelledby points to its trigger", async ({ page }) => {
    const triggerId = await triggerReact(page).getAttribute("id");
    await expect(panelReact(page)).toHaveAttribute("aria-labelledby", triggerId!);
  });

  // WAI-ARIA: only the selected tab should have tabIndex=0 (roving tabIndex)
  test("selected tab has tabIndex=0, others have tabIndex=-1", async ({ page }) => {
    await expect(triggerReact(page)).toHaveAttribute("tabindex", "0");
    await expect(triggerVue(page)).toHaveAttribute("tabindex", "-1");
  });
});
