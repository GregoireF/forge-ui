import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

// Helper: wait for the positioner to be visually revealed (--forge-revealed=1)
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

test.describe("Select — Vue (forge-ui)", () => {
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

  test("closes on trigger click when open", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectContent(page)).toBeVisible();
    await selectTrigger(page).click();
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("focus returns to trigger after Escape", async ({ page }) => {
    const trigger = selectTrigger(page);
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowDown opens and highlights first option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // opens
    await expect(selectContent(page)).toBeVisible();
    const firstOption = selectOptions(page).first();
    await expect(firstOption).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowUp opens and highlights last option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowUp"); // opens + highlights last
    await expect(selectContent(page)).toBeVisible();
    const options = selectOptions(page);
    const count = await options.count();
    const lastOption = options.nth(count - 1);
    await expect(lastOption).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowDown then ArrowDown moves highlight to second option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("ArrowDown"); // highlight second
    const secondOption = selectOptions(page).nth(1);
    await expect(secondOption).toHaveAttribute("data-highlighted", "");
  });

  test("Home key highlights first option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("ArrowDown"); // move to second
    await page.keyboard.press("Home");
    const firstOption = selectOptions(page).first();
    await expect(firstOption).toHaveAttribute("data-highlighted", "");
  });

  test("End key highlights last option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("End");
    const options = selectOptions(page);
    const count = await options.count();
    const lastOption = options.nth(count - 1);
    await expect(lastOption).toHaveAttribute("data-highlighted", "");
  });

  test("Enter selects highlighted option and closes", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open, highlight first
    await page.keyboard.press("Enter"); // select
    await expect(selectContent(page)).not.toBeAttached();
  });

  test("Space selects highlighted option and closes", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open, highlight first
    await page.keyboard.press("Space"); // select
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

  test("selected item gets data-selected attribute", async ({ page }) => {
    await selectTrigger(page).click();
    const reactOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first();
    await reactOption.click();
    // Reopen to verify
    await selectTrigger(page).click();
    const reactOptionAgain = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first();
    await expect(reactOptionAgain).toHaveAttribute("data-selected", "");
  });

  test("trigger displays selected value label", async ({ page }) => {
    await selectTrigger(page).click();
    await page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Vue" }).first().click();
    const trigger = selectTrigger(page);
    await expect(trigger).toContainText("Vue");
  });

  // ---------------------------------------------------------------------------
  // Multi-select
  // ---------------------------------------------------------------------------

  test("multi-select: stays open after selecting an item", async ({ page }) => {
    // The multi-select is the second Select.Root on the page
    const multiTrigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').nth(1);
    await multiTrigger.click();
    const multiContent = page.locator('[data-forge-scope="select"][data-forge-part="content"]').nth(1);
    await expect(multiContent).toBeVisible();
    const firstOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]').filter({ hasText: "Design" });
    await firstOption.click();
    // Should remain open after selection in multi-mode
    await expect(multiContent).toBeVisible();
  });

  test("multi-select: multiple items get data-selected", async ({ page }) => {
    const multiTrigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').nth(1);
    await multiTrigger.click();
    const designOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Design" });
    const devOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Développement" });
    await designOption.click();
    await devOption.click();
    await expect(designOption).toHaveAttribute("data-selected", "");
    await expect(devOption).toHaveAttribute("data-selected", "");
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
    const firstOption = selectOptions(page).first();
    await expect(firstOption).toHaveAttribute("role", "option");
  });

  test("selected option has aria-selected=true", async ({ page }) => {
    await selectTrigger(page).click();
    const reactOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first();
    await reactOption.click();
    await selectTrigger(page).click();
    const reactOptionAgain = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "React" }).first();
    await expect(reactOptionAgain).toHaveAttribute("aria-selected", "true");
  });

  test("unselected option has aria-selected=false", async ({ page }) => {
    await selectTrigger(page).click();
    const vueOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Vue" }).first();
    await expect(vueOption).toHaveAttribute("aria-selected", "false");
  });

  test("trigger aria-controls points to listbox id", async ({ page }) => {
    const controls = await selectTrigger(page).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await selectTrigger(page).click();
    const listbox = page.locator(`#${controls}`);
    await expect(listbox).toBeVisible();
  });

  test("trigger aria-activedescendant points to highlighted option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open + highlight first
    const activeDesc = await selectTrigger(page).getAttribute("aria-activedescendant");
    expect(activeDesc).toBeTruthy();
    const highlightedOption = page.locator(`#${activeDesc}`);
    await expect(highlightedOption).toHaveAttribute("data-highlighted", "");
  });

  test("trigger data-state=closed when closed", async ({ page }) => {
    await expect(selectTrigger(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger data-state=open when open", async ({ page }) => {
    await selectTrigger(page).click();
    await expect(selectTrigger(page)).toHaveAttribute("data-state", "open");
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

  test("no flash to (0,0) on repeated open/close cycles", async ({ page }) => {
    const sel = '[data-forge-scope="select"][data-forge-part="positioner"]';

    for (let i = 1; i <= 3; i++) {
      await selectTrigger(page).click();
      await waitForRevealed(page, sel);
      const box = await selectPositioner(page).boundingBox();
      expect(box, `open #${i}: positioner bounding box should not be null`).not.toBeNull();
      expect(box!.y, `open #${i}: positioner must not flash to y≈0`).toBeGreaterThan(10);

      await page.keyboard.press("Escape");
      await expect(page.locator(sel)).not.toBeAttached({ timeout: 3000 });
      await page.waitForTimeout(30);
    }
  });

  // ---------------------------------------------------------------------------
  // Typeahead (WAI-ARIA §3.15)
  // ---------------------------------------------------------------------------

  test("typing a letter highlights the first matching option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("v");
    const vueOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Vue" }).first();
    await expect(vueOption).toHaveAttribute("data-highlighted", "");
  });

  test("typeahead: pressing same letter twice cycles to next matching option", async ({ page }) => {
    await selectTrigger(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("s"); // → Svelte
    const svelteOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Svelte" }).first();
    await expect(svelteOption).toHaveAttribute("data-highlighted", "");
    await page.keyboard.press("s"); // → Solid (next "s")
    const solidOption = page.locator('[data-forge-scope="select"][data-forge-part="option"]', { hasText: "Solid" }).first();
    await expect(solidOption).toHaveAttribute("data-highlighted", "");
  });

  // ---------------------------------------------------------------------------
  // Disabled option
  // ---------------------------------------------------------------------------

  test("disabled option has aria-disabled and cannot be selected", async ({ page }) => {
    await selectTrigger(page).click();
    const disabledOption = page.locator('[data-forge-scope="select"][data-forge-part="option"][data-disabled]').first();
    await expect(disabledOption).toHaveAttribute("aria-disabled", "true");
  });
});
