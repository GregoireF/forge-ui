import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const menuTrigger = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="menu"][data-forge-part="trigger"]').first();

const menuContent = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="menu"][data-forge-part="content"]').first();

const menuItems = (page: import("@playwright/test").Page) =>
  page.locator('[data-forge-scope="menu"][data-forge-part="item"]');

const contextZone = (page: import("@playwright/test").Page) => page.getByText("Clic-droit ici");

test.describe("Menu (DropdownMenu) — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ---------------------------------------------------------------------------
  // Open / close
  // ---------------------------------------------------------------------------

  test("menu is not visible on load", async ({ page }) => {
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("opens on trigger click", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuContent(page)).toBeVisible();
    await expect(menuContent(page)).toHaveAttribute("data-state", "open");
  });

  test("opens on Enter key from trigger", async ({ page }) => {
    await menuTrigger(page).focus();
    await page.keyboard.press("Enter");
    await expect(menuContent(page)).toBeVisible();
  });

  test("opens on Space key from trigger", async ({ page }) => {
    await menuTrigger(page).focus();
    await page.keyboard.press("Space");
    await expect(menuContent(page)).toBeVisible();
  });

  test("opens on ArrowDown key from trigger", async ({ page }) => {
    await menuTrigger(page).focus();
    await page.keyboard.press("ArrowDown");
    await expect(menuContent(page)).toBeVisible();
  });

  test("closes on Escape key", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("Escape");
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("closes on outside click", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuContent(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("closes on Tab key", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("Tab");
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("closes on trigger click when open (toggle)", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuContent(page)).toBeVisible();
    await menuTrigger(page).click();
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("focus returns to trigger after Escape", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("Escape");
    await expect(menuTrigger(page)).toBeFocused();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has aria-haspopup=menu", async ({ page }) => {
    await expect(menuTrigger(page)).toHaveAttribute("aria-haspopup", "menu");
  });

  test("trigger aria-expanded=false when closed", async ({ page }) => {
    await expect(menuTrigger(page)).toHaveAttribute("aria-expanded", "false");
  });

  test("trigger aria-expanded=true when open", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuTrigger(page)).toHaveAttribute("aria-expanded", "true");
  });

  test("content has role=menu", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuContent(page)).toHaveAttribute("role", "menu");
  });

  test("content has aria-modal=true", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuContent(page)).toHaveAttribute("aria-modal", "true");
  });

  test("items have role=menuitem", async ({ page }) => {
    await menuTrigger(page).click();
    const item = menuItems(page).first();
    await expect(item).toHaveAttribute("role", "menuitem");
  });

  test("trigger has aria-controls pointing to content when open", async ({ page }) => {
    await menuTrigger(page).click();
    const controls = await menuTrigger(page).getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(page.locator(`#${controls}`)).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Keyboard navigation
  // ---------------------------------------------------------------------------

  test("ArrowDown moves focus to first item", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    const first = menuItems(page).first();
    await expect(first).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowDown then ArrowDown moves to second item", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    const items = menuItems(page);
    await expect(items.nth(1)).toHaveAttribute("data-highlighted", "");
  });

  test("ArrowUp from first item wraps to last (loop)", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");
    const items = menuItems(page);
    const count = await items.count();
    await expect(items.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("Home key highlights first item", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("Home");
    await expect(menuItems(page).first()).toHaveAttribute("data-highlighted", "");
  });

  test("End key highlights last item", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("End");
    const items = menuItems(page);
    const count = await items.count();
    await expect(items.nth(count - 1)).toHaveAttribute("data-highlighted", "");
  });

  test("Enter selects highlighted item and closes menu", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(menuContent(page)).not.toBeVisible();
  });

  test("Space selects highlighted item and closes menu", async ({ page }) => {
    await menuTrigger(page).click();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Space");
    await expect(menuContent(page)).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Disabled item
  // ---------------------------------------------------------------------------

  test("disabled item has aria-disabled=true", async ({ page }) => {
    await menuTrigger(page).click();
    const disabled = page
      .locator('[data-forge-scope="menu"][data-forge-part="item"][data-disabled]')
      .first();
    await expect(disabled).toHaveAttribute("aria-disabled", "true");
  });

  test("disabled item has data-disabled attribute", async ({ page }) => {
    await menuTrigger(page).click();
    const disabled = page
      .locator('[data-forge-scope="menu"][data-forge-part="item"][data-disabled]')
      .first();
    await expect(disabled).toHaveAttribute("data-disabled", "");
  });

  // ---------------------------------------------------------------------------
  // Sub-menu
  // ---------------------------------------------------------------------------

  test("sub-trigger has aria-haspopup=menu", async ({ page }) => {
    await menuTrigger(page).click();
    const subTrigger = page
      .locator('[data-forge-scope="menu"][data-forge-part="sub-trigger"]')
      .first();
    await expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
  });

  test("hovering sub-trigger opens sub-menu", async ({ page }) => {
    await menuTrigger(page).click();
    await page.waitForTimeout(100);
    const subTrigger = page
      .locator('[data-forge-scope="menu"][data-forge-part="sub-trigger"]')
      .first();
    await subTrigger.hover();
    await page.waitForTimeout(300);
    const subContent = page.locator('[data-forge-scope="menu"][data-forge-part="content"]').nth(1);
    await expect(subContent).toBeVisible();
  });

  test("ArrowRight opens sub-menu when sub-trigger highlighted", async ({ page }) => {
    await menuTrigger(page).click();
    const subTrigger = page
      .locator('[data-forge-scope="menu"][data-forge-part="sub-trigger"]')
      .first();
    await subTrigger.hover();
    await page.waitForTimeout(50);
    await page.keyboard.press("ArrowRight");
    const subContent = page.locator('[data-forge-scope="menu"][data-forge-part="content"]').nth(1);
    await expect(subContent).toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // Radio group
  // ---------------------------------------------------------------------------

  test("radio items have role=menuitemradio", async ({ page }) => {
    await menuTrigger(page).click();
    const radio = page.locator('[data-forge-scope="menu"][data-forge-part="radio-item"]').first();
    await expect(radio).toHaveAttribute("role", "menuitemradio");
  });

  test("checked radio item has aria-checked=true", async ({ page }) => {
    await menuTrigger(page).click();
    const radioItems = page.locator('[data-forge-scope="menu"][data-forge-part="radio-item"]');
    const systemItem = radioItems.filter({ hasText: "System" });
    await expect(systemItem).toHaveAttribute("aria-checked", "true");
  });

  // ---------------------------------------------------------------------------
  // Checkbox item
  // ---------------------------------------------------------------------------

  test("checkbox items have role=menuitemcheckbox", async ({ page }) => {
    await menuTrigger(page).click();
    const checkbox = page
      .locator('[data-forge-scope="menu"][data-forge-part="checkbox-item"]')
      .first();
    await expect(checkbox).toHaveAttribute("role", "menuitemcheckbox");
  });

  // ---------------------------------------------------------------------------
  // Portal
  // ---------------------------------------------------------------------------

  test("menu content is a direct child of body (portal)", async ({ page }) => {
    await menuTrigger(page).click();
    const isDirectBodyChild = await page.evaluate(() => {
      const content = document.querySelector(
        '[data-forge-scope="menu"][data-forge-part="content"]',
      );
      let el = content?.parentElement;
      while (el && el !== document.body) {
        el = el.parentElement;
      }
      return el === document.body;
    });
    expect(isDirectBodyChild).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Data attributes
  // ---------------------------------------------------------------------------

  test("trigger has data-state=closed on load", async ({ page }) => {
    await expect(menuTrigger(page)).toHaveAttribute("data-state", "closed");
  });

  test("trigger has data-state=open when menu open", async ({ page }) => {
    await menuTrigger(page).click();
    await expect(menuTrigger(page)).toHaveAttribute("data-state", "open");
  });
});

// ---------------------------------------------------------------------------
// ContextMenu
// ---------------------------------------------------------------------------

test.describe("ContextMenu — Vue (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  const ctxContent = (page: import("@playwright/test").Page) =>
    page.locator('[data-forge-scope="menu"][data-forge-part="content"]').last();

  test("context menu is hidden on load", async ({ page }) => {
    const allContents = page.locator('[data-forge-scope="menu"][data-forge-part="content"]');
    const count = await allContents.count();
    for (let i = 0; i < count; i++) {
      await expect(allContents.nth(i)).not.toBeVisible();
    }
  });

  test("right-click opens context menu", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    await expect(ctxContent(page)).toBeVisible();
  });

  test("context menu has role=menu", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    await expect(ctxContent(page)).toHaveAttribute("role", "menu");
  });

  test("closes on Escape key", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    await page.keyboard.press("Escape");
    await expect(ctxContent(page)).not.toBeVisible();
  });

  test("closes on outside click", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    await expect(ctxContent(page)).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(ctxContent(page)).not.toBeVisible();
  });

  test("second right-click moves the menu to new cursor position", async ({ page }) => {
    const zone = contextZone(page);
    const box = await zone.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    await page.mouse.click(box.x + 10, box.y + 10, { button: "right" });
    const positioner1 = page
      .locator('[data-forge-scope="menu"][data-forge-part="positioner"]')
      .last();
    const style1 = await positioner1.getAttribute("style");

    await page.mouse.click(box.x + 80, box.y + 50, { button: "right" });
    const style2 = await positioner1.getAttribute("style");

    expect(style1).not.toBe(style2);
  });

  test("items have role=menuitem", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    const item = page.locator('[data-forge-scope="menu"][data-forge-part="item"]').last();
    await expect(item).toHaveAttribute("role", "menuitem");
  });

  test("clicking an item closes the context menu", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    const firstItem = page.locator('[data-forge-scope="menu"][data-forge-part="item"]').last();
    await firstItem.click();
    await expect(ctxContent(page)).not.toBeVisible();
  });

  test("context menu portal renders in body", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    const isInBody = await page.evaluate(() => {
      const contents = document.querySelectorAll(
        '[data-forge-scope="menu"][data-forge-part="content"]',
      );
      const ctx = contents[contents.length - 1];
      let el: Element | null = ctx ?? null;
      while (el && el !== document.body) el = el.parentElement;
      return el === document.body;
    });
    expect(isInBody).toBe(true);
  });

  test("checkbox item has role=menuitemcheckbox", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    const checkbox = page
      .locator('[data-forge-scope="menu"][data-forge-part="checkbox-item"]')
      .last();
    await expect(checkbox).toHaveAttribute("role", "menuitemcheckbox");
  });

  test("sub-trigger in context menu has aria-haspopup=menu", async ({ page }) => {
    await contextZone(page).click({ button: "right" });
    const subTrigger = page
      .locator('[data-forge-scope="menu"][data-forge-part="sub-trigger"]')
      .last();
    await expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
  });
});
