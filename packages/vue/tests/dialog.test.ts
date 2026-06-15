import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, nextTick } from "vue";
import { Dialog } from "../src/components/dialog/Dialog.js";
import { DialogPortal } from "../src/components/dialog/DialogPortal.js";
import { useDialog } from "../src/components/dialog/use-dialog.js";

// ---------------------------------------------------------------------------
// Test component — uses useDialog() headless hook directly
// ---------------------------------------------------------------------------
function makeDialogFixture(
  props: {
    onOpenChange?: (open: boolean) => void;
    onEscapeKeyDown?: (e: KeyboardEvent) => void;
    onInteractOutside?: (e: PointerEvent | FocusEvent) => void;
  } = {},
) {
  return defineComponent({
    setup() {
      return useDialog({
        id: "test-dialog",
        ...props,
      });
    },
    template: `
      <div>
        <button v-bind="getTriggerProps()" data-testid="trigger">Open</button>
        <template v-if="isOpen">
          <div v-bind="getOverlayProps()" data-testid="overlay" />
          <div v-bind="getContentProps()" data-testid="content">
            <h2 v-bind="getTitleProps()">Dialog Title</h2>
            <p v-bind="getDescriptionProps()">Description</p>
            <button v-bind="getCloseProps()" data-testid="close-btn">Close</button>
          </div>
        </template>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useDialog (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(makeDialogFixture());
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes on close button click", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("ARIA attributes", () => {
    it("trigger has aria-expanded=false when closed", () => {
      render(makeDialogFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
    });

    it("trigger has aria-expanded=true when open", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("dialog has role=dialog and aria-modal", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });
  });

  describe("data attributes", () => {
    it("trigger has data-state=closed when dialog is closed", () => {
      render(makeDialogFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
    });

    it("trigger has data-state=open when dialog is open", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "open");
    });

    it("content has data-state=open when open", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });

    it("trigger has data-forge-part=trigger", () => {
      render(makeDialogFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });
  });

  describe("keyboard interaction", () => {
    it("closes on Escape key by default", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("stays open on Escape when onEscapeKeyDown calls e.preventDefault()", async () => {
      render(makeDialogFixture({ onEscapeKeyDown: (e) => e.preventDefault() }));
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("outside click", () => {
    it("closes on overlay click by default", async () => {
      render(makeDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("overlay"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("stays open when onInteractOutside calls e.preventDefault()", async () => {
      render(makeDialogFixture({ onInteractOutside: (e) => e.preventDefault() }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("overlay"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onOpenChange(true) when dialog opens", async () => {
      const onOpenChange = vi.fn();
      render(makeDialogFixture({ onOpenChange }));
      await user.click(screen.getByTestId("trigger"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("calls onOpenChange(false) when dialog closes", async () => {
      const onOpenChange = vi.fn();
      render(makeDialogFixture({ onOpenChange }));
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });
  });

  describe("Dialog compound", () => {
    // Note: <Dialog.Root> dot-notation only works in SFC <script setup>.
    // In defineComponent string templates, register named exports directly.
    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Overlay: DialogOverlay,
      Content: DialogContent,
      Title: DialogTitle,
      Description: DialogDescription,
      Close: DialogClose,
    } = Dialog;

    it("opens and closes via compound API", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-compound">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent data-testid="content">
              <DialogTitle>Title</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(screen.getByTestId("close"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("aria-labelledby and aria-describedby are set when Title and Description are mounted", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose },
        template: `
          <DialogRoot id="test-aria-ids">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>Title</DialogTitle>
              <DialogDescription>Desc</DialogDescription>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger"));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "test-aria-ids-title");
      expect(dialog).toHaveAttribute("aria-describedby", "test-aria-ids-description");
    });

    it("Content with forceMount stays in DOM when closed", () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        template: `
          <DialogRoot id="test-fm">
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent :forceMount="true" data-testid="content">
              <DialogTitle>Title</DialogTitle>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");
    });

    it("Trigger asChild merges forge props onto consumer element", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        template: `
          <DialogRoot id="test-aschild">
            <DialogTrigger :asChild="true">
              <a data-testid="link-trigger" href="#">Open</a>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      const link = screen.getByTestId("link-trigger");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("aria-expanded", "false");
      expect(link).toHaveAttribute("aria-haspopup", "dialog");
      expect(link).toHaveAttribute("data-forge-part", "trigger");
      await user.click(link);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("compound parts have correct data-forge-part attributes", async () => {
      const Fixture = defineComponent({
        components: {
          DialogRoot,
          DialogTrigger,
          DialogOverlay,
          DialogContent,
          DialogTitle,
          DialogDescription,
          DialogClose,
        },
        template: `
          <DialogRoot id="test-parts">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogOverlay data-testid="overlay" />
            <DialogContent data-testid="content">
              <DialogTitle data-testid="title">Title</DialogTitle>
              <DialogDescription data-testid="desc">Desc</DialogDescription>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("overlay")).toHaveAttribute("data-forge-part", "overlay");
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
      expect(screen.getByTestId("title")).toHaveAttribute("data-forge-part", "title");
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-part", "description");
      expect(screen.getByTestId("close")).toHaveAttribute("data-forge-part", "close");
    });

    it("compound parts have data-forge-scope=dialog", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-scope">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent data-testid="content">
              <DialogTitle>T</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-scope", "dialog");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "dialog");
    });
  });

  describe("focus management", () => {
    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Content: DialogContent,
      Title: DialogTitle,
      Close: DialogClose,
    } = Dialog;

    it("restores focus to trigger after dialog closes", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-focus-restore">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      const trigger = screen.getByTestId("trigger");
      trigger.focus();
      await user.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
    });

    it("traps Tab key — focus stays within dialog", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-trap">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent data-testid="content">
              <DialogTitle>T</DialogTitle>
              <button data-testid="btn-a">A</button>
              <button data-testid="btn-b">B</button>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger"));
      screen.getByTestId("close").focus();
      await user.keyboard("{Tab}");
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });

    it("traps Shift+Tab key — focus stays within dialog", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-shift-trap">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent data-testid="content">
              <DialogTitle>T</DialogTitle>
              <button data-testid="btn-a">A</button>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger"));
      screen.getByTestId("btn-a").focus();
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });
  });

  describe("controlled mode", () => {
    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Content: DialogContent,
      Title: DialogTitle,
      Close: DialogClose,
    } = Dialog;

    it("opens immediately when open=true is passed", () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        template: `
          <DialogRoot id="test-controlled" :open="true">
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent><DialogTitle>T</DialogTitle></DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("fires onOpenChange with true when opened", async () => {
      const onOpenChange = vi.fn();
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        setup() {
          return { onOpenChange };
        },
        template: `
          <DialogRoot id="test-onchange" :onOpenChange="onOpenChange">
            <DialogTrigger data-testid="trig">Open</DialogTrigger>
            <DialogContent><DialogTitle>T</DialogTitle></DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fires onOpenChange with false when closed", async () => {
      const onOpenChange = vi.fn();
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        setup() {
          return { onOpenChange };
        },
        template: `
          <DialogRoot id="test-onchange-close" :onOpenChange="onOpenChange">
            <DialogTrigger data-testid="trig">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("close"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("v-model:open — emits update:open on open/close", async () => {
      const updates: boolean[] = [];
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        setup() {
          return {
            onUpdateOpen: (val: boolean) => updates.push(val),
          };
        },
        template: `
          <DialogRoot id="test-vmodel" @update:open="onUpdateOpen">
            <DialogTrigger data-testid="trig">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      await user.click(screen.getByTestId("close"));
      expect(updates).toEqual([true, false]);
    });
  });

  describe("aria-hidden (modal)", () => {
    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Content: DialogContent,
      Title: DialogTitle,
      Close: DialogClose,
    } = Dialog;

    it("sets aria-hidden on background elements when modal dialog opens", async () => {
      const background = document.createElement("aside");
      document.body.appendChild(background);

      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        template: `
          <DialogRoot id="test-aria-modal">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger"));
      await waitFor(() => {
        expect(background.getAttribute("aria-hidden")).toBe("true");
      });
      document.body.removeChild(background);
    });

    it("removes aria-hidden when the dialog closes", async () => {
      const background = document.createElement("section");
      document.body.appendChild(background);

      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="test-aria-cleanup">
            <DialogTrigger data-testid="trigger">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>T</DialogTitle>
              <DialogClose data-testid="close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trigger"));
      await waitFor(() => {
        expect(background.getAttribute("aria-hidden")).toBe("true");
      });

      await user.click(screen.getByTestId("close"));
      expect(background.getAttribute("aria-hidden")).toBeNull();
      document.body.removeChild(background);
    });
  });

  describe("nested dialogs", () => {
    // aria-hidden is applied immediately on close (before Presence removes the DOM node).
    // queryByRole excludes aria-hidden elements, so this checks "accessible closed"
    // without waiting for the 1 s Presence fallback.

    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Content: DialogContent,
      Title: DialogTitle,
      Close: DialogClose,
    } = Dialog;

    it("Escape closes only the innermost dialog, outer stays open", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="vue-nd-outer">
            <DialogTrigger data-testid="vue-nd-outer-trigger">Open outer</DialogTrigger>
            <DialogContent>
              <DialogTitle>Outer dialog</DialogTitle>
              <DialogRoot id="vue-nd-inner">
                <DialogTrigger data-testid="vue-nd-inner-trigger">Open inner</DialogTrigger>
                <DialogContent>
                  <DialogTitle>Inner dialog</DialogTitle>
                  <DialogClose data-testid="vue-nd-inner-close">×</DialogClose>
                </DialogContent>
              </DialogRoot>
              <DialogClose data-testid="vue-nd-outer-close">×</DialogClose>
            </DialogContent>
          </DialogRoot>
        `,
      });

      render(Fixture);
      await user.click(screen.getByTestId("vue-nd-outer-trigger"));
      expect(screen.getByRole("dialog", { name: "Outer dialog" })).toBeInTheDocument();

      await user.click(screen.getByTestId("vue-nd-inner-trigger"));
      expect(screen.getByRole("dialog", { name: "Inner dialog" })).toBeInTheDocument();

      await user.keyboard("{Escape}");
      // Inner becomes aria-hidden — not accessible anymore
      expect(screen.queryByRole("dialog", { name: "Inner dialog" })).not.toBeInTheDocument();
      // Outer dialog stays accessible
      expect(screen.getByRole("dialog", { name: "Outer dialog" })).toBeInTheDocument();
    });

    it("second Escape closes the outer dialog", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle, DialogClose },
        template: `
          <DialogRoot id="vue-nd-outer2">
            <DialogTrigger data-testid="vue-nd-outer2-trigger">Open outer</DialogTrigger>
            <DialogContent>
              <DialogTitle>Outer dialog 2</DialogTitle>
              <DialogRoot id="vue-nd-inner2">
                <DialogTrigger data-testid="vue-nd-inner2-trigger">Open inner</DialogTrigger>
                <DialogContent>
                  <DialogTitle>Inner dialog 2</DialogTitle>
                </DialogContent>
              </DialogRoot>
            </DialogContent>
          </DialogRoot>
        `,
      });

      render(Fixture);
      await user.click(screen.getByTestId("vue-nd-outer2-trigger"));
      await user.click(screen.getByTestId("vue-nd-inner2-trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog", { name: "Inner dialog 2" })).not.toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog", { name: "Outer dialog 2" })).not.toBeInTheDocument();
    });
  });

  describe("alertdialog", () => {
    const {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Content: DialogContent,
      Title: DialogTitle,
    } = Dialog;

    it("stays open on Escape (alertdialog blocks close)", async () => {
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        template: `
          <DialogRoot id="vue-ad-escape" role="alertdialog">
            <DialogTrigger data-testid="trig">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>Alert</DialogTitle>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      // alertdialog must not close on Escape per WAI-ARIA
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("fires onEscapeKeyDown callback with defaultPrevented=false at call time", async () => {
      let capturedDefaultPrevented: boolean | null = null;
      const Fixture = defineComponent({
        components: { DialogRoot, DialogTrigger, DialogContent, DialogTitle },
        setup() {
          return {
            onEscapeKeyDown(e: KeyboardEvent) {
              capturedDefaultPrevented = e.defaultPrevented;
            },
          };
        },
        template: `
          <DialogRoot id="vue-ad-cb" role="alertdialog" :onEscapeKeyDown="onEscapeKeyDown">
            <DialogTrigger data-testid="trig">Open</DialogTrigger>
            <DialogContent>
              <DialogTitle>Alert</DialogTitle>
            </DialogContent>
          </DialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      await user.keyboard("{Escape}");
      // User callback sees a fresh, not-yet-prevented event
      expect(capturedDefaultPrevented).toBe(false);
      // Dialog still open (prevented after callback)
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  describe("DialogPortal", () => {
    it("renders children via Teleport after mount", async () => {
      const Fixture = defineComponent({
        components: { DialogPortal },
        template: `
          <div id="app-root">
            <DialogPortal>
              <span data-testid="portal-child">teleported</span>
            </DialogPortal>
          </div>
        `,
      });
      render(Fixture);
      // onMounted sets isMounted = true → triggers a reactivity re-render.
      // nextTick flushes Vue's async DOM update queue before asserting.
      await nextTick();
      expect(screen.getByTestId("portal-child")).toBeInTheDocument();
    });
  });
});
