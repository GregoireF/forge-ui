import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3000";

test.describe("WAI-ARIA compliance — React playground", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  // ── Progress indeterminate (WAI-ARIA §6.9) ──────────────────────────────────
  // aria-busy=true signals to AT that the progressbar is in an indeterminate state.
  // Without it, screen readers cannot distinguish "loading" from "0% complete".

  test("Progress indeterminate: has aria-busy=true", async ({ page }) => {
    const progress = page.locator('[data-testid="progress-indeterminate"]');
    await expect(progress).toHaveAttribute("role", "progressbar");
    await expect(progress).toHaveAttribute("aria-busy", "true");
  });

  test("Progress indeterminate: no aria-valuenow (indeterminate has no numeric value)", async ({ page }) => {
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
  // When a tooltip is disabled, its content is never revealed — the trigger
  // must NOT have aria-describedby pointing to invisible (unreachable) content.

  test("Tooltip disabled: trigger has no aria-describedby", async ({ page }) => {
    const trigger = page.getByRole("button", { name: "Désactivé" }).first();
    await expect(trigger).not.toHaveAttribute("aria-describedby");
  });

  test("Tooltip enabled: trigger has aria-describedby", async ({ page }) => {
    // The first enabled tooltip trigger must have aria-describedby even when closed,
    // so AT knows a description is associated.
    const trigger = page.getByRole("button", { name: "Survol (400ms)" }).first();
    await expect(trigger).toHaveAttribute("aria-describedby");
  });

  // ── Field.Group role=group (WAI-ARIA §3.7) ────────────────────────────────
  // A div with role=group and aria-labelledby is the accessible equivalent of
  // <fieldset>/<legend> for grouping related form controls.

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
  // A switch must expose role=switch and aria-checked reflecting the on/off state.
  // Disabled switches must add aria-disabled so AT announces the restriction.

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
    // Second switch is rendered with disabled prop
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
  // tablist + tab + tabpanel roles must form a connected pattern:
  // each tab has aria-controls pointing to its panel, and aria-selected reflects state.

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
    const trigger = page.locator(`#${labelId}`);
    await expect(trigger).toHaveAttribute("role", "tab");
  });

  test("Tabs: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-forge-scope="tabs"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Accordion (WAI-ARIA §3.1) ─────────────────────────────────────────────
  // Each accordion trigger must expose aria-expanded and aria-controls pointing
  // to its content region. Content has role=region + aria-labelledby.

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
    const content = page.locator(`#${contentId}`);
    await expect(content).toHaveAttribute("data-forge-part", "content");
  });

  test("Accordion content: has role=region (WAI-ARIA landmark)", async ({ page }) => {
    const trigger = page.locator('[data-testid="accordion-trigger-what"]');
    await trigger.click();
    const content = page.locator('[data-testid="accordion-content-what"]');
    await content.waitFor({ state: "visible" });
    await expect(content).toHaveAttribute("role", "region");
  });

  test("Accordion content: aria-labelledby references trigger", async ({ page }) => {
    const trigger = page.locator('[data-testid="accordion-trigger-what"]');
    await trigger.click();
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
  // The trigger has role=combobox + aria-haspopup=listbox and manages
  // aria-expanded. The listbox content has role=listbox; options have role=option.

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
    const options = page.locator('[role="option"]');
    await expect(options.first()).toBeVisible();
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

  // ── Combobox (WAI-ARIA §3.8 Combobox) ────────────────────────────────────
  // The input has role=combobox, aria-haspopup=listbox, and aria-expanded.
  // When open, a listbox with role=listbox is presented; each option has role=option.

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
    await expect(options.first()).toBeVisible();
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

  // ── Toggle (WAI-ARIA Button Pattern §3.5) ─────────────────────────────────
  // A toggle is a button that maintains a pressed/not-pressed state.
  // It must use role="button" (native <button>) + aria-pressed, NOT role="checkbox".
  // APG §3.5: "A toggle button is created by setting the aria-pressed attribute on a button."

  test("Toggle: has type=button (native element)", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-bold"]');
    await expect(toggle).toHaveAttribute("type", "button");
  });

  test("Toggle unpressed: aria-pressed=false", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-bold"]');
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("Toggle: aria-pressed=true after click", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-bold"]');
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("Toggle defaultPressed=true: aria-pressed=true initially", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-italic"]');
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  test("Toggle disabled: aria-disabled=true", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-disabled"]');
    await expect(toggle).toHaveAttribute("aria-disabled", "true");
  });

  test("Toggle disabled: click does not change pressed state", async ({ page }) => {
    const toggle = page.locator('[data-testid="toggle-disabled"]');
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    await toggle.click({ force: true });
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  test("Toggle: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="toggle-bold"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── ToggleGroup / Toolbar (WAI-ARIA APG Toolbar Pattern) ─────────────────
  // A toolbar is a container for a group of controls — typically toggle buttons.
  // APG mandates role="toolbar" (not role="group") when arrow-key navigation applies.
  // Each item keeps role="button" + aria-pressed; roving tabindex handles focus.

  test("ToggleGroup: root has role=toolbar", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    await expect(toolbar).toHaveAttribute("role", "toolbar");
  });

  test("ToggleGroup: root has aria-label", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    const label = await toolbar.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("ToggleGroup: items have aria-pressed attribute", async ({ page }) => {
    const items = page.locator('[data-testid="toggle-group-text-align"] [data-forge-part="item"]');
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      await expect(items.nth(i)).toHaveAttribute("aria-pressed");
    }
  });

  test("ToggleGroup single: click selects item, aria-pressed=true", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    const items = toolbar.locator('[data-forge-part="item"]');
    await items.nth(0).click();
    await expect(items.nth(0)).toHaveAttribute("aria-pressed", "true");
  });

  test("ToggleGroup single: switching selection leaves only one pressed", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    const items = toolbar.locator('[data-forge-part="item"]');
    await items.nth(0).click();
    await items.nth(1).click();
    const pressedItems = toolbar.locator('[aria-pressed="true"]');
    await expect(pressedItems).toHaveCount(1);
  });

  test("ToggleGroup multiple: multiple items can be aria-pressed=true", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-formatting"]');
    const items = toolbar.locator('[data-forge-part="item"]');
    await items.nth(0).click();
    await items.nth(1).click();
    const pressedItems = toolbar.locator('[aria-pressed="true"]');
    await expect(pressedItems).toHaveCount(2);
  });

  test("ToggleGroup: roving tabindex — only one item has tabindex=0", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    const items = toolbar.locator('[data-forge-part="item"]');
    const tabIndices = await items.evaluateAll((els) => els.map((el) => el.getAttribute("tabindex")));
    const zeroCount = tabIndices.filter((t) => t === "0").length;
    expect(zeroCount).toBe(1);
  });

  test("ToggleGroup: ArrowRight moves focus to next item", async ({ page }) => {
    const toolbar = page.locator('[data-testid="toggle-group-text-align"]');
    const items = toolbar.locator('[data-forge-part="item"]');
    await items.first().focus();
    await page.keyboard.press("ArrowRight");
    await expect(items.nth(1)).toBeFocused();
  });

  test("ToggleGroup: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="toggle-group-text-align"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── Separator (WAI-ARIA §6.15) ────────────────────────────────────────────
  // A semantic separator carries role=separator + aria-orientation.
  // A decorative separator must have role=none + aria-hidden=true
  // so AT skips it entirely (it conveys no structural information).

  test("Separator semantic: has role=separator", async ({ page }) => {
    const sep = page.locator('[data-testid="separator-semantic"]');
    await expect(sep).toHaveAttribute("role", "separator");
  });

  test("Separator semantic: has aria-orientation=horizontal (default)", async ({ page }) => {
    const sep = page.locator('[data-testid="separator-semantic"]');
    await expect(sep).toHaveAttribute("aria-orientation", "horizontal");
  });

  test("Separator decorative: has role=none", async ({ page }) => {
    const sep = page.locator('[data-testid="separator-decorative"]');
    await expect(sep).toHaveAttribute("role", "none");
  });

  test("Separator decorative: has aria-hidden=true", async ({ page }) => {
    const sep = page.locator('[data-testid="separator-decorative"]');
    await expect(sep).toHaveAttribute("aria-hidden", "true");
  });

  test("Separator: no axe violations (WCAG2A + WCAG21AA)", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .include('[data-testid="separator-semantic"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  // ── TagsInput (WAI-ARIA live region §7.4.3) ───────────────────────────────
  // TagsInput uses a live region (role=status, aria-live=polite) to announce
  // tag additions/removals to screen readers without requiring focus.
  // Tag delete buttons must have an accessible name via aria-label.

  test("TagsInput: live region has role=status", async ({ page }) => {
    const liveRegion = page.locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]').first();
    await expect(liveRegion).toHaveAttribute("role", "status");
  });

  test("TagsInput: live region has aria-live=polite", async ({ page }) => {
    const liveRegion = page.locator('[data-forge-scope="tags-input"][data-forge-part="live-region"]').first();
    await expect(liveRegion).toHaveAttribute("aria-live", "polite");
  });

  test("TagsInput: tag delete buttons have aria-label", async ({ page }) => {
    // Initial tags: "TypeScript", "React"
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
