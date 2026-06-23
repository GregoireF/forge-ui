import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("WAI-ARIA compliance — Nuxt playground", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ── Progress indeterminate (WAI-ARIA §6.9) ──────────────────────────────────

  test("Progress indeterminate: has aria-busy=true", async ({ page }) => {
    const progress = page.locator('[data-testid="progress-indeterminate"]');
    await expect(progress).toHaveAttribute("role", "progressbar");
    await expect(progress).toHaveAttribute("aria-busy", "true");
  });

  test("Progress indeterminate: no aria-valuenow", async ({ page }) => {
    const progress = page.locator('[data-testid="progress-indeterminate"]');
    await expect(progress).not.toHaveAttribute("aria-valuenow");
  });

  test("Progress indeterminate: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="progress-indeterminate"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Tooltip disabled (WAI-ARIA §4.2.5) ────────────────────────────────────

  test("Tooltip disabled: trigger has no aria-describedby", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Désactivé" }).first();
    await expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  test("Tooltip enabled: trigger has aria-describedby", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Survol (400ms)" }).first();
    await expect(trigger).toHaveAttribute("aria-describedby");
  });

  // ── Field.Group role=group (WAI-ARIA §3.7) ────────────────────────────────

  test("Field.Group: has role=group", async ({ page }) => {
    const group = page.locator('[data-testid="field-group"]');
    await expect(group).toHaveAttribute("role", "group");
  });

  test("Field.Group: aria-labelledby references visible label", async ({ page }) => {
    const group = page.locator('[data-testid="field-group"]');
    const labelId = await group.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    await expect(page.locator(`#${labelId}`)).toBeVisible();
  });

  test("Field.Group: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="field-group"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
