import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/vue";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { AlertDialog } from "../src/components/alert-dialog/AlertDialog.js";
import { useAlertDialog } from "../src/components/alert-dialog/use-alert-dialog.js";

// ---------------------------------------------------------------------------
// Test component — uses useAlertDialog() headless hook
// ---------------------------------------------------------------------------
function makeAlertDialogFixture(
  props: {
    onOpenChange?: (open: boolean) => void;
    onEscapeKeyDown?: (e: KeyboardEvent) => void;
  } = {},
) {
  return defineComponent({
    setup() {
      return useAlertDialog({ id: "test-ad", ...props });
    },
    template: `
      <div>
        <button v-bind="getTriggerProps()" data-testid="trigger">Open</button>
        <template v-if="isOpen">
          <div v-bind="getContentProps()" data-testid="content">
            <h2 v-bind="getTitleProps()">Alert Title</h2>
            <p v-bind="getDescriptionProps()">This cannot be undone.</p>
            <button v-bind="getCancelProps()" data-testid="cancel-btn">Cancel</button>
            <button v-bind="getActionProps()" data-testid="action-btn">Confirm</button>
          </div>
        </template>
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useAlertDialog (Vue)", () => {
  const user = userEvent.setup();

  describe("rendering", () => {
    it("renders closed by default", () => {
      render(makeAlertDialogFixture());
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("opens on trigger click", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("closes on Cancel click", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("cancel-btn"));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("Action button does NOT auto-close the dialog", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.click(screen.getByTestId("action-btn"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });

  describe("ARIA", () => {
    it("has role=alertdialog", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("trigger has aria-haspopup=alertdialog", () => {
      render(makeAlertDialogFixture());
      expect(screen.getByTestId("trigger")).toHaveAttribute("aria-haspopup", "alertdialog");
    });

    it("content has data-forge-scope=alert-dialog", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      expect(screen.getByTestId("content")).toHaveAttribute("data-forge-scope", "alert-dialog");
    });
  });

  describe("WAI-ARIA alertdialog blocking", () => {
    it("stays open on Escape — never closes", async () => {
      render(makeAlertDialogFixture());
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("fires onEscapeKeyDown with defaultPrevented=false at callback time", async () => {
      let capturedDefaultPrevented: boolean | null = null;
      render(
        makeAlertDialogFixture({
          onEscapeKeyDown(e: KeyboardEvent) {
            capturedDefaultPrevented = e.defaultPrevented;
          },
        }),
      );
      await user.click(screen.getByTestId("trigger"));
      await user.keyboard("{Escape}");
      expect(capturedDefaultPrevented).toBe(false);
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    it("fires onOpenChange on open and cancel", async () => {
      const onOpenChange = vi.fn();
      render(makeAlertDialogFixture({ onOpenChange }));
      await user.click(screen.getByTestId("trigger"));
      expect(onOpenChange).toHaveBeenCalledWith(true);
      onOpenChange.mockClear();
      await user.click(screen.getByTestId("cancel-btn"));
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("AlertDialog compound components", () => {
    const {
      Root: AlertDialogRoot,
      Trigger: AlertDialogTrigger,
      Content: AlertDialogContent,
      Title: AlertDialogTitle,
      Description: AlertDialogDescription,
      Cancel: AlertDialogCancel,
      Action: AlertDialogAction,
    } = AlertDialog;

    it("opens and closes via compound Cancel", async () => {
      const Fixture = defineComponent({
        components: {
          AlertDialogRoot,
          AlertDialogTrigger,
          AlertDialogContent,
          AlertDialogTitle,
          AlertDialogDescription,
          AlertDialogCancel,
          AlertDialogAction,
        },
        template: `
          <AlertDialogRoot id="vue-cmp">
            <AlertDialogTrigger data-testid="trig">Delete</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
              <AlertDialogCancel data-testid="cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction data-testid="action">Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      expect(screen.getByRole("alertdialog", { name: "Are you sure?" })).toBeInTheDocument();
      await user.click(screen.getByTestId("cancel"));
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("Escape does not close the alertdialog", async () => {
      const Fixture = defineComponent({
        components: {
          AlertDialogRoot,
          AlertDialogTrigger,
          AlertDialogContent,
          AlertDialogTitle,
          AlertDialogDescription,
          AlertDialogCancel,
          AlertDialogAction,
        },
        template: `
          <AlertDialogRoot id="vue-cmp-escape">
            <AlertDialogTrigger data-testid="trig">Delete</AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogTitle>Confirm</AlertDialogTitle>
              <AlertDialogDescription>Permanent.</AlertDialogDescription>
              <AlertDialogCancel data-testid="cancel">Cancel</AlertDialogCancel>
              <AlertDialogAction data-testid="action">Delete</AlertDialogAction>
            </AlertDialogContent>
          </AlertDialogRoot>
        `,
      });
      render(Fixture);
      await user.click(screen.getByTestId("trig"));
      await user.keyboard("{Escape}");
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
