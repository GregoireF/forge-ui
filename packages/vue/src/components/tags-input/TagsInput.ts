import type { InjectionKey, PropType } from "vue";
import { defineComponent, h, inject, provide } from "vue";
import type { UseTagsInputOptions, UseTagsInputReturn } from "./use-tags-input.js";
import { useTagsInput } from "./use-tags-input.js";

// ---------------------------------------------------------------------------
// Injection key
// ---------------------------------------------------------------------------

const tagsInputKey: InjectionKey<UseTagsInputReturn> = Symbol("forge-tags-input");

function useCtx(): UseTagsInputReturn {
  const ctx = inject(tagsInputKey);
  if (!ctx) throw new Error("TagsInput compound parts must be inside <TagsInput.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

const TagsInputRoot = defineComponent({
  name: "ForgeTagsInputRoot",
  props: {
    id: { type: String, default: undefined },
    defaultValue: { type: Array as PropType<string[]>, default: undefined },
    value: { type: Array as PropType<string[]>, default: undefined },
    disabled: { type: Boolean, default: undefined },
    readOnly: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    invalid: { type: Boolean, default: undefined },
    maxTags: { type: Number, default: undefined },
    allowDuplicates: { type: Boolean, default: undefined },
    delimiter: { type: String, default: undefined },
    onValueChange: {
      type: Function as PropType<(value: string[]) => void>,
      default: undefined,
    },
    onInputChange: {
      type: Function as PropType<(value: string) => void>,
      default: undefined,
    },
  },
  emits: ["update:value"],
  setup(props, { slots, emit }) {
    const opts: UseTagsInputOptions = {
      ...(props.id !== undefined && { id: props.id }),
      ...(props.defaultValue !== undefined && { defaultValue: props.defaultValue }),
      ...(props.value !== undefined && { value: props.value }),
      ...(props.disabled !== undefined && { disabled: props.disabled }),
      ...(props.readOnly !== undefined && { readOnly: props.readOnly }),
      ...(props.required !== undefined && { required: props.required }),
      ...(props.invalid !== undefined && { invalid: props.invalid }),
      ...(props.maxTags !== undefined && { maxTags: props.maxTags }),
      ...(props.allowDuplicates !== undefined && { allowDuplicates: props.allowDuplicates }),
      ...(props.delimiter !== undefined && { delimiter: props.delimiter }),
      onValueChange: (v: string[]) => {
        emit("update:value", v);
        props.onValueChange?.(v);
      },
      ...(props.onInputChange !== undefined && { onInputChange: props.onInputChange }),
    };

    const api = useTagsInput(opts);
    provide(tagsInputKey, api);

    return () => h("div", api.getRootProps(), slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

const TagsInputLabel = defineComponent({
  name: "ForgeTagsInputLabel",
  setup(_props, { slots }) {
    const api = useCtx();
    return () => h("label", api.getLabelProps(), slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

const TagsInputInput = defineComponent({
  name: "ForgeTagsInputInput",
  setup() {
    const api = useCtx();
    return () => {
      const connectProps = api.getInputProps();
      // Vue uses onInput for native input events.
      return h("input", {
        id: connectProps.id,
        type: connectProps.type,
        value: connectProps.value,
        disabled: connectProps.disabled,
        readOnly: connectProps.readOnly,
        "aria-labelledby": connectProps["aria-labelledby"],
        "aria-required": connectProps["aria-required"],
        "aria-invalid": connectProps["aria-invalid"],
        "data-forge-scope": connectProps["data-forge-scope"],
        "data-forge-part": connectProps["data-forge-part"],
        onFocus: connectProps.onFocus,
        onBlur: connectProps.onBlur,
        onInput: connectProps.onInput,
        onKeydown: connectProps.onKeyDown,
      });
    };
  },
});

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

const TagsInputTag = defineComponent({
  name: "ForgeTagsInputTag",
  props: {
    value: { type: String, required: true as const },
  },
  setup(props, { slots }) {
    const api = useCtx();
    return () => h("span", api.getTagProps(props.value), slots.default?.());
  },
});

// ---------------------------------------------------------------------------
// TagDelete
// ---------------------------------------------------------------------------

const TagsInputTagDelete = defineComponent({
  name: "ForgeTagsInputTagDelete",
  props: {
    value: { type: String, required: true as const },
  },
  setup(props, { slots }) {
    const api = useCtx();
    return () =>
      h("button", api.getTagDeleteProps(props.value), slots.default?.() ?? "×");
  },
});

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

const TagsInputHiddenInput = defineComponent({
  name: "ForgeTagsInputHiddenInput",
  props: {
    name: { type: String, default: undefined },
  },
  setup(props) {
    const api = useCtx();
    return () => {
      const connectProps = api.getHiddenInputProps();
      return h("input", {
        ...connectProps,
        ...(props.name !== undefined && { name: props.name }),
      });
    };
  },
});

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const TagsInput = {
  Root: TagsInputRoot,
  Label: TagsInputLabel,
  Input: TagsInputInput,
  Tag: TagsInputTag,
  TagDelete: TagsInputTagDelete,
  HiddenInput: TagsInputHiddenInput,
} as const;

export {
  TagsInputRoot,
  TagsInputLabel,
  TagsInputInput,
  TagsInputTag,
  TagsInputTagDelete,
  TagsInputHiddenInput,
};
