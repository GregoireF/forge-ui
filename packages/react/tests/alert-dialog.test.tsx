import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AlertDialog } from "../src/components/alert-dialog/AlertDialog.js";
import { useAlertDialog } from "../src/components/alert-dialog/use-alert-dialog.js";

// ---------------------------------------------------------------------------
// Test component — uses useAlertDialog() headless hook directly
// ---------------------------------------------------------------------------
function AlertDialogFixture({
  onOpenChange,
  onEscapeKeyDown,
}: {
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (e: KeyboardEvent) => void;
} = {}) {
  const dialog = useAlertDialog({
    id: "test-alert-dialog",
    onOpenChange,
    onEscapeKeyDown,
  });

  return (
    <div>
      <button {...dialog.getTriggerProps()} data-testid="trigger">
        Open
      </button>
      {dialog.isOpen && (
        <div {...dialog.getContentProps()} data-testid="content">
          <h2 {...dialog.getTitleProps()}>Alert Title</h2>
          <p {...dialog.getDescriptionProps()}>This action cannot be undone.</p>
          <button {...dialog.getCancelProps()} data-testid="cancel-btn">
            Cancel
          </button>
          <button {...dialog.getActionProps()} data-testid="action-btn">
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useAlertDialog (React)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(<AlertDialogFixture />);
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("closes on Cancel click", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("cancel-btn"));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("Action button does NOT auto-close the dialog", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("action-btn"));
      // Action has no built-in close behavior — dialog stays open until caller decides
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("has role=alertdialog", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("trigger has aria-haspopup=alertdialog", () => {
      render(<AlertDialogFixture />);
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "alertdialog");
    });

    it("cancel button has data-forge-part=cancel", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("cancel-btn")).toHaveAttribute("data-forge-part", "cancel");
    });

    it("action button has data-forge-part=action", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("action-btn")).toHaveAttribute("data-forge-part", "action");
    });

    it("content has data-forge-scope=alert-dialog", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "alert-dialog");
    });
  });

  describe("WAI-ARIA alertdialog blocking", () => {
    it("stays open on Escape — never closes", async () => {
      render(<AlertDialogFixture />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("fires onEscapeKeyDown with defaultPrevented=false at callback time", async () => {
      let capturedDefaultPrevented: boolean | null = null;
      const onEscapeKeyDown = vi.fn((e: KeyboardEvent) => {
        capturedDefaultPrevented = e.defaultPrevented;
      });
      render(<AlertDialogFixture onEscapeKeyDown={onEscapeKeyDown} />);
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(onEscapeKeyDown).toHaveBeenCalledTimes(1);
      // Callback fires BEFORE e.preventDefault() — sees a fresh event
      expect(capturedDefaultPrevented).toBe(false);
      // Dialog still open regardless
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("fires onOpenChange on open", async () => {
      const onOpenChange = vi.fn();
      render(<AlertDialogFixture onOpenChange={onOpenChange} />);
      await user.click(screen.getByTestId("trigger"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("fires onOpenChange on cancel close", async () => {
      const onOpenChange = vi.fn();
      render(<AlertDialogFixture onOpenChange={onOpenChange} />);
      await user.click(screen.getByTestId("trigger"));
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("cancel-btn"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("AlertDialog compound components", () => {
    it("opens and closes via compound Cancel", async () => {
      render(
        <AlertDialog.Root id="cmp-test">
          <AlertDialog.Trigger data-testid="trig">Delete</AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Title>Are you sure?</AlertDialog.Title>
            <AlertDialog.Description>This cannot be undone.</AlertDialog.Description>
            <AlertDialog.Cancel data-testid="cancel">Cancel</AlertDialog.Cancel>
            <AlertDialog.Action data-testid="action">Delete</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      expect(screen.getByRole("alertdialog", { name: "Are you sure?" })).toBeInTheDocument();
      await user.click(screen.getByTestId("cancel"));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("Action does NOT close the dialog", async () => {
      render(
        <AlertDialog.Root id="cmp-action">
          <AlertDialog.Trigger data-testid="trig">Delete</AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Title>Confirm</AlertDialog.Title>
            <AlertDialog.Description>Permanent.</AlertDialog.Description>
            <AlertDialog.Cancel data-testid="cancel">Cancel</AlertDialog.Cancel>
            <AlertDialog.Action data-testid="action">Delete</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      await user.click(screen.getByTestId("action"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("Escape does not close the alertdialog", async () => {
      render(
        <AlertDialog.Root id="cmp-escape">
          <AlertDialog.Trigger data-testid="trig">Delete</AlertDialog.Trigger>
          <AlertDialog.Content>
            <AlertDialog.Title>Confirm</AlertDialog.Title>
            <AlertDialog.Description>Permanent.</AlertDialog.Description>
            <AlertDialog.Cancel data-testid="cancel">Cancel</AlertDialog.Cancel>
            <AlertDialog.Action data-testid="action">Delete</AlertDialog.Action>
          </AlertDialog.Content>
        </AlertDialog.Root>,
      );
      await user.click(screen.getByTestId("trig"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
