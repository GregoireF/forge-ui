import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

test.describe("Accessibility (axe-core) — Nuxt playground", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test("page baseline: no critical a11y violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("AlertDialog open: no a11y violations", async ({ page }) => {
    await page.getByRole("button", { name: /supprimer/i }).first().click();
    await page.getByRole("alertdialog").waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Popover open: no a11y violations", async ({ page }) => {
    await page.getByRole("button", { name: "Ouvrir popover" }).first().click();
    await page.locator('[data-forge-part="content"][data-forge-scope="popover"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Accordion open: no a11y violations", async ({ page }) => {
    await page.locator('[data-testid="accordion-trigger-what"]').click();
    await page.locator('[data-testid="accordion-content-what"]').waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Tabs selected: no a11y violations", async ({ page }) => {
    await page.locator('[data-testid="tabs-trigger-vue"]').click();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Dialog open: no a11y violations", async ({ page }) => {
    await page.getByRole("button", { name: "Open dialog" }).click();
    await page.getByRole("dialog").waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Select open: no a11y violations", async ({ page }) => {
    await page.getByRole("combobox").first().click();
    await page.locator('[role="listbox"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Tooltip visible: no a11y violations", async ({ page }) => {
    await page.getByRole("button", { name: "Survol (400ms)" }).hover();
    await page.getByRole("tooltip").first().waitFor({ state: "visible", timeout: 2000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Combobox open: no a11y violations", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("HoverCard open: no a11y violations", async ({ page }) => {
    await page.locator('[data-forge-scope="hover-card"][data-forge-part="trigger"]').first().hover();
    await page.locator('[data-forge-scope="hover-card"][data-forge-part="content"]').first().waitFor({ state: "visible", timeout: 2000 });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Collapsible open: no a11y violations", async ({ page }) => {
    await page.locator('[data-testid="collapsible-trigger"]').first().click();
    await page.locator('[data-forge-scope="collapsible"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Field with validation error: no a11y violations", async ({ page }) => {
    const emailInput = page.locator('[data-forge-scope="field"][data-forge-part="control"]').first();
    await emailInput.fill("not-an-email");
    await emailInput.blur();
    await page.locator('[role="alert"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Tags-input with tags: no a11y violations", async ({ page }) => {
    await page.locator('[data-forge-scope="tags-input"][data-forge-part="input"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
