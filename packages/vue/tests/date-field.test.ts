import { cleanup, render, screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { DateField } from "../src/components/date-field/DateField.js";

const {
  Root: DateFieldRoot,
  Group: DateFieldGroup,
  MonthSegment: DateFieldMonth,
  DaySegment: DateFieldDay,
  YearSegment: DateFieldYear,
  Separator: DateFieldSeparator,
  HiddenInput: DateFieldHiddenInput,
} = DateField;

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixture factory
// ---------------------------------------------------------------------------

interface FixtureProps {
  disabled?: boolean;
  readOnly?: boolean;
  onValueChange?: (v: { year: number; month: number; day: number } | null) => void;
}

function makeFixture({ disabled, readOnly, onValueChange }: FixtureProps = {}) {
  return defineComponent({
    components: { DateFieldRoot, DateFieldGroup, DateFieldMonth, DateFieldDay, DateFieldYear, DateFieldSeparator, DateFieldHiddenInput },
    setup: () => ({ disabled, readOnly, onValueChange }),
    template: `
      <DateFieldRoot :disabled="disabled" :readOnly="readOnly" :onValueChange="onValueChange">
        <DateFieldGroup data-testid="group">
          <DateFieldMonth data-testid="month" />
          <DateFieldSeparator data-testid="sep" />
          <DateFieldDay data-testid="day" />
          <DateFieldSeparator />
          <DateFieldYear data-testid="year" />
        </DateFieldGroup>
        <DateFieldHiddenInput name="date" />
      </DateFieldRoot>
    `,
  });
}

// ---------------------------------------------------------------------------
// DateField — Vue
// ---------------------------------------------------------------------------

describe("DateField (Vue)", () => {
  describe("rendering", () => {
    it("renders three spinbuttons", () => {
      render(makeFixture());
      expect(screen.getAllByRole("spinbutton")).toHaveLength(3);
    });

    it("group has role=group and aria-label=Date", () => {
      render(makeFixture());
      expect(screen.getByRole("group")).toHaveAttribute("aria-label", "Date");
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
      expect(screen.getByTestId("sep")).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("ARIA", () => {
    it("month has aria-valuemin=1 and aria-valuemax=12", () => {
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      expect(month).toHaveAttribute("aria-valuemin", "1");
      expect(month).toHaveAttribute("aria-valuemax", "12");
    });

    it("segments start without aria-valuenow (blank)", () => {
      render(makeFixture());
      expect(screen.getByLabelText("Month")).not.toHaveAttribute("aria-valuenow");
    });

    it("disabled group has aria-disabled", () => {
      render(makeFixture({ disabled: true }));
      expect(screen.getByRole("group")).toHaveAttribute("aria-disabled", "true");
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

    it("ArrowDown wraps month to 12 from blank", async () => {
      const user = userEvent.setup();
      render(makeFixture());
      const month = screen.getByLabelText("Month");
      month.focus();
      await user.keyboard("{ArrowDown}");
      expect(month).toHaveAttribute("aria-valuenow", "12");
    });

    it("digit 6 types into month segment", async () => {
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

  describe("CSS contract", () => {
    it("group has data-forge-scope=date-field and data-forge-part=group", () => {
      render(makeFixture());
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-scope", "date-field");
      expect(screen.getByTestId("group")).toHaveAttribute("data-forge-part", "group");
    });

    it("month has data-forge-part=segment-month", () => {
      render(makeFixture());
      expect(screen.getByTestId("month")).toHaveAttribute("data-forge-part", "segment-month");
    });

    it("day has data-forge-part=segment-day", () => {
      render(makeFixture());
      expect(screen.getByTestId("day")).toHaveAttribute("data-forge-part", "segment-day");
    });

    it("year has data-forge-part=segment-year", () => {
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
