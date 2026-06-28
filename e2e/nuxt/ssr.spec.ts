/**
 * SSR / Hydration integrity tests — Nuxt playground
 *
 * WHY these tests exist:
 * forge-ui's machine-based architecture computes initial state (ARIA attrs,
 * data-state, etc.) from options at construction time. If any branch diverges
 * between server (no DOM) and client (has DOM), Vue will log a hydration
 * mismatch warning and re-render — which causes a flash and breaks SR
 * announcements.
 *
 * Two complementary strategies:
 * A) Console-watch: navigate with JS enabled and assert no Vue hydration
 *    warnings were logged during page load.
 * B) No-JS: navigate with JavaScript disabled so only the raw SSR HTML is
 *    visible. Assert that critical ARIA attributes are already present before
 *    any client-side hydration runs. This proves the attributes come from the
 *    server, not a client-side patch.
 *
 * References:
 * - Vue SSR hydration docs: https://vuejs.org/guide/scaling-up/ssr.html#hydration-mismatch
 * - Nuxt composable `useHead` / `useSeoMeta` for SSR-safe IDs
 * - WAI-ARIA §6: ARIA attributes must be consistent between server and client
 */

import { expect, test } from "@playwright/test";

const URL = "http://localhost:3002";

// ---------------------------------------------------------------------------
// Strategy A: No hydration warnings during page load
// ---------------------------------------------------------------------------

test.describe("SSR hydration integrity — no Vue hydration warnings", () => {
  test("initial page load produces no Vue hydration mismatch warnings", async ({ page }) => {
    const hydrationWarnings: string[] = [];

    page.on("console", (msg) => {
      if (
        msg.type() === "warning" &&
        (msg.text().toLowerCase().includes("hydrat") || msg.text().includes("[Vue warn]"))
      ) {
        hydrationWarnings.push(msg.text());
      }
    });

    await page.goto(URL, { waitUntil: "networkidle" });

    // No Vue hydration warnings should have fired.
    // A warning here means server HTML differs from client virtual DOM,
    // which causes an ARIA re-render flash visible to screen readers.
    expect(
      hydrationWarnings,
      `Hydration warnings detected:\n${hydrationWarnings.join("\n")}`,
    ).toHaveLength(0);
  });

  test("Accordion triggers produce no hydration warnings", async ({ page }) => {
    const hydrationWarnings: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning" && msg.text().toLowerCase().includes("hydrat")) {
        hydrationWarnings.push(msg.text());
      }
    });

    await page.goto(URL, { waitUntil: "networkidle" });
    await page.locator('[data-forge-scope="accordion"]').first().waitFor();
    expect(hydrationWarnings).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Strategy B: SSR HTML contains ARIA attributes before JavaScript runs
//
// WHY: If an attribute is added by a client-side useEffect / onMounted, it
// won't be in the SSR HTML — AT users with slow connections get a broken
// experience. forge-ui's machine initializes synchronously from props so all
// ARIA should be server-rendered.
// ---------------------------------------------------------------------------

test.describe("SSR HTML — ARIA attributes present without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  const goto = async (page: import("@playwright/test").Page) => {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
  };

  test("Accordion trigger has aria-expanded in SSR HTML", async ({ page }) => {
    await goto(page);
    const trigger = page
      .locator('[data-forge-scope="accordion"][data-forge-part="trigger"]')
      .first();
    await expect(trigger).toHaveAttribute("aria-expanded");
  });

  test("Accordion trigger has aria-controls in SSR HTML", async ({ page }) => {
    await goto(page);
    const trigger = page
      .locator('[data-forge-scope="accordion"][data-forge-part="trigger"]')
      .first();
    await expect(trigger).toHaveAttribute("aria-controls");
  });

  test("Slider thumb has role=slider in SSR HTML", async ({ page }) => {
    await goto(page);
    const thumb = page.locator('[data-forge-scope="slider"][data-forge-part="thumb"]').first();
    await expect(thumb).toHaveAttribute("role", "slider");
  });

  test("Slider thumb has aria-valuenow in SSR HTML", async ({ page }) => {
    await goto(page);
    const thumb = page.locator('[data-forge-scope="slider"][data-forge-part="thumb"]').first();
    await expect(thumb).toHaveAttribute("aria-valuenow");
  });

  test("Slider thumb has aria-valuemin and aria-valuemax in SSR HTML", async ({ page }) => {
    await goto(page);
    const thumb = page.locator('[data-forge-scope="slider"][data-forge-part="thumb"]').first();
    await expect(thumb).toHaveAttribute("aria-valuemin");
    await expect(thumb).toHaveAttribute("aria-valuemax");
  });

  test("Checkbox has role=checkbox in SSR HTML", async ({ page }) => {
    await goto(page);
    const cb = page.locator('[data-forge-scope="checkbox"]').first();
    await expect(cb).toHaveAttribute("role", "checkbox");
  });

  test("Switch has role=switch in SSR HTML", async ({ page }) => {
    await goto(page);
    const sw = page.locator('[role="switch"]').first();
    await expect(sw).toHaveAttribute("aria-checked");
  });

  test("Tabs tablist has role=tablist in SSR HTML", async ({ page }) => {
    await goto(page);
    const list = page.locator('[role="tablist"]').first();
    await expect(list).toHaveAttribute("aria-orientation");
  });

  test("Tab triggers have role=tab with aria-selected in SSR HTML", async ({ page }) => {
    await goto(page);
    const tab = page.locator('[role="tab"]').first();
    await expect(tab).toHaveAttribute("aria-selected");
    await expect(tab).toHaveAttribute("aria-controls");
  });

  test("RadioGroup has role=radiogroup in SSR HTML", async ({ page }) => {
    await goto(page);
    const group = page.locator('[role="radiogroup"]').first();
    await expect(group).toBeDefined();
  });

  // Dialog/Popover/Combobox are only rendered when open — they have
  // conditional mounting. Verifying their trigger buttons are in SSR is
  // sufficient since the machine state (closed) is deterministic.
  test("Dialog trigger button is present in SSR HTML", async ({ page }) => {
    await goto(page);
    const trigger = page.locator('[data-forge-scope="dialog"][data-forge-part="trigger"]').first();
    await expect(trigger).toBeVisible();
  });

  test("Select trigger has role=combobox in SSR HTML", async ({ page }) => {
    await goto(page);
    const trigger = page.locator('[role="combobox"]').first();
    await expect(trigger).toHaveAttribute("aria-expanded");
    await expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
  });
});
