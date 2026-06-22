import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

async function waitForRevealed(page: import("@playwright/test").Page, selector: string) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      return el ? el.style.getPropertyValue("--forge-revealed") === "1" : false;
    },
    selector,
    { timeout: 5000 },
  );
}

const selectTrigger = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first();

const selectContent = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="select"][data-forge-part="content"]').first();

const selectPositioner = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="select"][data-forge-part="positioner"]').first();

const selectOptions = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="select"][data-forge-part="option"]');

test.describe("Select — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  test("listbox is not rendered on load", async ({ page }) => {
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("opens on click", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectContent(page)).toBeVisible();
    await expect(selectContent(page)).toHaveAttribute("data-state", "open");
  });

  test("opens on Space key", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("Space");
    await expect(selectContent(page)).toBeVisible();
  });

  test("opens on Enter key", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("Enter");
    await expect(selectContent(page)).toBeVisible();
  });

  test("opens on ArrowDown key", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(selectContent(page)).toBeVisible();
  });

  test("closes on Escape key", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectContent(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("closes on outside click", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectContent(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("focus returns to trigger after Escape", async ({ page }) => {
    await selectTrigger(page).click();
    await page.keyboard.press("Escape");
    await expect(selectTrigger(page)).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowDown opens and highlights first option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(selectContent(page)).toBeVisible();
    await expect(selectOptions(page).first()).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowUp opens and highlights last option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(selectContent(page)).toBeVisible();
    const options = selectOptions(page);
    const count = await options.count();
    await expect(options.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowDown then ArrowDown moves to second option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(selectOptions(page).nth(1)).toHaveAttribute("data-highlighted", "");
  });

  test("Home key highlights first option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Home");
    await expect(selectOptions(page).first()).toHaveAttribute("data-highlighted", "");
  });

  test("End key highlights last option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("End");
    const options = selectOptions(page);
    const count = await options.count();
    await expect(options.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("Enter selects highlighted option and closes", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("Space selects highlighted option and closes", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(selectContent(page)).not.toBeAttached();
  });

  // ---------------------------------------------------------------------------
  // Selection with click
  // ---------------------------------------------------------------------------

  test("click on item selects it and closes the listbox", async ({ page }) => {
    await selectTrigger(page).click();
    const vueOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Vue" }).first();
    await vueOption.click();
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("selected item gets data-selected attribute on reopen", async ({ page }) => {
    await selectTrigger(page).click();
    await page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first().click();
    await selectTrigger(page).click();
    await expect(
      page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first()
    ).toHaveAttribute("data-selected", "");
  });

  test("trigger displays selected value label", async ({ page }) => {
    await selectTrigger(page).click();
    await page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Vue" }).first().click();
    await expect(selectTrigger(page)).toContainText("Vue");
  });

  // ---------------------------------------------------------------------------
  // Multi-select
  // ---------------------------------------------------------------------------

  test("multi-select: stays open after selecting an item", async ({ page }) => {
    const multiTrigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').nth(1);
    await multiTrigger.click();
    const multiContent = page.locator('[data-forge-scope="select"][data-forge-part="content"]').nth(1);
    await expect(multiContent).toBeVisible();
    const firstOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Design" });
    await firstOption.click();
    await expect(multiContent).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has role=combobox", async ({ page }) => {
    await expect(selectTrigger(page)).toHaveAttribute("role", "combobox");
  });

  test("trigger has aria-expanded=false when closed", async ({ page }) => {
    await expect(selectTrigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectTrigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("trigger has aria-haspopup=listbox", async ({ page }) => {
    await expect(selectTrigger(page)).toHaveAttribute("aria-haspopup", "listbox");
  });

  test("content has role=listbox when open", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectContent(page)).toHaveAttribute("role", "listbox");
  });

  test("options have role=option", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectOptions(page).first()).toHaveAttribute("role", "option");
  });

  test("selected option has aria-selected=true", async ({ page }) => {
    await selectTrigger(page).click();
    await page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first().click();
    await selectTrigger(page).click();
    await expect(
      page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first()
    ).toHaveAttribute("aria-selected", "true");
  });

  test("trigger aria-activedescendant points to highlighted option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    const activeDesc = await selectTrigger(page).getAttribute("aria-activedescendant");
    expect(activeDesc).toBeTruthy();
    await expect(page.locator(`#${activeDesc}`)).toHaveAttribute("data-highlighted", "");
  });

  test("disabled option has aria-disabled=true", async ({ page }) => {
    await selectTrigger(page).click();
    const disabledOption = page.locator('[data-forge-scope="select"][data-forge-part="option"][data-disabled]').first();
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  });

  // ---------------------------------------------------------------------------
  // Portal / positioning
  // ---------------------------------------------------------------------------

  test("listbox is rendered inside body portal", async ({ page }) => {
    await selectTrigger(page).click();
    const isBodyDescendant = await page.evaluate(() => {
      const listbox = document.querySelector('[role="listbox"]');
      return listbox?.closest("body") !== null;
    });
    expect(isBodyDescendant).toBe(true);
  });

  test("content appears at a non-zero position (no flash to 0,0)", async ({ page }) => {
    const sel = '[data-forge-scope="select"][data-forge-part="positioner"]';
    await selectTrigger(page).click();
    await waitForRevealed(page, sel);
    const box = await selectPositioner(page).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(10);
  });
});
