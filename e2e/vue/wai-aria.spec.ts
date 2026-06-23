import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3001";

test.describe("WAI-ARIA compliance — Vue playground", () => {
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

  // ── Switch (WAI-ARIA §6.18) ────────────────────────────────────────────────

  test("Switch: control has role=switch", async ({ page }) => {
    const control = page.locator('[data-forge-scope="switch"][data-forge-part="control"]').first();
    await expect(control).toHaveAttribute("role", "switch");
  });

  test("Switch: aria-checked=false when off", async ({ page }) => {
    const control = page.locator('[data-forge-scope="switch"][data-forge-part="control"]').first();
    await expect(control).toHaveAttribute("aria-checked", "false");
  });

  test("Switch: aria-checked=true after toggle", async ({ page }) => {
    const control = page.locator('[data-forge-scope="switch"][data-forge-part="control"]').first();
    await control.click();
    await expect(control).toHaveAttribute("aria-checked", "true");
  });

  test("Switch disabled: aria-disabled=true", async ({ page }) => {
    const disabledControl = page.locator('[data-forge-scope="switch"][data-forge-part="control"][data-disabled]').first();
    await expect(disabledControl).toHaveAttribute("aria-disabled", "true");
  });

  test("Switch invalid: aria-invalid=true", async ({ page }) => {
    const invalidControl = page.locator('[data-forge-scope="switch"][data-forge-part="control"][data-invalid]').first();
    await expect(invalidControl).toHaveAttribute("aria-invalid", "true");
  });

  test("Switch: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="switch"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Tabs (WAI-ARIA §3.26) ─────────────────────────────────────────────────

  test("Tabs: list has role=tablist", async ({ page }) => {
    const list = page.locator('[data-testid="tabs-list"]');
    await expect(list).toHaveAttribute("role", "tablist");
  });

  test("Tabs: triggers have role=tab", async ({ page }) => {
    await expect(page.locator('[data-testid="tabs-trigger-react"]')).toHaveAttribute("role", "tab");
    await expect(page.locator('[data-testid="tabs-trigger-vue"]')).toHaveAttribute("role", "tab");
  });

  test("Tabs: selected trigger has aria-selected=true", async ({ page }) => {
    await expect(page.locator('[data-testid="tabs-trigger-react"]')).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('[data-testid="tabs-trigger-vue"]')).toHaveAttribute("aria-selected", "false");
  });

  test("Tabs: aria-controls links trigger to its panel", async ({ page }) => {
    const trigger = page.locator('[data-testid="tabs-trigger-react"]');
    const panelId = await trigger.getAttribute("aria-controls");
    expect(panelId).toBeTruthy();
    await expect(page.locator(`#${panelId}`)).toBeVisible();
  });

  test("Tabs: panels have role=tabpanel", async ({ page }) => {
    await expect(page.locator('[data-testid="tabs-panel-react"]')).toHaveAttribute("role", "tabpanel");
  });

  test("Tabs: panel has aria-labelledby pointing to its trigger", async ({ page }) => {
    const panel = page.locator('[data-testid="tabs-panel-react"]');
    const labelId = await panel.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    await expect(page.locator(`#${labelId}`)).toHaveAttribute("role", "tab");
  });

  test("Tabs: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="tabs"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Accordion (WAI-ARIA §3.1) ─────────────────────────────────────────────

  test("Accordion collapsed: trigger aria-expanded=false", async ({ page }) => {
    const trigger = page.locator('[data-testid="accordion-trigger-what"]');
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Accordion open: trigger aria-expanded=true", async ({ page }) => {
    const trigger = page.locator('[data-testid="accordion-trigger-what"]');
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("Accordion: trigger aria-controls links to content", async ({ page }) => {
    const trigger = page.locator('[data-testid="accordion-trigger-what"]');
    const contentId = await trigger.getAttribute("aria-controls");
    expect(contentId).toBeTruthy();
    await expect(page.locator(`#${contentId}`)).toHaveAttribute("data-forge-part", "content");
  });

  test("Accordion content: has role=region", async ({ page }) => {
    await page.locator('[data-testid="accordion-trigger-what"]').click();
    const content = page.locator('[data-testid="accordion-content-what"]');
    await content.waitFor({ state: "visible" });
    await expect(content).toHaveAttribute("role", "region");
  });

  test("Accordion content: aria-labelledby references trigger", async ({ page }) => {
    await page.locator('[data-testid="accordion-trigger-what"]').click();
    const content = page.locator('[data-testid="accordion-content-what"]');
    await content.waitFor({ state: "visible" });
    const labelId = await content.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    await expect(page.locator(`#${labelId}`)).toHaveAttribute("data-forge-part", "trigger");
  });

  test("Accordion open: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    await page.locator('[data-testid="accordion-trigger-what"]').click();
    await page.locator('[data-testid="accordion-content-what"]').waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="accordion"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Select (WAI-ARIA §3.14 Select-Only Combobox) ─────────────────────────

  test("Select: trigger has role=combobox", async ({ page }) => {
    const trigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first();
    await expect(trigger).toHaveAttribute("role", "combobox");
  });

  test("Select closed: trigger aria-expanded=false", async ({ page }) => {
    const trigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("Select open: trigger aria-expanded=true", async ({ page }) => {
    const trigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first();
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  test("Select: trigger has aria-haspopup=listbox", async ({ page }) => {
    const trigger = page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first();
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  });

  test("Select open: content has role=listbox", async ({ page }) => {
    await page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first().click();
    await page.locator('[role="listbox"]').first().waitFor({ state: "visible" });
    await expect(page.locator('[role="listbox"]').first()).toBeVisible();
  });

  test("Select open: options have role=option", async ({ page }) => {
    await page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first().click();
    await page.locator('[role="listbox"]').first().waitFor({ state: "visible" });
    await expect(page.locator('[role="option"]').first()).toBeVisible();
  });

  test("Select open: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    await page.locator('[data-forge-scope="select"][data-forge-part="trigger"]').first().click();
    await page.locator('[role="listbox"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="select"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Combobox (WAI-ARIA §3.8) ──────────────────────────────────────────────

  test("Combobox: input has role=combobox", async ({ page }) => {
    const input = page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').first();
    await expect(input).toHaveAttribute("role", "combobox");
  });

  test("Combobox: input has aria-haspopup=listbox", async ({ page }) => {
    const input = page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').first();
    await expect(input).toHaveAttribute("aria-haspopup", "listbox");
  });

  test("Combobox closed: input aria-expanded=false", async ({ page }) => {
    const input = page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').first();
    await expect(input).toHaveAttribute("aria-expanded", "false");
  });

  test("Combobox open: input aria-expanded=true", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const input = page.locator('[data-forge-scope="combobox"][data-forge-part="input"]').first();
    await expect(input).toHaveAttribute("aria-expanded", "true");
  });

  test("Combobox open: content has role=listbox", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    const content = page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first();
    await content.waitFor({ state: "visible" });
    await expect(content).toHaveAttribute("role", "listbox");
  });

  test("Combobox open: options have role=option", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const options = page.locator('[data-forge-scope="combobox"][data-forge-part="option"]');
    await expect(options.first()).toHaveAttribute("role", "option");
  });

  test("Combobox open: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="combobox"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── TagsInput (WAI-ARIA live region §7.4.3) ───────────────────────────────

  test("TagsInput: live region has role=status", async ({ page }) => {
    const liveRegion = page.locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]').first();
    await expect(liveRegion).toHaveAttribute("role", "status");
  });

  test("TagsInput: live region has aria-live=polite", async ({ page }) => {
    const liveRegion = page.locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]').first();
    await expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  test("TagsInput: tag delete buttons have aria-label", async ({ page }) => {
    const deleteBtn = page.locator('[data-forge-scope="tags-input"][data-forge-part="tag-delete"]').first();
    await expect(deleteBtn).toHaveAttribute("aria-label");
  });

  test("TagsInput: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    await page.locator('[data-forge-scope="tags-input"][data-forge-part="input"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="tags-input"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
