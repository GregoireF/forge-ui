import { Popover } from "@forge-ui/react";

export function PopoverDemoReact() {
  return (
    <div className="forge-demo">
      <Popover.Root>
        <Popover.Trigger>Open Popover</Popover.Trigger>
        <Popover.Portal>
          <Popover.Content sideOffset={8}>
            <Popover.Title
              style={{ fontWeight: 600, marginBottom: "0.25rem", color: "var(--sl-color-white)" }}
            >
              Settings
            </Popover.Title>
            <Popover.Description>
              Configure your preferences. Changes apply immediately.
            </Popover.Description>
            <Popover.Close style={{ marginTop: "0.75rem", display: "block" }}>Close</Popover.Close>
            <Popover.Arrow />
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
