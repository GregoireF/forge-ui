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

const multiInput = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').nth(1);

const multiContent = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').nth(1);

const multiOptions = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').nth(1)
    .locator('[data-forge-part="option"]');

test.describe("Combobox — Nuxt (forge-ui)", () => {
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
    await page.keyboard.press("ArrowDown");
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
    await page.keyboard.press("ArrowDown");
    await expect(comboboxContent(page)).toBeVisible();
    await expect(comboboxOptions(page).first()).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowUp highlights last option when dropdown opens", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowUp");
    await expect(comboboxContent(page)).toBeVisible();
    const options = comboboxOptions(page);
    const count = await options.count();
    await expect(options.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowDown then ArrowDown moves to second option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(comboboxOptions(page).nth(1)).toHaveAttribute("data-highlighted", "");
  });

  test("Home key moves to first option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Home");
    await expect(comboboxOptions(page).first()).toHaveAttribute("data-highlighted", "");
  });

  test("End key moves to last option", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("End");
    const options = comboboxOptions(page);
    const count = await options.count();
    await expect(options.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("Enter selects highlighted option and closes (single-select)", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(comboboxContent(page)).not.toBeAttached();
  });

  test("Enter puts selected label in the input", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
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
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(8);
    await expect(options.first()).toContainText("Python");
  });

  test("typing non-matching text shows no options", async ({ page }) => {
    await comboboxInput(page).focus();
    await comboboxInput(page).fill("zzzzzz");
    await expect(comboboxContent(page)).toBeVisible();
    await expect(comboboxOptions(page)).toHaveCount(0);
  });

  test("clearing text restores all options", async ({ page }) => {
    await comboboxInput(page).fill("py");
    await expect(comboboxContent(page)).toBeVisible();
    await comboboxInput(page).fill("");
    await expect(comboboxOptions(page)).toHaveCount(8);
  });

  test("clear trigger empties input and clears selection", async ({ page }) => {
    await comboboxInput(page).focus();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(comboboxInput(page)).not.toHaveValue("");
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

  test("selected option gets data-selected on reopen", async ({ page }) => {
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
    await page.keyboard.press("ArrowDown");
    await expect(multiContent(page)).toBeVisible();
    await multiOptions(page).first().click();
    await expect(multiContent(page)).toBeVisible();
  });

  test("multi-select: selected options have aria-selected=true", async ({ page }) => {
    await multiInput(page).focus();
    await page.keyboard.press("ArrowDown");
    const tsOption = multiOptions(page).filter({ hasText: "TypeScript" });
    const jsOption = multiOptions(page).filter({ hasText: "JavaScript" });
    await tsOption.click();
    await jsOption.click();
    await expect(tsOption).toHaveAttribute("aria-selected", "true");
    await expect(jsOption).toHaveAttribute("aria-selected", "true");
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
    await page.keyboard.press("ArrowDown");
    const activeDesc = await comboboxInput(page).getAttribute("aria-activedescendant");
    expect(activeDesc).toBeTruthy();
    await expect(page.locator(`#${activeDesc}`)).toHaveAttribute("data-highlighted", "");
  });

  test("input aria-autocomplete is present", async ({ page }) => {
    const autocomplete = await comboboxInput(page).getAttribute("aria-autocomplete");
    expect(autocomplete).toBeTruthy();
  });

  // ---------------------------------------------------------------------------
  // Portal / positioning
  // ---------------------------------------------------------------------------

  test("content is rendered inside body portal", async ({ page }) => {
    await comboboxTrigger(page).click();
    const isBodyDescendant = await page.evaluate(() => {
      const listbox = document.querySelector('[data-forge-scope="combobox"][data-forge-part="content"]');
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
});
