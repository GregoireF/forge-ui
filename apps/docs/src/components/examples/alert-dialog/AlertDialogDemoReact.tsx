import { AlertDialog } from "@forge-ui/react";

export function AlertDialogDemoReact() {
  return (
    <div className="forge-demo">
      <AlertDialog.Root>
        <AlertDialog.Trigger>Delete account</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay>
            <AlertDialog.Content>
              <AlertDialog.Title>Delete account permanently?</AlertDialog.Title>
              <AlertDialog.Description>
                This action cannot be undone. All your data, settings, and history will be
                permanently removed.
              </AlertDialog.Description>
              <div className="forge-dialog-footer">
                <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
                <AlertDialog.Action>Yes, delete</AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Overlay>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
