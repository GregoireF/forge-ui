import type { FieldConnectReturn, FieldContext, FieldIds } from "./field.types.js";

let _counter = 0;

export function createFieldIds(id?: string): FieldIds {
  const base = id ?? `forge-field-${++_counter}`;
  return {
    controlId: base,
    labelId: `${base}-label`,
    descriptionId: `${base}-description`,
    errorId: `${base}-error`,
  };
}

// Pure connect — no internal state, no mutation.
// Frameworks pass a FieldContext snapshot (built from their reactive layer)
// on every render call. Vue passes a reactive proxy so reads inside the
// returned functions track reactive deps automatically.
export function connectField(context: FieldContext): FieldConnectReturn {
  function buildAriaDescribedBy(): string | undefined {
    const parts: string[] = [];
    if (context.hasDescription) parts.push(context.descriptionId);
    if (context.hasError) parts.push(context.errorId);
    return parts.length > 0 ? parts.join(" ") : undefined;
  }

  const scope = "field" as const;

  return {
    context,

    getLabelProps() {
      return {
        id: context.labelId,
        htmlFor: context.controlId,
        "data-forge-scope": scope,
        "data-forge-part": "label" as const,
      };
    },

    getControlProps() {
      return {
        id: context.controlId,
        "aria-labelledby": context.labelId,
        "aria-describedby": buildAriaDescribedBy(),
        "aria-invalid": context.invalid ? true : undefined,
        "aria-required": context.required ? true : undefined,
        "aria-disabled": context.disabled ? true : undefined,
        "aria-readonly": context.readOnly ? true : undefined,
        required: context.required ? true : undefined,
        disabled: context.disabled ? true : undefined,
        readOnly: context.readOnly ? true : undefined,
        "data-forge-scope": scope,
        "data-forge-part": "control" as const,
      };
    },

    getDescriptionProps() {
      return {
        id: context.descriptionId,
        "data-forge-scope": scope,
        "data-forge-part": "description" as const,
      };
    },

    getErrorProps() {
      return {
        id: context.errorId,
        role: "alert" as const,
        // "assertive" interrupts the screen reader immediately — correct for
        // inline form errors that appear after user interaction (blur/submit).
        "aria-live": "assertive" as const,
        "data-forge-scope": scope,
        "data-forge-part": "error" as const,
      };
    },

    getRequiredIndicatorProps() {
      // aria-hidden so screen readers don't announce the visual "*".
      // The required status is already communicated via aria-required on the control.
      return {
        "aria-hidden": true as const,
        "data-forge-scope": scope,
        "data-forge-part": "required-indicator" as const,
      };
    },

    // WAI-ARIA §3.7: use when Field wraps multiple controls (radio group, multi-field
    // date, etc.). Equivalent of <fieldset>/<legend> in div-based markup.
    getGroupProps() {
      return {
        role: "group" as const,
        "aria-labelledby": context.labelId,
        "aria-describedby": buildAriaDescribedBy(),
        "data-forge-scope": scope,
        "data-forge-part": "group" as const,
      };
    },
  };
}
