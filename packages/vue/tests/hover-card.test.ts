import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import {
  HoverCardContent,
  HoverCardRoot,
  HoverCardTrigger,
} from "../src/components/hover-card/HoverCard.js";
import { useHoverCard } from "../src/components/hover-card/use-hover-card.js";

// ---------------------------------------------------------------------------
// useHoverCard — static attributes only.
//
// NOTE: Interaction tests (hover open/close) require the compound components
// because HoverCardTrigger applies patchVueEvents internally, remapping
// onMouseEnter → onMouseenter (required when using h() for correct DOM binding).
// Raw v-bind of getTriggerProps() in a string template would bind to 'mouse-enter'
// (via Vue's hyphenate) instead of 'mouseenter', so mouse events would not fire.
// ---------------------------------------------------------------------------
describe("useHoverCard (Vue)", () => {
  it("content is absent by default", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0 }),
      template: `
        <div>
          <a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>
          <div v-if="isOpen" v-bind="getContentProps()" data-testid="content">Card</div>
        </div>
      `,
    });
    render(Fixture);
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("trigger has data-state=closed when closed", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0, closeDelay: 0 }),
      template: `
        <div>
          <a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>
        </div>
      `,
    });
    render(Fixture);
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
  });

  it("trigger has data-forge-scope=hover-card", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0 }),
      template: `<a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>`,
    });
    render(Fixture);
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "hover-card");
  });

  it("trigger has data-forge-part=trigger", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0 }),
      template: `<a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>`,
    });
    render(Fixture);
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
  });

  it("trigger has aria-haspopup=dialog", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0 }),
      template: `<a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>`,
    });
    render(Fixture);
    expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "dialog");
  });

  it("trigger has aria-expanded=false when closed", () => {
    const Fixture = defineComponent({
      setup: () => useHoverCard({ id: "test-hc", openDelay: 0 }),
      template: `<a v-bind="getTriggerProps()" data-testid="trigger" href="#">Hover</a>`,
    });
    render(Fixture);
    expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
  });
});

// ---------------------------------------------------------------------------
// HoverCard compound
// ---------------------------------------------------------------------------
describe("HoverCard compound (Vue)", () => {
  const user = userEvent.setup();

  describe("static attributes", () => {
    it("Trigger renders as <a> by default", () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger },
        template: `
          <HoverCardRoot id="trigger-tag" :openDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("trigger").tagName).toBe("A");
    });

    it("trigger has data-forge-part=trigger", () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger },
        template: `
          <HoverCardRoot id="parts" :openDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("trigger has data-forge-scope=hover-card", () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger },
        template: `
          <HoverCardRoot id="scope" :openDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "hover-card");
    });

    it("Trigger asChild renders consumer element with forge props", () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger },
        template: `
          <HoverCardRoot id="aschild" :openDelay="0">
            <HoverCardTrigger :asChild="true">
              <button data-testid="btn-trigger" type="button">Hover me</button>
            </HoverCardTrigger>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      const btn = screen.getByTestId("btn-trigger");
      expect(btn.tagName).toBe("BUTTON");
      expect(btn).toHaveAttribute("data-forge-part", "trigger");
      expect(btn).toHaveAttribute("data-forge-scope", "hover-card");
    });
  });

  describe("open / close", () => {
    it("opens on trigger hover", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="compound-open" :openDelay="0" :closeDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
    });

    it("trigger has data-state=open when open", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="ds-open" :openDelay="0" :closeDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "open"),
      );
    });

    it("trigger has aria-expanded=true when open", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="aria-open" :openDelay="0" :closeDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true"),
      );
    });

    it("closes on unhover", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="compound-close" :openDelay="0" :closeDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.queryByTestId("content")).not.toBeInTheDocument());
    });

    it("Content has role=dialog when open", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="role" :openDelay="0" :closeDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover</HoverCardTrigger>
            <HoverCardContent>Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    });

    it("emits update:open with true then false", async () => {
      const updates: boolean[] = [];
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        setup: () => ({ onUpdateOpen: (val: boolean) => updates.push(val) }),
        template: `
          <HoverCardRoot id="vmodel" :openDelay="0" :closeDelay="0" @update:open="onUpdateOpen">
            <HoverCardTrigger data-testid="trigger">Hover</HoverCardTrigger>
            <HoverCardContent data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(updates).toContain(true));
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(updates).toContain(false));
    });

    it("calls onOpenChange(true) on open", async () => {
      const onOpenChange = vi.fn();
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        setup: () => ({ onOpenChange }),
        template: `
          <HoverCardRoot id="cb-open" :openDelay="0" :closeDelay="0" :onOpenChange="onOpenChange">
            <HoverCardTrigger data-testid="trigger">Hover</HoverCardTrigger>
            <HoverCardContent>Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
    });

    it("calls onOpenChange(false) on close", async () => {
      const onOpenChange = vi.fn();
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        setup: () => ({ onOpenChange }),
        template: `
          <HoverCardRoot id="cb-close" :openDelay="0" :closeDelay="0" :onOpenChange="onOpenChange">
            <HoverCardTrigger data-testid="trigger">Hover</HoverCardTrigger>
            <HoverCardContent>Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(true));
      onOpenChange.mockClear();
      await user.unhover(screen.getByTestId("trigger"));
      await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    });
  });

  describe("stay-open behavior", () => {
    it("stays open when hovering over Content", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="stay-open" :openDelay="0" :closeDelay="200">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent :forceMount="true" data-testid="content"><a href="#">link</a></HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open"),
      );
      await user.hover(screen.getByTestId("content"));
      await new Promise((r) => setTimeout(r, 50));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });
  });

  describe("forceMount", () => {
    it("Content stays in DOM when closed", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="fm" :openDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent :forceMount="true" data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await nextTick();
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");
    });

    it("Content data-state becomes open on hover", async () => {
      const Fixture = defineComponent({
        components: { HoverCardRoot, HoverCardTrigger, HoverCardContent },
        template: `
          <HoverCardRoot id="fm-open" :openDelay="0">
            <HoverCardTrigger data-testid="trigger">Hover me</HoverCardTrigger>
            <HoverCardContent :forceMount="true" data-testid="content">Card</HoverCardContent>
          </HoverCardRoot>
        `,
      });
      render(Fixture);
      await user.hover(screen.getByTestId("trigger"));
      await waitFor(() =>
        expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open"),
      );
    });
  });
});
