import type { MachineInstance, MachineSnapshot } from "@forge-ui/core";
import type { TagsInputContext, TagsInputEvent, TagsInputSend, TagsInputState } from "./tags-input.types.js";

export type TagsInputApi = ReturnType<typeof connectTagsInput>;

export function connectTagsInput(
  snapshot: MachineSnapshot<TagsInputContext, TagsInputState>,
  send: TagsInputSend,
  _machine: Pick<MachineInstance<TagsInputContext, TagsInputState, TagsInputEvent>, "setContext">,
) {
  const { context } = snapshot;
  const isFocused = snapshot.matches("focused");
  const canAddMore = context.maxTags === undefined || context.value.length < context.maxTags;

  return {
    value: context.value,
    inputValue: context.inputValue,
    isFocused,
    isEmpty: context.value.length === 0,
    isDisabled: context.disabled,
    isReadOnly: context.readOnly,
    isRequired: context.required,
    isInvalid: context.invalid,
    canAddMore,
    delimiter: context.delimiter,

    getRootProps() {
      return {
        "data-forge-scope": "tags-input",
        "data-forge-part": "root",
        ...(isFocused && { "data-focused": "" }),
        ...(context.disabled && { "data-disabled": "" }),
        ...(context.readOnly && { "data-readonly": "" }),
        ...(context.invalid && { "data-invalid": "" }),
      };
    },

    getLabelProps() {
      return {
        id: context.labelId,
        htmlFor: context.inputId,
        "data-forge-scope": "tags-input",
        "data-forge-part": "label",
      };
    },

    getInputProps() {
      return {
        id: context.inputId,
        type: "text" as const,
        value: context.inputValue,
        ...(context.disabled && { disabled: true as const }),
        ...(context.readOnly && { readOnly: true as const }),
        "aria-labelledby": context.labelId,
        ...(context.required && { "aria-required": true as const }),
        ...(context.invalid && { "aria-invalid": true as const }),
        "data-forge-scope": "tags-input",
        "data-forge-part": "input",
        onFocus: () => send({ type: "FOCUS" }),
        onBlur: (e: FocusEvent) => {
          if ((e.target as HTMLInputElement).value.trim()) send({ type: "ADD_TAG" });
          send({ type: "BLUR" });
        },
        onInput: (e: Event) => send({ type: "INPUT_CHANGE", value: (e.target as HTMLInputElement).value }),
        onKeyDown: (e: KeyboardEvent) => {
          if (e.key === "Enter" || (context.delimiter && e.key === context.delimiter)) {
            e.preventDefault();
            send({ type: "ADD_TAG" });
          } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "") {
            send({ type: "REMOVE_LAST_TAG" });
          }
        },
      };
    },

    getTagProps(value: string) {
      return {
        "data-forge-scope": "tags-input",
        "data-forge-part": "tag",
        "data-value": value,
        "aria-label": value,
      };
    },

    getTagDeleteProps(value: string) {
      return {
        "data-forge-scope": "tags-input",
        "data-forge-part": "tag-delete",
        "aria-label": `Supprimer ${value}`,
        type: "button" as const,
        tabIndex: -1 as const,
        onClick: () => send({ type: "REMOVE_TAG", value }),
      };
    },

    getHiddenInputProps() {
      return {
        type: "hidden" as const,
        name: context.id,
        value: context.value.join(","),
        "aria-hidden": true as const,
      };
    },
  };
}
