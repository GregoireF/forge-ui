import { Checkbox } from "@forge-ui/react";

export function CheckboxDemoReact() {
  return (
    <div className="forge-demo" style={{ flexDirection: "column", gap: "0.75rem" }}>
      <Checkbox.Root name="terms">
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Accept terms and conditions</Checkbox.Label>
      </Checkbox.Root>

      <Checkbox.Root defaultChecked name="newsletter">
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Subscribe to newsletter</Checkbox.Label>
      </Checkbox.Root>

      <Checkbox.Root disabled>
        <Checkbox.Control>
          <Checkbox.Indicator>✓</Checkbox.Indicator>
        </Checkbox.Control>
        <Checkbox.Label>Disabled option</Checkbox.Label>
      </Checkbox.Root>
    </div>
  );
}
