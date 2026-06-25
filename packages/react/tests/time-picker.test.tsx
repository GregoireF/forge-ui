import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TimePicker } from "../src/components/time-picker/TimePicker.js";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

interface FixtureProps {
  use12Hour?: boolean;
  disabled?: boolean;
  onValueChange?: (v: { hours: number; minutes: number; seconds: number } | null) => void;
}

function makeFixture({ use12Hour = true, disabled, onValueChange }: FixtureProps = {}) {
  return (
    <TimePicker.Root use12Hour={use12Hour} disabled={disabled} onValueChange={onValueChange}>
      <TimePicker.Group data-testid="group">
        <TimePicker.HoursSegment data-testid="hours" />
        <TimePicker.Separator data-testid="sep" />
        <TimePicker.MinutesSegment data-testid="minutes" />
        <TimePicker.Separator />
        <TimePicker.SecondsSegment data-testid="seconds" />
        {use12Hour && <TimePicker.PeriodSegment data-testid="period" />}
      </TimePicker.Group>
      <TimePicker.HiddenInput name="time" />
    </TimePicker.Root>
  );
}

// ---------------------------------------------------------------------------
// TimePicker — React
// ---------------------------------------------------------------------------

describe("TimePicker (React)", () => {
  describe("rendering", () => {
    it("renders hours, minutes, seconds spinbuttons in 12-hour mode", () => {
      render(makeFixture());
      expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
    });

    it("renders period segment in 12-hour mode", () => {
      render(makeFixture());
      expect(screen.getByTestId("period")).toBeInTheDocument();
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
    it("hours segment has aria-label=Hours", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Hours")).toBeInTheDocument();
    });

    it("minutes segment has aria-label=Minutes", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
    });

    it("seconds segment has aria-label=Seconds", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Seconds")).toBeInTheDocument();
    });

    it("hours has aria-valuemin=1 in 12-hour mode", () => {
      render(makeFixture({ use12Hour: true }));
      expect(screen.getByLabelText("Hours")).toHaveAttribute("aria-valuemin", "1");
    });

    it("hours has aria-valuemax=12 in 12-hour mode", () => {
      render(makeFixture({ use12Hour: true }));
      expect(screen.getByLabelText("Hours")).toHaveAttribute("aria-valuemax", "12");
    });

    it("minutes has aria-valuemin=0 and aria-valuemax=59", () => {
      render(makeFixture());
      const minutes = screen.getByLabelText("Minutes");
      expect(minutes).toHaveAttribute("aria-valuemin", "0");
      expect(minutes).toHaveAttribute("aria-valuemax", "59");
    });

    it("seconds has aria-valuemin=0 and aria-valuemax=59", () => {
      render(makeFixture());
      const seconds = screen.getByLabelText("Seconds");
      expect(seconds).toHaveAttribute("aria-valuemin", "0");
      expect(seconds).toHaveAttribute("aria-valuemax", "59");
    });

    it("segments start without aria-valuenow", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Hours")).not.toHaveAttribute("aria-valuenow");
    });
  });

  describe("keyboard — hours segment", () => {
    it("ArrowUp increments hours from blank to 12 (12-hour)", async () => {
      const user = userEvent.setup();
      render(makeFixture({ use12Hour: true }));
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("{ArrowUp}");
      expect(hours).toHaveAttribute("aria-valuenow", "12");
    });

    it("ArrowDown from blank wraps to 12 (12-hour)", async () => {
      const user = userEvent.setup();
      render(makeFixture({ use12Hour: true }));
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("{ArrowDown}");
      expect(hours).toHaveAttribute("aria-valuenow", "12");
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

    it("digit 8 types into hours", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("8");
      expect(hours).toHaveAttribute("aria-valuenow", "8");
    });
  });

  describe("keyboard — navigation", () => {
    it("ArrowRight on hours moves focus to minutes", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const hours = screen.getByLabelText("Hours");
      const minutes = screen.getByLabelText("Minutes");
      hours.focus();
      await user.keyboard("{ArrowRight}");
      expect(minutes).toHaveFocus();
    });

    it("ArrowLeft on minutes moves focus to hours", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const minutes = screen.getByLabelText("Minutes");
      const hours = screen.getByLabelText("Hours");
      minutes.focus();
      await user.keyboard("{ArrowLeft}");
      expect(hours).toHaveFocus();
    });
  });

  describe("CSS contract", () => {
    it("hours segment has data-forge-part=segment-hours", () => {
      render(makeFixture());
      expect(screen.getByTestId("hours")).toHaveAttribute("data-forge-part", "segment-hours");
    });

    it("minutes segment has data-forge-part=segment-minutes", () => {
      render(makeFixture());
      expect(screen.getByTestId("minutes")).toHaveAttribute("data-forge-part", "segment-minutes");
    });

    it("seconds segment has data-forge-part=segment-seconds", () => {
      render(makeFixture());
      expect(screen.getByTestId("seconds")).toHaveAttribute("data-forge-part", "segment-seconds");
    });

    it("group has data-forge-part=group", () => {
      render(makeFixture());
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-part", "group");
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

  describe("24-hour mode", () => {
    it("hours has aria-valuemax=23 in 24-hour mode", () => {
      render(makeFixture({ use12Hour: false }));
      expect(screen.getByLabelText("Hours")).toHaveAttribute("aria-valuemax", "23");
    });

    it("no period segment in 24-hour mode", () => {
      render(makeFixture({ use12Hour: false }));
      expect(screen.queryByTestId("period")).not.toBeInTheDocument();
    });
  });

  describe("callbacks", () => {
    it("onValueChange fires when all segments are filled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(makeFixture({ use12Hour: false, onValueChange: onChange }));

      const hours = screen.getByLabelText("Hours");
      hours.focus();
      await user.keyboard("9");

      const minutes = screen.getByLabelText("Minutes");
      minutes.focus();
      await user.keyboard("3");
      await user.keyboard("0");

      const seconds = screen.getByLabelText("Seconds");
      seconds.focus();
      await user.keyboard("0");
      await user.keyboard("0");

      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hours: 9, minutes: 30, seconds: 0 }));
    });
  });
});
