import { Switch } from "@forge-ui/react";

export function SwitchDemoReact() {
  return (
    <div className="forge-demo" style={{ flexDirection: "column", gap: "0.75rem" }}>
      <Switch.Root>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Enable notifications</Switch.Label>
      </Switch.Root>

      <Switch.Root defaultChecked>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Dark mode (on by default)</Switch.Label>
      </Switch.Root>

      <Switch.Root disabled>
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Switch.Label>Disabled switch</Switch.Label>
      </Switch.Root>
    </div>
  );
}
