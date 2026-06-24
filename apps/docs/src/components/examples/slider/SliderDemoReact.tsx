import { Slider } from "@forge-ui/react";
import { useState } from "react";

export function SliderDemoReact() {
  const [value, setValue] = useState(40);

  return (
    <div className="forge-demo" style={{ display: "block", padding: "1.5rem" }}>
      <div style={{ width: "100%", maxWidth: "400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.875rem", color: "var(--sl-color-white)" }}>Volume</span>
          <span style={{ fontSize: "0.875rem", color: "var(--sl-color-accent)", fontWeight: 600 }}>
            {value}%
          </span>
        </div>
        <Slider.Root
          value={value}
          onValueChange={(vals) => setValue(vals[0])}
          style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}
        >
          <Slider.Track
            style={{ flex: 1, height: "6px", background: "var(--sl-color-gray-6)", borderRadius: "999px", position: "relative", overflow: "visible" }}
          >
            <Slider.Range
              style={{ position: "absolute", height: "100%", background: "var(--sl-color-accent)", borderRadius: "999px" }}
            />
          </Slider.Track>
          <Slider.Thumb
            style={{ position: "absolute", width: "18px", height: "18px", background: "white", borderRadius: "50%", boxShadow: "0 1px 4px rgba(0,0,0,0.4)", cursor: "pointer", outline: "none", top: "50%", transform: "translateX(-50%) translateY(-50%)" }}
            aria-label="Volume"
          />
        </Slider.Root>

        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
          <button onClick={() => setValue(0)}>Min</button>
          <button onClick={() => setValue(50)}>50%</button>
          <button onClick={() => setValue(100)}>Max</button>
        </div>
      </div>
    </div>
  );
}
