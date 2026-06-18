import type { CreateFieldOptions, FieldApi } from "@forge-ui/field";
import { connectField, createFieldIds } from "@forge-ui/field";
import { reactive, watchEffect } from "vue";

export type { CreateFieldOptions };

// Unlike React (which re-creates context on every render), Vue needs a reactive
// context object so that hasDescription/hasError mutations propagate through
// Vue's reactivity system and re-render any template that reads them.
//
// connectField(ctx) receives the reactive proxy. Its returned getter functions
// (getControlProps etc.) close over ctx — when called inside a Vue render
// function, Vue automatically tracks ctx.hasDescription / ctx.hasError as
// reactive deps and re-renders the consumer on change.
export function useField(options: CreateFieldOptions = {}): FieldApi {
  const ids = createFieldIds(options.id);

  const ctx = reactive({
    ...ids,
    invalid: options.invalid ?? false,
    required: options.required ?? false,
    disabled: options.disabled ?? false,
    readOnly: options.readOnly ?? false,
    hasDescription: false,
    hasError: false,
  });

  // When `options` is a Vue reactive props object (passed from FieldRoot),
  // watchEffect re-syncs ctx on every prop change. When it's a plain object,
  // this runs once on mount only.
  watchEffect(() => {
    ctx.invalid = options.invalid ?? false;
    ctx.required = options.required ?? false;
    ctx.disabled = options.disabled ?? false;
    ctx.readOnly = options.readOnly ?? false;
  });

  const connect = connectField(ctx);

  return {
    ...connect,
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
