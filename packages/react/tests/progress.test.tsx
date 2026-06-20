import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "../src/components/progress/Progress.js";

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function makeFixture(value: number | null = null, max = 100, min = 0) {
  return (
    <Progress.Root value={value} max={max} min={min} data-testid="root">
      <Progress.Track value={value} max={max} min={min} data-testid="track">
        <Progress.Fill value={value} max={max} min={min} data-testid="fill" />
      </Progress.Track>
      <Progress.ValueText value={value} max={max} min={min} data-testid="value-text" />
    </Progress.Root>
  );
}

// ---------------------------------------------------------------------------
// Progress — React
// ---------------------------------------------------------------------------

describe("Progress (React)", () => {
  describe("rendering", () => {
    it("renders root with role=progressbar", () => {
      render(makeFixture(50));
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders indeterminate when value=null", () => {
      render(makeFixture(null));
      expect(screen.getByTestId("root")).toHaveAttribute("data-state", "indeterminate");
    });

    it("renders loading state when value>0 and value<max", () => {
      render(makeFixture(50));
      expect(screen.getByTestId("root")).toHaveAttribute("data-state", "loading");
    });

    it("renders complete state when value=max", () => {
      render(makeFixture(100));
      expect(screen.getByTestId("root")).toHaveAttribute("data-state", "complete");
    });
  });

  describe("ARIA", () => {
    it("aria-valuenow reflects value", () => {
      render(makeFixture(75));
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");
    });

    it("aria-valuemin and aria-valuemax", () => {
      render(makeFixture(50, 100, 0));
      const root = screen.getByRole("progressbar");
      expect(root).toHaveAttribute("aria-valuemin", "0");
      expect(root).toHaveAttribute("aria-valuemax", "100");
    });

    it("aria-valuenow absent when indeterminate", () => {
      render(makeFixture(null));
      expect(screen.getByRole("progressbar")).not.toHaveAttribute("aria-valuenow");
    });

    it("aria-valuetext is percentage string", () => {
      render(makeFixture(50));
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "50%");
    });

    it("aria-valuetext is 'loading' when indeterminate", () => {
      render(makeFixture(null));
      expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuetext", "loading");
    });
  });

  describe("value text", () => {
    it("ValueText renders percentage", () => {
      render(makeFixture(75));
      expect(screen.getByTestId("value-text")).toHaveTextContent("75%");
    });

    it("ValueText renders 'loading' when indeterminate", () => {
      render(makeFixture(null));
      expect(screen.getByTestId("value-text")).toHaveTextContent("loading");
    });
  });

  describe("custom range", () => {
    it("calculates percentage with custom min/max", () => {
      render(
        <Progress.Root value={150} min={100} max={200} data-testid="root">
          <Progress.ValueText value={150} min={100} max={200} data-testid="value-text" />
        </Progress.Root>,
      );
      expect(screen.getByTestId("value-text")).toHaveTextContent("50%");
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=progress and data-forge-part=root", () => {
      render(makeFixture(50));
      expect(screen.getByTestId("root")).toHaveAttribute("data-forge-scope", "progress");
      expect(screen.getByTestId("root")).toHaveAttribute("data-forge-part", "root");
    });

    it("track has data-forge-scope=progress and data-forge-part=track", () => {
      render(makeFixture(50));
      expect(screen.getByTestId("track")).toHaveAttribute("data-forge-scope", "progress");
      expect(screen.getByTestId("track")).toHaveAttribute("data-forge-part", "track");
    });

    it("fill has data-forge-scope=progress and data-forge-part=fill", () => {
      render(makeFixture(50));
      expect(screen.getByTestId("fill")).toHaveAttribute("data-forge-scope", "progress");
      expect(screen.getByTestId("fill")).toHaveAttribute("data-forge-part", "fill");
    });

    it("fill has correct width style at 50%", () => {
      render(makeFixture(50));
      expect(screen.getByTestId("fill")).toHaveStyle({ width: "50%" });
    });

    it("data-value reflects numeric value", () => {
      render(makeFixture(60));
      expect(screen.getByTestId("root")).toHaveAttribute("data-value", "60");
    });
  });
});
