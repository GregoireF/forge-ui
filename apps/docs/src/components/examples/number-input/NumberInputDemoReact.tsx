import { NumberInput } from "@forge-ui/react";
import { useState } from "react";

export function NumberInputDemoReact() {
  const [value, setValue] = useState<number | null>(50);

  return (
    <div className="forge-demo" style={{ flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <NumberInput.Root
          defaultValue={50}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => setValue(v)}
          style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
        >
          <NumberInput.Label
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--sl-color-white)" }}
          >
            Quantity
          </NumberInput.Label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <NumberInput.DecrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
            >
              −
            </NumberInput.DecrementTrigger>
            <NumberInput.Input
              aria-label="Quantity"
              style={{
                width: "70px",
                textAlign: "center",
                padding: "0.4rem",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                fontSize: "0.875rem",
              }}
            />
            <NumberInput.IncrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
            >
              +
            </NumberInput.IncrementTrigger>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--sl-color-gray-3)" }}>
            value: {value ?? "empty"} — min 0, max 100
          </span>
          <NumberInput.HiddenInput name="quantity" />
        </NumberInput.Root>
      </div>

      <div>
        <NumberInput.Root
          defaultValue={25}
          min={0}
          max={100}
          step={5}
          style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
        >
          <NumberInput.Label
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--sl-color-white)" }}
          >
            Step 5
          </NumberInput.Label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <NumberInput.DecrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
            >
              −
            </NumberInput.DecrementTrigger>
            <NumberInput.Input
              aria-label="Step 5"
              style={{
                width: "70px",
                textAlign: "center",
                padding: "0.4rem",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                fontSize: "0.875rem",
              }}
            />
            <NumberInput.IncrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "pointer",
                fontSize: "1.125rem",
              }}
            >
              +
            </NumberInput.IncrementTrigger>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--sl-color-gray-3)" }}>
            ArrowUp/Down ±5 · PageUp/Down ±50
          </span>
        </NumberInput.Root>
      </div>

      <div style={{ opacity: 0.5 }}>
        <NumberInput.Root
          defaultValue={25}
          min={0}
          max={100}
          disabled
          style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}
        >
          <NumberInput.Label
            style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--sl-color-white)" }}
          >
            Disabled
          </NumberInput.Label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <NumberInput.DecrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "not-allowed",
                fontSize: "1.125rem",
              }}
            >
              −
            </NumberInput.DecrementTrigger>
            <NumberInput.Input
              aria-label="Disabled quantity"
              style={{
                width: "70px",
                textAlign: "center",
                padding: "0.4rem",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                fontSize: "0.875rem",
              }}
            />
            <NumberInput.IncrementTrigger
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid var(--sl-color-gray-5)",
                borderRadius: "6px",
                background: "var(--sl-color-black)",
                color: "var(--sl-color-white)",
                cursor: "not-allowed",
                fontSize: "1.125rem",
              }}
            >
              +
            </NumberInput.IncrementTrigger>
          </div>
        </NumberInput.Root>
      </div>
    </div>
  );
}
