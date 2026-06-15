import type { CreateFieldOptions, FieldApi, FieldContext } from "@forge-ui/field";
import { reactive } from "vue";

export type { CreateFieldOptions };

let counter = 0;
function generateId(): string {
  return `forge-field-${++counter}`;
}

/**
 * Vue composable wrapping @forge-ui/field.
 *
 * Unlike React (which re-creates the api on every render), Vue needs a reactive
 * context object so that register/unregister mutations (hasDescription, hasError)
 * automatically trigger re-renders in the Field.Control's aria-describedby.
 *
 * We replicate the context creation here using Vue's reactive() so mutations go
 * through the Vue reactivity proxy and all render functions that read the
 * context are notified correctly.
 */
export function useField(options: CreateFieldOptions = {}): FieldApi {
  const id = options.id ?? generateId();

  const ctx: FieldContext = reactive({
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
  });

  function buildAriaDescribedBy(): string | undefined {
    const parts: string[] = [];
    if (ctx.hasDescription) parts.push(ctx.descriptionId);
    if (ctx.hasError) parts.push(ctx.errorId);
    return parts.length > 0 ? parts.join(" ") : undefined;
  }

  return {
    context: ctx,

    getLabelProps() {
      return { id: ctx.labelId, htmlFor: ctx.controlId };
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
