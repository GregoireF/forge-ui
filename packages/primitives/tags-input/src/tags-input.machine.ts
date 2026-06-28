import { createMachine } from "@forge-ui/core";
import type {
  TagsInputContext,
  TagsInputEvent,
  TagsInputState,
  TagsInputTranslations,
} from "./tags-input.types.js";
import { defaultTagsInputTranslations } from "./tags-input.types.js";

export interface CreateTagsInputMachineOptions {
  id?: string;
  defaultValue?: string[];
  value?: string[];
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  invalid?: boolean;
  maxTags?: number;
  allowDuplicates?: boolean;
  delimiter?: string;
  translations?: Partial<TagsInputTranslations>;
  onValueChange?: (value: string[]) => void;
  onInputChange?: (value: string) => void;
}

export function createTagsInputMachine(opts: CreateTagsInputMachineOptions = {}) {
  const id = opts.id ?? "tags-input";
  const initial = opts.value ?? opts.defaultValue ?? [];

  return createMachine<TagsInputContext, TagsInputState, TagsInputEvent>({
    id,
    initial: "idle",
    context: {
      id,
      inputId: `${id}-input`,
      labelId: `${id}-label`,
      value: initial,
      inputValue: "",
      disabled: opts.disabled ?? false,
      readOnly: opts.readOnly ?? false,
      required: opts.required ?? false,
      invalid: opts.invalid ?? false,
      allowDuplicates: opts.allowDuplicates ?? false,
      translations: { ...defaultTagsInputTranslations, ...opts.translations },
      ...(opts.maxTags !== undefined && { maxTags: opts.maxTags }),
      ...(opts.delimiter !== undefined && { delimiter: opts.delimiter }),
      ...(opts.onValueChange !== undefined && { onValueChange: opts.onValueChange }),
      ...(opts.onInputChange !== undefined && { onInputChange: opts.onInputChange }),
    },
    states: {
      idle: {
        on: {
          FOCUS: { target: "focused" },
          REMOVE_TAG: {
            actions: [
              ({ context, event }) => {
                if (context.readOnly || context.disabled) return;
                const next = context.value.filter((v) => v !== event.value);
                context.value = next;
                context.onValueChange?.(next);
              },
            ],
          },
          SET_VALUE: {
            actions: [
              ({ context, event }) => {
                context.value = event.value;
              },
            ],
          },
        },
      },
      focused: {
        on: {
          BLUR: { target: "idle" },
          INPUT_CHANGE: {
            actions: [
              ({ context, event }) => {
                context.inputValue = event.value;
                context.onInputChange?.(event.value);
              },
            ],
          },
          ADD_TAG: {
            actions: [
              ({ context }) => {
                const tag = context.inputValue.trim();
                if (!tag) return;
                if (context.maxTags !== undefined && context.value.length >= context.maxTags)
                  return;
                if (!context.allowDuplicates && context.value.includes(tag)) {
                  context.inputValue = "";
                  return;
                }
                const next = [...context.value, tag];
                context.value = next;
                context.inputValue = "";
                context.onValueChange?.(next);
              },
            ],
          },
          REMOVE_TAG: {
            actions: [
              ({ context, event }) => {
                if (context.readOnly || context.disabled) return;
                const next = context.value.filter((v) => v !== event.value);
                context.value = next;
                context.onValueChange?.(next);
              },
            ],
          },
          REMOVE_LAST_TAG: {
            actions: [
              ({ context }) => {
                if (context.readOnly || context.disabled || context.inputValue !== "") return;
                if (context.value.length === 0) return;
                const next = context.value.slice(0, -1);
                context.value = next;
                context.onValueChange?.(next);
              },
            ],
          },
          SET_VALUE: {
            actions: [
              ({ context, event }) => {
                context.value = event.value;
              },
            ],
          },
        },
      },
    },
  });
}
