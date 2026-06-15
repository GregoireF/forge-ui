import type { CreateFieldOptions, FieldContext } from "./field.types.js";

let counter = 0;
function generateId(): string {
  return `forge-field-${++counter}`;
}

// ---------------------------------------------------------------------------
// createField — pure context factory (no FSM, no reactive state).
//
// Returns prop-getter functions and the resolved context. Frameworks wrap this
// in their own reactive layer (useField in React, useField composable in Vue).
// ---------------------------------------------------------------------------

export interface FieldApi {
  context: FieldContext;

  /** Props for the <label> element. */
  getLabelProps(): {
    id: string;
    htmlFor: string;
  };

  /**
   * Props for the form control (input / select / textarea / custom trigger).
   * Field.Control renders as a renderless Slot — these props are merged onto
   * the child element, so the control keeps its own semantics.
   */
  getControlProps(): {
    id: string;
    "aria-labelledby": string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
    "aria-required": true | undefined;
    "aria-disabled": true | undefined;
    "aria-readonly": true | undefined;
    required: boolean | undefined;
    disabled: boolean | undefined;
    readOnly: boolean | undefined;
  };

  /** Props for the helper description element. */
  getDescriptionProps(): {
    id: string;
  };

  /** Props for the validation error element. */
  getErrorProps(): {
    id: string;
    role: "alert";
    "aria-live": "polite";
  };

  /** Register/unregister slots — called by compound parts on mount/unmount. */
  registerDescription(): void;
  unregisterDescription(): void;
  registerError(): void;
  unregisterError(): void;
}

export function createField(options: CreateFieldOptions = {}): FieldApi {
  const id = options.id ?? generateId();

  const ctx: FieldContext = {
    controlId: id,
    labelId: `${id}-label`,
    descriptionId: `${id}-description`,
    errorId: `${id}-error`,
    invalid: options.invalid ?? false,
    required: options.required ?? false,
    disabled: options.disabled ?? false,
    readOnly: options.readOnly ?? false,
    hasDescription: false,
    hasError: false,
  };

  function buildAriaDescribedBy(): string | undefined {
    const parts: string[] = [];
    if (ctx.hasDescription) parts.push(ctx.descriptionId);
    if (ctx.hasError) parts.push(ctx.errorId);
    return parts.length > 0 ? parts.join(" ") : undefined;
  }

  return {
    context: ctx,

    getLabelProps() {
      return {
        id: ctx.labelId,
        htmlFor: ctx.controlId,
      };
    },

    getControlProps() {
      return {
        id: ctx.controlId,
        "aria-labelledby": ctx.labelId,
        "aria-describedby": buildAriaDescribedBy(),
        "aria-invalid": ctx.invalid ? true : undefined,
        "aria-required": ctx.required ? true : undefined,
        "aria-disabled": ctx.disabled ? true : undefined,
        "aria-readonly": ctx.readOnly ? true : undefined,
        required: ctx.required || undefined,
        disabled: ctx.disabled || undefined,
        readOnly: ctx.readOnly || undefined,
      };
    },

    getDescriptionProps() {
      return { id: ctx.descriptionId };
    },

    getErrorProps() {
      return {
        id: ctx.errorId,
        role: "alert" as const,
        "aria-live": "polite" as const,
      };
    },

    registerDescription() {
      ctx.hasDescription = true;
    },
    unregisterDescription() {
      ctx.hasDescription = false;
    },
    registerError() {
      ctx.hasError = true;
    },
    unregisterError() {
      ctx.hasError = false;
    },
  };
}
