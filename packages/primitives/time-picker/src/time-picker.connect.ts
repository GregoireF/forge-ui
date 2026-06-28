/**
 * Time Picker connect layer.
 *
 * WAI-ARIA:
 * - role="group" on container + aria-label="Time"
 * - Each segment: role="spinbutton", aria-label=("Hours"|"Minutes"|"Seconds"|"AM/PM")
 * - aria-valuetext on hours segment reads "2 PM" not "14:00"
 * - AM/PM segment: role="listbox" is sometimes used, but spinbutton with
 *   aria-valuetext="AM" or "PM" + ArrowUp/Down to toggle is simpler and
 *   better supported across AT (used by React Aria, Zag.js).
 */

import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type {
  TimePickerContext,
  TimePickerEvent,
  TimePickerState,
  TimeSegmentType,
  TimeValue,
} from "./time-picker.types.js";

export type TimePickerSend = (event: TimePickerEvent | TimePickerEvent["type"]) => void;
export type TimePickerApi = ReturnType<typeof connectTimePicker>;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function connectTimePicker(
  snapshot: MachineSnapshot<TimePickerContext, TimePickerState>,
  send: TimePickerSend,
  _machine: Pick<
    MachineInstance<TimePickerContext, TimePickerState, TimePickerEvent>,
    "setContext"
  >,
) {
  const { context } = snapshot;
  const {
    id,
    hoursValue,
    minutesValue,
    secondsValue,
    period,
    focusedSegment,
    hourCycle,
    showSeconds,
    disabled,
    readOnly,
  } = context;

  const groupId = `${id}-group`;

  // Display hours (1-12 or 0-23)
  const displayHours =
    hoursValue === null
      ? null
      : hourCycle === 12
        ? hoursValue % 12 === 0
          ? 12
          : hoursValue % 12
        : hoursValue;

  const assembledTime: TimeValue | null =
    hoursValue !== null && minutesValue !== null && (!showSeconds || secondsValue !== null)
      ? { hours: hoursValue, minutes: minutesValue, seconds: secondsValue ?? 0 }
      : null;

  const isoValue = assembledTime
    ? `${pad2(assembledTime.hours)}:${pad2(assembledTime.minutes)}:${pad2(assembledTime.seconds)}`
    : "";

  function segmentProps(segment: TimeSegmentType) {
    const isFocused = focusedSegment === segment;
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          send("INCREMENT");
          break;
        case "ArrowDown":
          e.preventDefault();
          send("DECREMENT");
          break;
        case "ArrowRight":
          e.preventDefault();
          send("NEXT_SEGMENT");
          break;
        case "ArrowLeft":
          e.preventDefault();
          send("PREV_SEGMENT");
          break;
        case "a":
        case "A":
          if (segment === "period") {
            e.preventDefault();
            if (period !== "AM") send("TOGGLE_PERIOD");
          }
          break;
        case "p":
        case "P":
          if (segment === "period") {
            e.preventDefault();
            if (period !== "PM") send("TOGGLE_PERIOD");
          }
          break;
        case "Backspace":
        case "Delete":
          e.preventDefault();
          send("CLEAR_SEGMENT");
          break;
        default:
          if (/^\d$/.test(e.key) && segment !== "period") {
            e.preventDefault();
            send({ type: "TYPE_DIGIT", digit: e.key });
          }
      }
    };

    return {
      role: "spinbutton" as const,
      "aria-disabled": disabled || undefined,
      "aria-readonly": readOnly || undefined,
      "data-forge-scope": "time-picker",
      "data-forge-part": `segment-${segment}`,
      "data-focused": isFocused ? "" : undefined,
      tabIndex: disabled ? -1 : 0,
      onFocus() {
        send({ type: "FOCUS_SEGMENT", segment });
      },
      onBlur() {
        send("BLUR_SEGMENT");
      },
      onKeyDown,
    };
  }

  return {
    assembledTime,
    isoValue,
    period,
    focusedSegment,

    displayValues: {
      hours: displayHours !== null ? pad2(displayHours) : undefined,
      minutes: minutesValue !== null ? pad2(minutesValue) : undefined,
      seconds: secondsValue !== null ? pad2(secondsValue) : undefined,
      period: hourCycle === 12 ? period : undefined,
    },

    getGroupProps() {
      return {
        id: groupId,
        role: "group" as const,
        "aria-label": "Time",
        "aria-disabled": disabled || undefined,
        "data-forge-scope": "time-picker",
        "data-forge-part": "group",
      };
    },

    getHoursSegmentProps() {
      const maxVal = hourCycle === 12 ? 12 : 23;
      const minVal = hourCycle === 12 ? 1 : 0;
      const hoursText =
        displayHours !== null
          ? hourCycle === 12
            ? `${displayHours} ${period}`
            : String(displayHours)
          : "blank";

      return {
        ...segmentProps("hours"),
        "aria-label": "Hours",
        "aria-valuemin": minVal,
        "aria-valuemax": maxVal,
        "aria-valuenow": displayHours ?? undefined,
        "aria-valuetext": hoursText,
        "data-placeholder": hoursValue === null ? "" : undefined,
      };
    },

    getMinutesSegmentProps() {
      return {
        ...segmentProps("minutes"),
        "aria-label": "Minutes",
        "aria-valuemin": 0,
        "aria-valuemax": 59,
        "aria-valuenow": minutesValue ?? undefined,
        "aria-valuetext": minutesValue !== null ? pad2(minutesValue) : "blank",
        "data-placeholder": minutesValue === null ? "" : undefined,
      };
    },

    getSecondsSegmentProps() {
      return {
        ...segmentProps("seconds"),
        "aria-label": "Seconds",
        "aria-valuemin": 0,
        "aria-valuemax": 59,
        "aria-valuenow": secondsValue ?? undefined,
        "aria-valuetext": secondsValue !== null ? pad2(secondsValue) : "blank",
        "data-placeholder": secondsValue === null ? "" : undefined,
      };
    },

    getPeriodSegmentProps() {
      const isFocused = focusedSegment === "period";
      const onKeyDown = (e: KeyboardEvent) => {
        switch (e.key) {
          case "ArrowUp":
          case "ArrowDown":
            e.preventDefault();
            send("TOGGLE_PERIOD");
            break;
          case "ArrowRight":
            e.preventDefault();
            send("NEXT_SEGMENT");
            break;
          case "ArrowLeft":
            e.preventDefault();
            send("PREV_SEGMENT");
            break;
          case "a":
          case "A":
            e.preventDefault();
            if (period !== "AM") send("TOGGLE_PERIOD");
            break;
          case "p":
          case "P":
            e.preventDefault();
            if (period !== "PM") send("TOGGLE_PERIOD");
            break;
        }
      };
      return {
        "aria-label": "AM/PM",
        "aria-live": "polite" as const,
        "aria-valuetext": period,
        "data-forge-scope": "time-picker",
        "data-forge-part": "segment-period",
        "data-focused": isFocused ? "" : undefined,
        tabIndex: disabled ? -1 : 0,
        onFocus() {
          send({ type: "FOCUS_SEGMENT", segment: "period" });
        },
        onBlur() {
          send("BLUR_SEGMENT");
        },
        onKeyDown,
      };
    },

    getSeparatorProps() {
      return {
        "aria-hidden": true as const,
        "data-forge-scope": "time-picker",
        "data-forge-part": "separator",
      };
    },

    getHiddenInputProps(name: string) {
      return {
        type: "hidden" as const,
        name,
        value: isoValue,
        "aria-hidden": true as const,
      };
    },
  };
}
