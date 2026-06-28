import { HoverCard } from "@forge-ui/react";

export function HoverCardDemoReact() {
  return (
    <div className="forge-demo">
      <HoverCard.Root openDelay={200} closeDelay={150}>
        <HoverCard.Trigger>
          <span
            style={{
              textDecoration: "underline",
              cursor: "pointer",
              color: "var(--sl-color-accent)",
            }}
          >
            @forge-ui
          </span>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content sideOffset={8}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <strong style={{ color: "var(--sl-color-white)", fontSize: "0.95rem" }}>
                forge-ui
              </strong>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--sl-color-gray-3)",
                  lineHeight: 1.5,
                }}
              >
                Headless UI primitives for React and Vue. Unstyled, accessible, and built on a
                stable CSS contract.
              </p>
              <span style={{ fontSize: "0.75rem", color: "var(--sl-color-gray-4)" }}>
                14 primitives · MIT license
              </span>
            </div>
            <HoverCard.Arrow />
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </div>
  );
}
