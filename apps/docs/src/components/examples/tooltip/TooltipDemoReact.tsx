import { Tooltip } from "@forge-ui/react";

export function TooltipDemoReact() {
  return (
    <div className="forge-demo" style={{ gap: "1.5rem" }}>
      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger>Hover me</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={6}>
              This is a tooltip
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger>Settings</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content sideOffset={6}>
              Open application settings
              <Tooltip.Arrow />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}
