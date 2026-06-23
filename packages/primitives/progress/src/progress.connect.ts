export interface ProgressConnectOptions {
  /** Current value (0-max). null = indeterminate. */
  value: number | null;
  /** Maximum value. @default 100 */
  max?: number;
  /** Minimum value. @default 0 */
  min?: number;
}

function getState(value: number | null, min: number, max: number): "indeterminate" | "complete" | "loading" {
  if (value === null) return "indeterminate";
  if (value >= max) return "complete";
  if (value <= min) return "loading";
  return "loading";
}

export function connectProgress(options: ProgressConnectOptions) {
  const { value, max = 100, min = 0 } = options;
  const state = getState(value, min, max);
  const percent = value !== null ? Math.round(((value - min) / (max - min)) * 100) : undefined;

  return {
    value,
    max,
    min,
    state,
    percent,

    getRootProps() {
      return {
        role: "progressbar" as const,
        "aria-valuemin": min,
        "aria-valuemax": max,
        "aria-valuenow": value ?? undefined,
        "aria-valuetext": value !== null ? `${percent}%` : "loading",
        // WAI-ARIA §6.9: aria-busy signals active loading to AT when value is absent
        "aria-busy": value === null ? (true as const) : undefined,
        "data-state": state,
        "data-value": value ?? undefined,
        "data-max": max,
        "data-forge-scope": "progress",
        "data-forge-part": "root",
      };
    },

    getTrackProps() {
      return {
        "data-state": state,
        "data-value": value ?? undefined,
        "data-max": max,
        "data-forge-scope": "progress",
        "data-forge-part": "track",
      } as const;
    },

    getFillProps() {
      return {
        "data-state": state,
        "data-value": value ?? undefined,
        "data-max": max,
        "data-forge-scope": "progress",
        "data-forge-part": "fill",
        style: {
          width: value !== null ? `${percent}%` : undefined,
        },
      } as const;
    },

    getLabelProps() {
      return {
        "data-forge-scope": "progress",
        "data-forge-part": "label",
      } as const;
    },

    getValueTextProps() {
      return {
        "aria-hidden": true as const,
        "data-forge-scope": "progress",
        "data-forge-part": "value-text",
      } as const;
    },
  };
}

export type ProgressApi = ReturnType<typeof connectProgress>;
