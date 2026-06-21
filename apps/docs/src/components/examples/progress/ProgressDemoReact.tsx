import { Progress } from "@forge-ui/react";
import { useState } from "react";

export function ProgressDemoReact() {
  const [value, setValue] = useState(40);

  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <Progress.Root value={value}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <Progress.Label>Loading…</Progress.Label>
            <Progress.ValueText />
          </div>
          <Progress.Track>
            <Progress.Fill />
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
