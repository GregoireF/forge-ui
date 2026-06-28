import userEvent from "@testing-library/user-event";
import { cleanup, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { TimePicker } from "../src/components/time-picker/TimePicker.js";

const {
  Root: TimePickerRoot,
  Group: TimePickerGroup,
  HoursSegment: TimePickerHours,
  MinutesSegment: TimePickerMinutes,
  SecondsSegment: TimePickerSeconds,
  PeriodSegment: TimePickerPeriod,
  Separator: TimePickerSeparator,
  HiddenInput: TimePickerHiddenInput,
} = TimePicker;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

interface FixtureProps {
  hourCycle?: 12 | 24;
  disabled?: boolean;
  onValueChange?: (v: { hours: number; minutes: number; seconds: number } | null) => void;
}

function makeFixture({ hourCycle = 12, disabled, onValueChange }: FixtureProps = {}) {
  return defineComponent({
    components: {
      TimePickerRoot,
      TimePickerGroup,
      TimePickerHours,
      TimePickerMinutes,
      TimePickerSeconds,
      TimePickerPeriod,
      TimePickerSeparator,
      TimePickerHiddenInput,
    },
    setup: () => ({ hourCycle, disabled, onValueChange }),
    template: `
      <TimePickerRoot :hourCycle="hourCycle" :showSeconds="true" :disabled="disabled" :onValueChange="onValueChange">
        <TimePickerGroup data-testid="group">
          <TimePickerHours data-testid="hours" />
          <TimePickerSeparator data-testid="sep" />
          <TimePickerMinutes data-testid="minutes" />
          <TimePickerSeparator />
          <TimePickerSeconds data-testid="seconds" />
          <TimePickerPeriod v-if="hourCycle === 12" data-testid="period" />
        </TimePickerGroup>
        <TimePickerHiddenInput name="time" />
      </TimePickerRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// TimePicker — Vue
// ---------------------------------------------------------------------------

describe("TimePicker (Vue)", () => {
  describe("rendering", () => {
    it("renders three spinbuttons (hours, minutes, seconds)", () => {
      render(makeFixture());
      expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
    });

    it("period segment is rendered in 12-hour mode", () => {
      render(makeFixture({ hourCycle: 12 }));
      expect(screen.getByTestId("period")).toBeInTheDocument();
    });

    it("period segment is not rendered in 24-hour mode", () => {
      render(makeFixture({ hourCycle: 24 }));
      expect(screen.queryByTestId("period")).not.toBeInTheDocument();
    });

    it("group has data-forge-scope=time-picker", () => {
      render(makeFixture());
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-scope", "time-picker");
    });

    it("separator is aria-hidden", () => {
      render(makeFixture());
      expect(screen.getByTestId("sep")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("ARIA", () => {
    it("hours has aria-label=Hours", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    });

    it("minutes has aria-label=Minutes", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
    });

    it("seconds has aria-label=Seconds", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Seconds")).toBeInTheDocument();
    });

    it("hours has aria-valuemax=12 in 12-hour mode", () => {
      render(makeFixture({ hourCycle: 12 }));
      expect(screen.getByLabelText("Hours")).toHaveAttribute("aria-valuemax", "12");
    });

    it("hours has aria-valuemax=23 in 24-hour mode", () => {
      render(makeFixture({ hourCycle: 24 }));
      expect(screen.getByLabelText("Hours")).toHaveAttribute("aria-valuemax", "23");
    });

    it("minutes has aria-valuemin=0 aria-valuemax=59", () => {
      render(makeFixture());
      const minutes = screen.getByLabelText("Minutes");
      expect(minutes).toHaveAttribute("aria-valuemin", "0");
      expect(minutes).toHaveAttribute("aria-valuemax", "59");
    });

    it("segments start without aria-valuenow", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Hours")).not.toHaveAttribute("aria-valuenow");
    });
  });

  describe("keyboard — hours", () => {
    it("ArrowUp sets hours to 12 when blank (12-hour wraps)", async () => {
      const user = userEvent.setup();
      render(makeFixture({ hourCycle: 12 }));
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("{ArrowUp}");
      expect(hours).toHaveAttribute("aria-valuenow", "12");
    });

    it("digit 3 types into hours", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("3");
      expect(hours).toHaveAttribute("aria-valuenow", "3");
    });

    it("Backspace clears hours", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("{ArrowUp}");
      await user.keyboard("{Backspace}");
      expect(hours).not.toHaveAttribute("aria-valuenow");
    });
  });

  describe("keyboard — navigation", () => {
    it("ArrowRight on hours moves focus to minutes", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      screen.getByLabelText("Hours").focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByLabelText("Minutes")).toHaveFocus();
    });

    it("ArrowLeft on minutes moves focus to hours", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      screen.getByLabelText("Minutes").focus();
      await user.keyboard("{ArrowLeft}");
      expect(screen.getByLabelText("Hours")).toHaveFocus();
    });

    it("ArrowRight on minutes moves focus to seconds", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      screen.getByLabelText("Minutes").focus();
      await user.keyboard("{ArrowRight}");
      expect(screen.getByLabelText("Seconds")).toHaveFocus();
    });
  });

  describe("CSS contract", () => {
    it("hours has data-forge-part=segment-hours", () => {
      render(makeFixture());
      expect(screen.getByTestId("hours")).toHaveAttribute("data-forge-part", "segment-hours");
    });

    it("minutes has data-forge-part=segment-minutes", () => {
      render(makeFixture());
      expect(screen.getByTestId("minutes")).toHaveAttribute("data-forge-part", "segment-minutes");
    });

    it("seconds has data-forge-part=segment-seconds", () => {
      render(makeFixture());
      expect(screen.getByTestId("seconds")).toHaveAttribute("data-forge-part", "segment-seconds");
    });
  });

  describe("disabled", () => {
    it("disabled segments have tabIndex=-1", () => {
      render(makeFixture({ disabled: true }));
      const spinbuttons = screen.getAllByRole("spinbutton");
      for (const s of spinbuttons) {
        expect(s).toHaveAttribute("tabindex", "-1");
      }
    });
  });
});
