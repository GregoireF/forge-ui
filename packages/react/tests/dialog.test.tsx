import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "../src/components/dialog/Dialog.js";
import { DialogPortal } from "../src/components/dialog/DialogPortal.js";
import { useDialog } from "../src/components/dialog/use-dialog.js";

// ---------------------------------------------------------------------------
// Test component
// ---------------------------------------------------------------------------
function DialogFixture({
  onOpen,
  onClose,
  closeOnEscapeKey,
  closeOnInteractOutside,
}: {
  onOpen?: () => void;
  onClose?: () => void;
  closeOnEscapeKey?: boolean;
  closeOnInteractOutside?: boolean;
}) {
  const dialog = useDialog({
    id: "test-dialog",
    onOpen,
    onClose,
    closeOnEscapeKey,
    closeOnInteractOutside,
  });

  return (
    <div>
      <button {...dialog.getTriggerProps()} data-testid="trigger">
        Open
      </button>

      {dialog.isOpen && (
        <>
          <div {...dialog.getBackdropProps()} data-testid="backdrop" />
          <div {...dialog.getContentProps()} data-testid="content">
            <h2 {...dialog.getTitleProps()}>Dialog Title</h2>
            <p {...dialog.getDescriptionProps()}>Description</p>
            <button {...dialog.getCloseProps()} data-testid="close-btn">
              Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useDialog (React)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(<DialogFixture />);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes on close button click", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("ARIA attributes", () => {
    it("trigger has aria-expanded=false when closed", () => {
      render(<DialogFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "false");
    });

    it("trigger has aria-expanded=true when open", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-expanded", "true");
    });

    it("dialog has role=dialog and aria-modal", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
      expect(dialog).toHaveAttribute("aria-labelledby", "test-dialog-title");
      expect(dialog).toHaveAttribute("aria-describedby", "test-dialog-description");
    });
  });

  describe("data attributes", () => {
    it("trigger has data-state=closed when dialog is closed", () => {
      render(<DialogFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "closed");
    });

    it("trigger has data-state=open when dialog is open", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-state", "open");
    });

    it("content has data-state=open when open", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "open");
    });

    it("backdrop has data-state=open when open", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("backdrop")).toHaveAttribute("data-state", "open");
    });

    it("trigger has data-forge-part=trigger", () => {
      render(<DialogFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
    });

    it("content has data-forge-part=content when open", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
    });
  });

  describe("keyboard interaction", () => {
    it("closes on Escape key by default", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("stays open on Escape when closeOnEscapeKey=false", async () => {
      render(<DialogFixture closeOnEscapeKey={false} />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("outside click", () => {
    it("closes on backdrop click by default", async () => {
      render(<DialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("backdrop"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("stays open when closeOnInteractOutside=false", async () => {
      render(<DialogFixture closeOnInteractOutside={false} />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("backdrop"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("calls onOpen when dialog opens", async () => {
      const onOpen = vi.fn();
      render(<DialogFixture onOpen={onOpen} />);
      await user.click(screen.getByTestId("trigger"));
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it("calls onClose when dialog closes", async () => {
      const onClose = vi.fn();
      render(<DialogFixture onClose={onClose} />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("close-btn"));
      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe("Dialog compound", () => {
    it("opens and closes via compound API", async () => {
      render(
        <Dialog.Root id="test-compound">
          <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
          <Dialog.Content data-testid="content">
            <Dialog.Title>Title</Dialog.Title>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(screen.getByTestId("close"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("Content with forceMount stays in DOM when closed", () => {
      render(
        <Dialog.Root id="test-fm">
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Content forceMount data-testid="content">
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );
      // Must be in DOM even before trigger click
      expect(screen.getByTestId("content")).toBeInTheDocument();
      expect(screen.getByTestId("content")).toHaveAttribute("data-state", "closed");
    });

    it("Trigger asChild merges forge props onto consumer element", async () => {
      render(
        <Dialog.Root id="test-aschild">
          <Dialog.Trigger asChild>
            {/* biome-ignore lint/a11y/useValidAnchor: test for asChild pattern */}
            <a data-testid="link-trigger" href="#">
              Open
            </a>
          </Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );
      const link = screen.getByTestId("link-trigger");
      // forge aria attributes merged onto <a>
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("aria-expanded", "false");
      expect(link).toHaveAttribute("aria-haspopup", "dialog");
      expect(link).toHaveAttribute("data-forge-part", "trigger");
      // click still opens dialog
      await user.click(link);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("Close asChild merges forge props onto consumer element", async () => {
      render(
        <Dialog.Root id="test-close-aschild">
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
            <Dialog.Close asChild>
              {/* biome-ignore lint/a11y/useValidAnchor: test for asChild pattern */}
              <a data-testid="link-close" href="#">
                Close
              </a>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      const link = screen.getByTestId("link-close");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("data-forge-part", "close");
      await user.click(link);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("compound parts have correct data-forge-part attributes", async () => {
      render(
        <Dialog.Root id="test-parts">
          <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
          <Dialog.Overlay data-testid="overlay" />
          <Dialog.Content data-testid="content">
            <Dialog.Title data-testid="title">Title</Dialog.Title>
            <Dialog.Description data-testid="desc">Desc</Dialog.Description>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      expect(screen.getByTestId("trigger")).toHaveAttribute("data-forge-part", "trigger");
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("overlay")).toHaveAttribute("data-forge-part", "backdrop");
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-part", "content");
      expect(screen.getByTestId("title")).toHaveAttribute("data-forge-part", "title");
      expect(screen.getByTestId("desc")).toHaveAttribute("data-forge-part", "description");
      expect(screen.getByTestId("close")).toHaveAttribute("data-forge-part", "close");
    });
  });

  describe("aria-hidden (modal)", () => {
    it("sets aria-hidden on background elements when modal dialog opens", async () => {
      const background = document.createElement("aside");
      background.setAttribute("data-testid", "bg");
      document.body.appendChild(background);

      render(
        <Dialog.Root id="test-aria-modal">
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );

      await user.click(screen.getByTestId("trig"));
      expect(background.getAttribute("aria-hidden")).toBe("true");

      document.body.removeChild(background);
    });

    it("removes aria-hidden when the dialog closes", async () => {
      const background = document.createElement("section");
      document.body.appendChild(background);

      render(
        <Dialog.Root id="test-aria-cleanup">
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );

      await user.click(screen.getByTestId("trig"));
      expect(background.getAttribute("aria-hidden")).toBe("true");

      await user.click(screen.getByTestId("close"));
      expect(background.getAttribute("aria-hidden")).toBeNull();

      document.body.removeChild(background);
    });

    it("does not set aria-hidden when modal=false", async () => {
      const background = document.createElement("aside");
      document.body.appendChild(background);

      render(
        <Dialog.Root id="test-aria-nonmodal" modal={false}>
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content forceMount>
            <Dialog.Title>T</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );

      await user.click(screen.getByTestId("trig"));
      expect(background.getAttribute("aria-hidden")).toBeNull();

      document.body.removeChild(background);
    });
  });

  describe("focus management", () => {
    it("restores focus to trigger after dialog closes", async () => {
      render(<DialogFixture />);
      const trigger = screen.getByTestId("trigger");
      trigger.focus();
      await user.click(trigger);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.keyboard("{Escape}");
      expect(trigger).toHaveFocus();
    });

    it("traps Tab key — focus stays within dialog", async () => {
      render(
        <Dialog.Root id="test-trap">
          <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
          <Dialog.Content data-testid="content">
            <Dialog.Title>T</Dialog.Title>
            <button type="button" data-testid="btn-a">
              A
            </button>
            <button type="button" data-testid="btn-b">
              B
            </button>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      // Focus last button, Tab should wrap to first
      screen.getByTestId("close").focus();
      await user.keyboard("{Tab}");
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });

    it("traps Shift+Tab key — focus stays within dialog", async () => {
      render(
        <Dialog.Root id="test-shift-trap">
          <Dialog.Trigger data-testid="trigger">Open</Dialog.Trigger>
          <Dialog.Content data-testid="content">
            <Dialog.Title>T</Dialog.Title>
            <button type="button" data-testid="btn-a">
              A
            </button>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      await user.click(screen.getByTestId("trigger"));
      // Focus first focusable inside content, Shift+Tab should wrap to last
      screen.getByTestId("btn-a").focus();
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(screen.getByRole("dialog")).toContainElement(document.activeElement as HTMLElement);
    });
  });

  describe("controlled mode", () => {
    it("opens immediately when open=true is passed", () => {
      render(
        <Dialog.Root id="test-controlled" open={true}>
          <Dialog.Trigger>Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("closes when open prop changes to false", async () => {
      function Wrapper() {
        const [open, setOpen] = React.useState(true);
        return (
          <>
            <button type="button" data-testid="ext-close" onClick={() => setOpen(false)}>
              Close externally
            </button>
            <Dialog.Root id="test-controlled-close" open={open} onOpenChange={setOpen}>
              <Dialog.Trigger>Open</Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Title>T</Dialog.Title>
              </Dialog.Content>
            </Dialog.Root>
          </>
        );
      }
      render(<Wrapper />);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      await user.click(screen.getByTestId("ext-close"));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("fires onOpenChange with true when opened", async () => {
      const onOpenChange = vi.fn();
      render(
        <Dialog.Root id="test-onchange" onOpenChange={onOpenChange}>
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fires onOpenChange with false when closed", async () => {
      const onOpenChange = vi.fn();
      render(
        <Dialog.Root id="test-onchange-close" onOpenChange={onOpenChange}>
          <Dialog.Trigger data-testid="trig">Open</Dialog.Trigger>
          <Dialog.Content>
            <Dialog.Title>T</Dialog.Title>
            <Dialog.Close data-testid="close">×</Dialog.Close>
          </Dialog.Content>
        </Dialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("close"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("DialogPortal", () => {
    it("renders children into document.body", () => {
      const { baseElement } = render(
        <div id="app-root">
          <DialogPortal>
            <span data-testid="portal-child">inside portal</span>
          </DialogPortal>
        </div>,
      );
      // The portal child must exist in the document
      expect(screen.getByTestId("portal-child")).toBeInTheDocument();
      // But NOT inside #app-root — it was teleported to document.body
      const appRoot = baseElement.querySelector("#app-root");
      expect(appRoot?.querySelector("[data-testid='portal-child']")).toBeNull();
    });

    it("renders inline when container=null (disabled mode)", () => {
      render(
        <div data-testid="app-root">
          <DialogPortal container={null}>
            <span data-testid="inline-child">inline</span>
          </DialogPortal>
        </div>,
      );
      const appRoot = screen.getByTestId("app-root");
      expect(appRoot.querySelector("[data-testid='inline-child']")).not.toBeNull();
    });
  });
});
