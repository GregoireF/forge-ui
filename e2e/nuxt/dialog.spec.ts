import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Dialog — Nuxt (forge-ui)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ---------------------------------------------------------------------------
  // Visibility
  // ---------------------------------------------------------------------------

  test("dialog is hidden on load", async ({ page }) => {
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("opens on trigger click", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("closes on close button click", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes on Escape key", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("closes on backdrop click", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  // ---------------------------------------------------------------------------
  // ARIA
  // ---------------------------------------------------------------------------

  test("trigger has aria-expanded=true when open", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.locator('[data-forge-part="trigger"]').first()).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  test("dialog has aria-modal=true", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  test("dialog has an accessible name via aria-labelledby", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    const labelledBy = await dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    await expect(page.locator(`#${labelledBy}`)).toBeVisible();
  });

  test("dialog has a description via aria-describedby", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    const describedBy = await dialog.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
  });

  test("trigger has data-state=closed on load", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Open dialog" })).toHaveAttribute(
      "data-state",
      "closed",
    );
  });

  test("trigger has data-state=open when dialog is open", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.locator('[data-forge-part="trigger"]').first()).toHaveAttribute(
      "data-state",
      "open",
    );
  });

  test("dialog content has data-state=open when open", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await expect(page.getByRole("dialog")).toHaveAttribute("data-state", "open");
  });

  // ---------------------------------------------------------------------------
  // Focus management (WAI-ARIA §3.2)
  // ---------------------------------------------------------------------------

  // WAI-ARIA §3.2: focus MUST move inside the dialog on open (before user presses Tab)
  test("focus moves inside dialog on open", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  test("focus returns to trigger after close via Escape", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  });

  test("focus returns to trigger after close via button", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Open dialog" });
    await trigger.click();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(trigger).toBeFocused();
  });

  test("Tab key wraps focus within dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    const closeBtn = page.getByRole("button", { name: "Close" });
    await closeBtn.focus();
    await page.keyboard.press("Tab");
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  test("Shift+Tab key wraps focus within dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.press("Tab");
    await page.keyboard.press("Shift+Tab");
    const focusedInsideDialog = await dialog.evaluate((el) => el.contains(document.activeElement));
    expect(focusedInsideDialog).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Portal
  // ---------------------------------------------------------------------------

  test("dialog content is a direct child of body (portal)", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    const isDirectBodyChild = await page.evaluate(() => {
      const dialog = document.querySelector("[role='dialog']");
      return dialog?.parentElement === document.body;
    });
    expect(isDirectBodyChild).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // Background aria-hidden
  // ---------------------------------------------------------------------------

  test("background content gets aria-hidden when modal dialog opens", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: DOM traversal helper
    const hasAriaHiddenBackground = await page.evaluate(() => {
      const dialog = document.querySelector("[role='dialog']");
      if (!dialog) return false;
      let node: Element | null = dialog;
      while (node && node !== document.body && node.parentElement) {
        for (const sibling of Array.from(node.parentElement.children)) {
          if (sibling !== node && sibling.getAttribute("aria-hidden") === "true") {
            return true;
          }
        }
        node = node.parentElement;
      }
      return false;
    });
    expect(hasAriaHiddenBackground).toBe(true);
  });

  test("aria-hidden is removed from background after dialog closes", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await page.keyboard.press("Escape");
    const ariaHiddenCount = await page.evaluate(
      () => document.querySelectorAll("[aria-hidden='true']").length,
    );
    expect(ariaHiddenCount).toBe(0);
  });
});
