import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

// ---------------------------------------------------------------------------
// Regression: floating elements (popover, select) must not flash at (0,0)
// on their second open. Root cause: passing contentEl (child of positioner)
// to computePosition made floating-ui compute positioner-relative coords,
// which are correct only when positioner is at (0,0) — i.e. open #1.
// Fix: pass positionerEl to computePosition so getOffsetParent returns window
// and coordinates are always viewport-relative.
// ---------------------------------------------------------------------------

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

test.describe("Floating flash regression — React", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("popover: no flash to (0,0) on second open", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Ouvrir popover" }).first();
    const sel = '[data-forge-part="positioner"][data-forge-scope="popover"]';
    const positioner = page.locator(sel).first();

    for (let i = 1; i <= 3; i++) {
      await trigger.click();
      await waitForRevealed(page, sel);

      const box = await positioner.boundingBox();
      expect(box, `open #${i}: positioner bounding box should not be null`).not.toBeNull();
      expect(box!.x, `open #${i}: positioner must not flash to x≈0`).toBeGreaterThan(50);

      await page.keyboard.press("Escape");
      await expect(positioner).not.toBeAttached({ timeout: 3000 });
      await page.waitForTimeout(30);
    }
  });

  test("select: no flash to (0,0) on second open", async ({ page }) => {
    const trigger = page.getByRole("combobox").first();
    const sel = '[data-forge-part="positioner"][data-forge-scope="select"]';
    const positioner = page.locator(sel).first();

    for (let i = 1; i <= 3; i++) {
      await trigger.click();
      await waitForRevealed(page, sel);

      const box = await positioner.boundingBox();
      expect(box, `open #${i}: positioner bounding box should not be null`).not.toBeNull();
      expect(box!.x, `open #${i}: positioner must not flash to x≈0`).toBeGreaterThan(0);

      await page.keyboard.press("Escape");
      await expect(positioner).not.toBeAttached({ timeout: 3000 });
      await page.waitForTimeout(30);
    }
  });
});
