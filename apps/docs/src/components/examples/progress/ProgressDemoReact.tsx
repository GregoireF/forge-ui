import { Progress } from "@forge-ui/react";
import { useState } from "react";

export function ProgressDemoReact() {
  const [value, setValue] = useState(40);

  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Progress.Root value={value} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Progress.Label style={{ fontSize: "0.875rem", color: "var(--sl-color-white)" }}>
              Loading…
            </Progress.Label>
            <Progress.ValueText style={{ fontSize: "0.875rem", color: "var(--sl-color-gray-3)" }} />
          </div>
          <Progress.Track style={{ height: "8px", background: "var(--sl-color-gray-6)", borderRadius: "999px", overflow: "hidden" }}>
            <Progress.Fill style={{ height: "100%", background: "var(--sl-color-accent)", borderRadius: "999px", transition: "width 0.3s ease" }} />
          </Progress.Track>
        </Progress.Root>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <button onClick={() => setValue(Math.max(0, value - 10))}>−10</button>
          <button onClick={() => setValue(Math.min(100, value + 10))}>+10</button>
        </div>
      </div>
    </div>
  );
}
