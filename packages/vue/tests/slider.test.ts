import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { Slider } from "../src/components/slider/Slider.js";

const { Root: SliderRoot, Track: SliderTrack, Range: SliderRange, Thumb: SliderThumb } = Slider;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

interface FixtureProps {
  defaultValue?: number;
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (v: number) => void;
}

function makeFixture({
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  onValueChange,
}: FixtureProps = {}) {
  return defineComponent({
    components: { SliderRoot, SliderTrack, SliderRange, SliderThumb },
    setup: () => ({ defaultValue, value, min, max, step, disabled, onValueChange }),
    template: `
      <SliderRoot
        :defaultValue="defaultValue"
        :value="value"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :onValueChange="onValueChange"
        data-testid="root"
      >
        <SliderTrack data-testid="track">
          <SliderRange data-testid="range" />
        </SliderTrack>
        <SliderThumb data-testid="thumb" />
      </SliderRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// Slider — Vue
// ---------------------------------------------------------------------------

describe("Slider (Vue)", () => {
  describe("rendering", () => {
    it("renders the thumb with role=slider", () => {
      render(makeFixture());
      expect(screen.getByRole("slider")).toBeInTheDocument();
    });

    it("renders with defaultValue", () => {
      render(makeFixture({ defaultValue: 40 }));
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "40");
    });

    it("defaults to min when no defaultValue", () => {
      render(makeFixture({ min: 10 }));
      expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "10");
    });
  });

  describe("ARIA", () => {
    it("thumb has aria-valuemin, aria-valuemax, aria-valuenow", () => {
      render(makeFixture({ defaultValue: 50, min: 0, max: 100 }));
      const thumb = screen.getByRole("slider");
      expect(thumb).toHaveAttribute("aria-valuemin", "0");
      expect(thumb).toHaveAttribute("aria-valuemax", "100");
      expect(thumb).toHaveAttribute("aria-valuenow", "50");
    });

    it("thumb has aria-orientation=horizontal by default", () => {
      render(makeFixture());
      expect(screen.getByRole("slider")).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("disabled thumb has aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByRole("slider")).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("keyboard interaction", () => {
    it("ArrowRight increments by step", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 50 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(thumb).toHaveAttribute("aria-valuenow", "51");
    });

    it("ArrowLeft decrements by step", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 50 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowLeft}");
      expect(thumb).toHaveAttribute("aria-valuenow", "49");
    });

    it("Home sets value to min", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 50 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{Home}");
      expect(thumb).toHaveAttribute("aria-valuenow", "0");
    });

    it("End sets value to max", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 50 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{End}");
      expect(thumb).toHaveAttribute("aria-valuenow", "100");
    });

    it("clamps at min on ArrowLeft past min", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 0 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowLeft}");
      expect(thumb).toHaveAttribute("aria-valuenow", "0");
    });

    it("clamps at max on ArrowRight past max", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 100 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(thumb).toHaveAttribute("aria-valuenow", "100");
    });

    it("disabled thumb does not respond to keyboard", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 50, disabled: true }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(thumb).toHaveAttribute("aria-valuenow", "50");
    });
  });

  describe("callbacks", () => {
    it("onValueChange fires on keyboard increment", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(makeFixture({ defaultValue: 50, onValueChange: onChange }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("onValueChange does not fire when disabled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(makeFixture({ defaultValue: 50, disabled: true, onValueChange: onChange }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("step", () => {
    it("respects custom step", async () => {
      const user = userEvent.setup();
      render(makeFixture({ defaultValue: 0, step: 10 }));
      const thumb = screen.getByRole("slider");
      thumb.focus();
      await user.keyboard("{ArrowRight}");
      expect(thumb).toHaveAttribute("aria-valuenow", "10");
    });
  });

  describe("CSS contract", () => {
    it("root has data-forge-scope=slider and data-forge-part=root", () => {
      render(makeFixture());
      expect(screen.getByTestId("root")).toHaveAttribute("data-forge-scope", "slider");
      expect(screen.getByTestId("root")).toHaveAttribute("data-forge-part", "root");
    });

    it("track has data-forge-scope=slider and data-forge-part=track", () => {
      render(makeFixture());
      expect(screen.getByTestId("track")).toHaveAttribute("data-forge-scope", "slider");
      expect(screen.getByTestId("track")).toHaveAttribute("data-forge-part", "track");
    });

    it("range has data-forge-scope=slider and data-forge-part=range", () => {
      render(makeFixture());
      expect(screen.getByTestId("range")).toHaveAttribute("data-forge-scope", "slider");
      expect(screen.getByTestId("range")).toHaveAttribute("data-forge-part", "range");
    });

    it("thumb has data-forge-scope=slider and data-forge-part=thumb", () => {
      render(makeFixture());
      expect(screen.getByTestId("thumb")).toHaveAttribute("data-forge-scope", "slider");
      expect(screen.getByTestId("thumb")).toHaveAttribute("data-forge-part", "thumb");
    });

    it("root has data-orientation=horizontal by default", () => {
      render(makeFixture());
      expect(screen.getByTestId("root")).toHaveAttribute("data-orientation", "horizontal");
    });

    it("root has data-disabled when disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByTestId("root")).toHaveAttribute("data-disabled", "");
    });
  });
});
