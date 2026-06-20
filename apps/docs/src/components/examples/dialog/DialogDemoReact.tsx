import { Dialog } from "@forge-ui/react";

export function DialogDemoReact() {
  return (
    <div className="forge-demo">
      <Dialog.Root>
        <Dialog.Trigger>Open Dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content>
            <Dialog.Title>Edit profile</Dialog.Title>
            <Dialog.Description>
              Update your display name and manage your account settings.
            </Dialog.Description>
            <div className="forge-dialog-footer">
              <Dialog.Close>Cancel</Dialog.Close>
              <Dialog.Close>Save changes</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
