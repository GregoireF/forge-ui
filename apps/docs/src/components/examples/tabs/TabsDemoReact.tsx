import { Tabs } from "@forge-ui/react";

export function TabsDemoReact() {
  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <Tabs.Root
        defaultValue="overview"
        style={{ width: "100%", maxWidth: "480px", margin: "0 auto" }}
      >
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="details">Details</Tabs.Trigger>
          <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="overview">
          The Overview tab contains a high-level summary of the component and its main use cases.
        </Tabs.Panel>
        <Tabs.Panel value="details">
          The Details tab shows technical specifications, props, and configuration options.
        </Tabs.Panel>
        <Tabs.Panel value="reviews">
          The Reviews tab displays user feedback and ratings for this component.
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}
