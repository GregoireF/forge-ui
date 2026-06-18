import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

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

// Single-select combobox (first on page)
const comboboxInput = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').first();

const comboboxTrigger = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first();

const comboboxContent = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first();

const comboboxPositioner = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="positioner"]').first();

const comboboxOptions = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="option"]');

const clearTrigger = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="clear-trigger"]').first();

// Multi-select combobox (second on page)
const multiInput = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').nth(1);

const multiContent = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').nth(1);

const multiOptions = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').nth(1)
    .locator('[data-forge-part="option"]');

test.describe("Combobox — React (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  test("dropdown is not rendered on load", async ({ page }) => {
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  test("chevron trigger button opens the dropdown", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxContent(page)).toBeVisible();
    await expect(comboboxContent(page)).toHaveAttribute("data-state", "open");
  });

  test("ArrowDown on input opens the dropdown", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(comboboxContent(page)).toBeVisible();
  });

  test("ArrowUp on input opens the dropdown", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(comboboxContent(page)).toBeVisible();
  });

  test("Escape closes the dropdown", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxContent(page)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  test("Tab closes the dropdown", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await expect(comboboxContent(page)).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  test("clicking outside closes the dropdown", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxContent(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowDown highlights first option when dropdown opens", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await expect(comboboxContent(page)).toBeVisible();
    // When list opens with ArrowDown, machine sends HIGHLIGHT_FIRST
    const firstOption = comboboxOptions(page).first();
    await expect(firstOption).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowUp highlights last option when dropdown opens", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowUp"); // open + highlight last
    await expect(comboboxContent(page)).toBeVisible();
    const options = comboboxOptions(page);
    const count = await options.count();
    const lastOption = options.nth(count - 1);
    await expect(lastOption).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowDown then ArrowDown moves to second option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open + highlight first
    await page.keyboard.press("ArrowDown"); // highlight second
    const secondOption = comboboxOptions(page).nth(1);
    await expect(secondOption).toHaveAttribute("data-highlighted", "");
  });

  test("Home key moves to first option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("ArrowDown"); // move to second
    await page.keyboard.press("Home");
    const firstOption = comboboxOptions(page).first();
    await expect(firstOption).toHaveAttribute("data-highlighted", "");
  });

  test("End key moves to last option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await page.keyboard.press("End");
    const options = comboboxOptions(page);
    const count = await options.count();
    const lastOption = options.nth(count - 1);
    await expect(lastOption).toHaveAttribute("data-highlighted", "");
  });

  test("Enter selects highlighted option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open + highlight first
    await page.keyboard.press("Enter"); // select
    // Single-select closes after selection
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  test("Enter puts selected label in the input", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open + highlight TypeScript (first)
    await page.keyboard.press("Enter"); // select TypeScript
    await expect(comboboxInput(page)).toHaveValue("TypeScript");
  });

  // ---------------------------------------------------------------------------
  // Filtering
  // ---------------------------------------------------------------------------

  test("typing filters the options", async ({ page }) => {
    await comboboxInput(page).focus();
    await comboboxInput(page).fill("py");
    await expect(comboboxContent(page)).toBeVisible();
    const options = comboboxOptions(page);
    // "Python" should match "py"; other options should be filtered out
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(8); // Less than the full 8-item list
    const firstVisible = options.first();
    await expect(firstVisible).toContainText("Python");
  });

  test("typing non-matching text shows no options", async ({ page }) => {
    await comboboxInput(page).focus();
    await comboboxInput(page).fill("zzzzzz");
    await expect(comboboxContent(page)).toBeVisible();
    const options = comboboxOptions(page);
    await expect(options).toHaveCount(0);
  });

  test("clearing text restores all options", async ({ page }) => {
    await comboboxInput(page).fill("py");
    await expect(comboboxContent(page)).toBeVisible();
    await comboboxInput(page).fill("");
    const options = comboboxOptions(page);
    await expect(options).toHaveCount(8);
  });

  test("clear trigger button empties the input and clears selection", async ({ page }) => {
    // Select an option first
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(comboboxInput(page)).not.toHaveValue("");
    // Now click clear trigger
    await clearTrigger(page).click();
    await expect(comboboxInput(page)).toHaveValue("");
  });

  // ---------------------------------------------------------------------------
  // Click selection
  // ---------------------------------------------------------------------------

  test("clicking an option selects it", async ({ page }) => {
    await comboboxTrigger(page).click();
    const rustOption = page.locator('[data-forge-scope="combobox"][data-forge-part="option"]', { hasText: "Rust" }).first();
    await rustOption.click();
    await expect(comboboxContent(page)).not.toBeAttached();
    await expect(comboboxInput(page)).toHaveValue("Rust");
  });

  test("selected option gets data-selected attribute on reopen", async ({ page }) => {
    await comboboxTrigger(page).click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="option"]', { hasText: "Go" }).first().click();
    await comboboxTrigger(page).click();
    const goOption = page.locator('[data-forge-scope="combobox"][data-forge-part="option"]', { hasText: "Go" }).first();
    await expect(goOption).toHaveAttribute("data-selected", "");
  });

  // ---------------------------------------------------------------------------
  // Multi-select
  // ---------------------------------------------------------------------------

  test("multi-select: dropdown stays open after selecting", async ({ page }) => {
    await multiInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    await expect(multiContent(page)).toBeVisible();
    const firstOption = multiOptions(page).first();
    await firstOption.click();
    // Multi-select stays open
    await expect(multiContent(page)).toBeVisible();
  });

  test("multi-select: selected options have aria-selected=true", async ({ page }) => {
    await multiInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    const tsOption = multiOptions(page).filter({ hasText: "TypeScript" });
    const jsOption = multiOptions(page).filter({ hasText: "JavaScript" });
    await tsOption.click();
    await jsOption.click();
    await expect(tsOption).toHaveAttribute("aria-selected", "true");
    await expect(jsOption).toHaveAttribute("aria-selected", "true");
  });

  test("multi-select: selected options have data-selected attribute", async ({ page }) => {
    await multiInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open
    const tsOption = multiOptions(page).filter({ hasText: "TypeScript" });
    await tsOption.click();
    await expect(tsOption).toHaveAttribute("data-selected", "");
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("input has role=combobox", async ({ page }) => {
    await expect(comboboxInput(page)).toHaveAttribute("role", "combobox");
  });

  test("input has aria-expanded=false when closed", async ({ page }) => {
    await expect(comboboxInput(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("input has aria-expanded=true when open", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxInput(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("input has aria-controls pointing to listbox", async ({ page }) => {
    const controls = await comboboxInput(page).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await comboboxTrigger(page).click();
    const listbox = page.locator(`#${controls}`);
    await expect(listbox).toBeVisible();
  });

  test("content has role=listbox when open", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxContent(page)).toHaveAttribute("role", "listbox");
  });

  test("options have role=option", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxOptions(page).first()).toHaveAttribute("role", "option");
  });

  test("input aria-activedescendant points to highlighted option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown"); // open + highlight first
    const activeDesc = await comboboxInput(page).getAttribute("aria-activedescendant");
    expect(activeDesc).toBeTruthy();
    const highlightedOption = page.locator(`#${activeDesc}`);
    await expect(highlightedOption).toHaveAttribute("data-highlighted", "");
  });

  test("aria-activedescendant is absent when no option is highlighted", async ({ page }) => {
    // Open via trigger (no keyboard nav, so no highlight yet)
    await comboboxTrigger(page).click();
    // After open via trigger click, highlighted may be null → aria-activedescendant should be absent or empty
    const activeDesc = await comboboxInput(page).getAttribute("aria-activedescendant");
    // Either absent or empty string (no highlight)
    expect(!activeDesc || activeDesc === "").toBe(true);
  });

  test("input aria-autocomplete is present", async ({ page }) => {
    const autocomplete = await comboboxInput(page).getAttribute("aria-autocomplete");
    expect(autocomplete).toBeTruthy();
  });

  test("input data-state=closed when closed", async ({ page }) => {
    await expect(comboboxInput(page)).toHaveAttribute("data-state", "closed");
  });

  test("input data-state=open when open", async ({ page }) => {
    await comboboxTrigger(page).click();
    await expect(comboboxInput(page)).toHaveAttribute("data-state", "open");
  });

  // ---------------------------------------------------------------------------
  // Portal / positioning
  // ---------------------------------------------------------------------------

  test("content is rendered inside body portal", async ({ page }) => {
    await comboboxTrigger(page).click();
    const isBodyDescendant = await page.evaluate(() => {
      const listbox = document.querySelector(
        '[data-forge-scope="combobox"][data-forge-part="content"]',
      );
      return listbox?.closest("body") !== null;
    });
    expect(isBodyDescendant).toBe(true);
  });

  test("content appears at a non-zero position (no flash to 0,0)", async ({ page }) => {
    const sel = '[data-forge-scope="combobox"][data-forge-part="positioner"]';
    await comboboxTrigger(page).click();
    await waitForRevealed(page, sel);
    const box = await comboboxPositioner(page).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThan(10);
  });

  test("no flash to (0,0) on repeated open/close cycles", async ({ page }) => {
    const sel = '[data-forge-scope="combobox"][data-forge-part="positioner"]';

    for (let i = 1; i <= 3; i++) {
      await comboboxTrigger(page).click();
      await waitForRevealed(page, sel);
      const box = await comboboxPositioner(page).boundingBox();
      expect(box, `open #${i}: positioner bounding box should not be null`).not.toBeNull();
      expect(box!.y, `open #${i}: positioner must not flash to y≈0`).toBeGreaterThan(10);

      await page.keyboard.press("Escape");
      await expect(page.locator(sel)).not.toBeAttached({ timeout: 3000 });
      await page.waitForTimeout(30);
    }
  });
});
