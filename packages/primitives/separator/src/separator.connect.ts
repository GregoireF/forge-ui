export interface SeparatorOptions {
  orientation?: "horizontal" | "vertical";
  /**
   * When true the separator is purely visual — role="none" and aria-hidden.
   * When false (default) it semantically divides content: role="separator".
   * @default false
   */
  decorative?: boolean;
}

export function connectSeparator(options: SeparatorOptions = {}) {
  const orientation = options.orientation ?? "horizontal";
  const decorative = options.decorative ?? false;

  return {
    getSeparatorProps() {
      return {
        role: decorative ? ("none" as const) : ("separator" as const),
        "aria-orientation": decorative ? undefined : orientation,
        "aria-hidden": decorative ? (true as const) : undefined,
        "data-forge-scope": "separator",
        "data-forge-part": "root",
        "data-orientation": orientation,
      };
    },
  };
}

export type SeparatorApi = ReturnType<typeof connectSeparator>;
