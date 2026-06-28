import { Collapsible } from "@forge-ui/react";

export function CollapsibleDemoReact() {
  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <Collapsible.Root style={{ width: "100%", maxWidth: "400px", margin: "0 auto" }}>
        <Collapsible.Trigger>Toggle details ▾</Collapsible.Trigger>
        <Collapsible.Content>
          <p
            style={{
              marginTop: "0.75rem",
              fontSize: "0.875rem",
              color: "var(--sl-color-gray-3)",
              lineHeight: 1.6,
            }}
          >
            This panel is toggled by the button above. It supports exit animations via{" "}
            <code>forceMount</code> and controlled/uncontrolled modes.
          </p>
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
