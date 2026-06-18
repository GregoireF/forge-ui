import type { FieldConnectReturn, FieldContext, FieldIds } from "./field.types.js";

let counter = 0;

export function createFieldIds(id?: string): FieldIds {
  const base = id ?? `forge-field-${++counter}`;
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

  return {
    context,

    getLabelProps() {
      return { id: context.labelId, htmlFor: context.controlId };
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
      };
    },

    getDescriptionProps() {
      return { id: context.descriptionId };
    },

    getErrorProps() {
      return {
        id: context.errorId,
        role: "alert" as const,
        "aria-live": "polite" as const,
      };
    },
  };
}
