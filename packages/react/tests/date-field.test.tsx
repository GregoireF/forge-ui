import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateField } from "../src/components/date-field/DateField.js";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

interface FixtureProps {
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?: (v: { year: number; month: number; day: number } | null) => void;
}

function makeFixture({ disabled, readOnly, onValueChange }: FixtureProps = {}) {
  return (
    <DateField.Root disabled={disabled} readOnly={readOnly} onValueChange={onValueChange}>
      <DateField.Group data-testid="group">
        <DateField.MonthSegment data-testid="month" />
        <DateField.Separator data-testid="sep" />
        <DateField.DaySegment data-testid="day" />
        <DateField.Separator />
        <DateField.YearSegment data-testid="year" />
      </DateField.Group>
      <DateField.HiddenInput name="date" />
    </DateField.Root>
  );
}

// ---------------------------------------------------------------------------
// DateField — React
// ---------------------------------------------------------------------------

describe("DateField (React)", () => {
  describe("rendering", () => {
    it("renders three spinbuttons", () => {
      render(makeFixture());
      expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
    });

    it("group has role=group and aria-label=Date", () => {
      render(makeFixture());
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-label", "Date");
    });

    it("month segment has aria-label=Month", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Month")).toBeInTheDocument();
    });

    it("day segment has aria-label=Day", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Day")).toBeInTheDocument();
    });

    it("year segment has aria-label=Year", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Year")).toBeInTheDocument();
    });

    it("separator is aria-hidden", () => {
      render(makeFixture());
      const sep = screen.getByTestId("sep");
      expect(sep).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("ARIA", () => {
    it("month has aria-valuemin=1 and aria-valuemax=12", () => {
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      expect(month).toHaveAttribute("aria-valuemin", "1");
      expect(month).toHaveAttribute("aria-valuemax", "12");
    });

    it("segments start without aria-valuenow (blank state)", () => {
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      expect(month).not.toHaveAttribute("aria-valuenow");
    });

    it("disabled group has aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      const group = screen.getByRole("group");
      expect(group).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("keyboard — month segment", () => {
    it("ArrowUp sets month to 1 when blank", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("{ArrowUp}");
      expect(month).toHaveAttribute("aria-valuenow", "1");
    });

    it("ArrowDown sets month to 12 when blank (wraps from bottom)", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("{ArrowDown}");
      expect(month).toHaveAttribute("aria-valuenow", "12");
    });

    it("ArrowUp increments month", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("{ArrowUp}{ArrowUp}");
      expect(month).toHaveAttribute("aria-valuenow", "2");
    });

    it("digit 6 types into month", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("6");
      expect(month).toHaveAttribute("aria-valuenow", "6");
    });

    it("Backspace clears month", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("{ArrowUp}");
      expect(month).toHaveAttribute("aria-valuenow", "1");
      await user.keyboard("{Backspace}");
      expect(month).not.toHaveAttribute("aria-valuenow");
    });
  });

  describe("keyboard — navigation", () => {
    it("ArrowRight on month moves focus to day", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      const day = screen.getByLabelText("Day");
      month.focus();
      await user.keyboard("{ArrowRight}");
      expect(day).toHaveFocus();
    });

    it("ArrowLeft on day moves focus to month", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const day = screen.getByLabelText("Day");
      const month = screen.getByLabelText("Month");
      day.focus();
      await user.keyboard("{ArrowLeft}");
      expect(month).toHaveFocus();
    });
  });

  describe("callbacks", () => {
    it("onValueChange fires when all segments filled", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(makeFixture({ onValueChange: onChange }));
      const month = screen.getByLabelText("Month");
      month.focus();
      // Type month=3
      await user.keyboard("3");
      // Type day=15 on day segment (auto-moved after valid month typed)
      const day = screen.getByLabelText("Day");
      day.focus();
      await user.keyboard("1");
      await user.keyboard("5");
      // Type year=2025
      const year = screen.getByLabelText("Year");
      year.focus();
      await user.keyboard("2");
      await user.keyboard("0");
      await user.keyboard("2");
      await user.keyboard("5");
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ year: 2025, month: 3, day: 15 }),
      );
    });
  });

  describe("CSS contract", () => {
    it("group has data-forge-scope=date-field", () => {
      render(makeFixture());
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-scope", "date-field");
    });

    it("group has data-forge-part=group", () => {
      render(makeFixture());
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-part", "group");
    });

    it("month segment has data-forge-part=segment-month", () => {
      render(makeFixture());
      expect(screen.getByTestId("month")).toHaveAttribute("data-forge-part", "segment-month");
    });

    it("day segment has data-forge-part=segment-day", () => {
      render(makeFixture());
      expect(screen.getByTestId("day")).toHaveAttribute("data-forge-part", "segment-day");
    });

    it("year segment has data-forge-part=segment-year", () => {
      render(makeFixture());
      expect(screen.getByTestId("year")).toHaveAttribute("data-forge-part", "segment-year");
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
