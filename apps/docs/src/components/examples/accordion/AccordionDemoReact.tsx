import { Accordion } from "@forge-ui/react";

export function AccordionDemoReact() {
  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <Accordion.Root
        type="single"
        collapsible
        style={{ width: "100%", maxWidth: "480px", margin: "0 auto" }}
      >
        <Accordion.Item value="what">
          <Accordion.Header>
            <Accordion.Trigger style={{ width: "100%", textAlign: "left", padding: "0.75rem 0", background: "none", border: "none", borderBottom: "1px solid var(--sl-color-hairline)", color: "var(--sl-color-white)", cursor: "pointer", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              What is forge-ui?
              <span style={{ opacity: 0.5 }}>▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content style={{ padding: "0.75rem 0", fontSize: "0.875rem", color: "var(--sl-color-gray-3)", borderBottom: "1px solid var(--sl-color-hairline)" }}>
            forge-ui is a headless component library built on a machine → connect → framework architecture, giving you complete styling freedom.
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="why">
          <Accordion.Header>
            <Accordion.Trigger style={{ width: "100%", textAlign: "left", padding: "0.75rem 0", background: "none", border: "none", borderBottom: "1px solid var(--sl-color-hairline)", color: "var(--sl-color-white)", cursor: "pointer", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              Why headless?
              <span style={{ opacity: 0.5 }}>▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content style={{ padding: "0.75rem 0", fontSize: "0.875rem", color: "var(--sl-color-gray-3)", borderBottom: "1px solid var(--sl-color-hairline)" }}>
            Headless components handle behavior and accessibility while you own the styles. No CSS overrides, no specificity wars.
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="how">
          <Accordion.Header>
            <Accordion.Trigger style={{ width: "100%", textAlign: "left", padding: "0.75rem 0", background: "none", border: "none", color: "var(--sl-color-white)", cursor: "pointer", fontSize: "0.9rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              How does the CSS contract work?
              <span style={{ opacity: 0.5 }}>▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content style={{ padding: "0.75rem 0", fontSize: "0.875rem", color: "var(--sl-color-gray-3)" }}>
            Every element gets <code>data-forge-scope</code> and <code>data-forge-part</code> attributes. Style them with stable selectors that never break.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
