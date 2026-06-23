import type { ButtonHTMLAttributes, CSSProperties, HTMLAttributes, InputHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import type { UseTagsInputOptions, UseTagsInputReturn } from "./use-tags-input.js";
import { useTagsInput } from "./use-tags-input.js";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const TagsInputCtx = createContext<UseTagsInputReturn | null>(null);

function useCtx(): UseTagsInputReturn {
  const ctx = useContext(TagsInputCtx);
  if (!ctx) throw new Error("TagsInput compound parts must be used inside <TagsInput.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface TagsInputRootProps extends UseTagsInputOptions {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

function Root({
  children,
  style,
  className,
  id,
  defaultValue,
  value,
  disabled,
  readOnly,
  required,
  invalid,
  maxTags,
  allowDuplicates,
  delimiter,
  onValueChange,
  onInputChange,
}: TagsInputRootProps) {
  const api = useTagsInput({
    ...(id !== undefined && { id }),
    ...(defaultValue !== undefined && { defaultValue }),
    ...(value !== undefined && { value }),
    ...(disabled !== undefined && { disabled }),
    ...(readOnly !== undefined && { readOnly }),
    ...(required !== undefined && { required }),
    ...(invalid !== undefined && { invalid }),
    ...(maxTags !== undefined && { maxTags }),
    ...(allowDuplicates !== undefined && { allowDuplicates }),
    ...(delimiter !== undefined && { delimiter }),
    ...(onValueChange !== undefined && { onValueChange }),
    ...(onInputChange !== undefined && { onInputChange }),
  });

  const liveRegionRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<string[]>(api.value);

  useEffect(() => {
    const prev = prevValueRef.current;
    const curr = api.value;
    if (curr.length > prev.length) {
      const added = curr.find((v) => !prev.includes(v)) ?? curr[curr.length - 1];
      if (liveRegionRef.current) liveRegionRef.current.textContent = `${added} added`;
    } else if (curr.length < prev.length) {
      const removed = prev.find((v) => !curr.includes(v)) ?? prev[prev.length - 1];
      if (liveRegionRef.current) liveRegionRef.current.textContent = `${removed} removed`;
    }
    prevValueRef.current = curr;
  }, [api.value]);

  return (
    <TagsInputCtx.Provider value={api}>
      <div {...api.getRootProps()} style={style} className={className}>
        {children}
        <span
          {...api.getLiveRegionProps()}
          ref={liveRegionRef}
          style={{ position: "absolute", width: "1px", height: "1px", padding: 0, margin: "-1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap", border: 0 }}
        />
      </div>
    </TagsInputCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface TagsInputLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children?: ReactNode;
}

function Label({ children, ...rest }: TagsInputLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

export interface TagsInputInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "type"> {}

function Input({ ...rest }: TagsInputInputProps) {
  const api = useCtx();
  const connectProps = api.getInputProps();

  // React uses onChange for controlled inputs. We rebind from onInput → onChange.
  // onKeyDown is compatible between DOM and React.
  return (
    <input
      {...rest}
      id={connectProps.id}
      type={connectProps.type}
      value={connectProps.value}
      disabled={connectProps.disabled}
      readOnly={connectProps.readOnly}
      aria-labelledby={connectProps["aria-labelledby"]}
      aria-required={connectProps["aria-required"]}
      aria-invalid={connectProps["aria-invalid"]}
      data-forge-scope={connectProps["data-forge-scope"]}
      data-forge-part={connectProps["data-forge-part"]}
      onFocus={() => api.send({ type: "FOCUS" })}
      onBlur={(e) => {
        if (e.target.value.trim()) api.send({ type: "ADD_TAG" });
        api.send({ type: "BLUR" });
      }}
      onChange={(e) => {
        api.send({ type: "INPUT_CHANGE", value: e.target.value });
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || (api.delimiter && e.key === api.delimiter)) {
          e.preventDefault();
          api.send({ type: "ADD_TAG" });
        } else if (e.key === "Backspace" && e.currentTarget.value === "") {
          api.send({ type: "REMOVE_LAST_TAG" });
        }
      }}
    />
  );
}

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export interface TagsInputTagProps extends HTMLAttributes<HTMLSpanElement> {
  value: string;
}

function Tag({ value, children, ...rest }: TagsInputTagProps) {
  const api = useCtx();
  return (
    <span {...api.getTagProps(value)} {...rest}>
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TagDelete
// ---------------------------------------------------------------------------

export interface TagsInputTagDeleteProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "tabIndex" | "onClick"> {
  value: string;
}

function TagDelete({ value, children, ...rest }: TagsInputTagDeleteProps) {
  const api = useCtx();
  return (
    <button {...api.getTagDeleteProps(value)} {...rest}>
      {children ?? "×"}
    </button>
  );
}

// ---------------------------------------------------------------------------
// HiddenInput
// ---------------------------------------------------------------------------

export interface TagsInputHiddenInputProps {
  name?: string;
}

function HiddenInput({ name }: TagsInputHiddenInputProps) {
  const api = useCtx();
  const props = api.getHiddenInputProps();
  return <input {...props} {...(name !== undefined && { name })} />;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const TagsInput = {
  Root,
  Label,
  Input,
  Tag,
  TagDelete,
  HiddenInput,
} as const;

export {
  Root as TagsInputRoot,
  Label as TagsInputLabel,
  Input as TagsInputInput,
  Tag as TagsInputTag,
  TagDelete as TagsInputTagDelete,
  HiddenInput as TagsInputHiddenInput,
};
