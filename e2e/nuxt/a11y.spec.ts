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

  test("Combobox open: no a11y violations", async ({ page }) => {
    await page.locator('[data-forge-scope="combobox"][data-forge-part="trigger"]').first().click();
    await page.locator('[data-forge-scope="combobox"][data-forge-part="content"]').first().waitFor({ state: "visible" });
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
});
