import type { FieldApi } from "@forge-ui/field";
import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useId, useLayoutEffect } from "react";
import { Slot } from "../shared/Slot.js";
import type { CreateFieldOptions } from "./use-field.js";
import { useField } from "./use-field.js";

const FieldCtx = createContext<FieldApi | null>(null);

function useCtx(): FieldApi {
  const ctx = useContext(FieldCtx);
  if (!ctx) throw new Error("Field compound parts must be used inside <Field.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root
// ---------------------------------------------------------------------------

export interface FieldRootProps extends CreateFieldOptions {
  children: ReactNode;
}

function Root({ children, ...opts }: FieldRootProps) {
  const api = useField(opts);
  return <FieldCtx.Provider value={api}>{children}</FieldCtx.Provider>;
}

// ---------------------------------------------------------------------------
// Label
// ---------------------------------------------------------------------------

export interface FieldLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  asChild?: boolean;
}

function Label({ asChild, children, ...rest }: FieldLabelProps) {
  const api = useCtx();
  const props = { ...api.getLabelProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor wires to Field.Control's id; control is in a sibling compound part
  return <label {...props}>{children}</label>;
}

// ---------------------------------------------------------------------------
// RequiredIndicator â€” visual marker (*) hidden from screen readers.
// Screen readers get the required status via aria-required on the control.
// ---------------------------------------------------------------------------

export interface FieldRequiredIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

function RequiredIndicator({ asChild, children = "*", ...rest }: FieldRequiredIndicatorProps) {
  const api = useCtx();
  if (!api.context.required) return null;
  const props = { ...api.getRequiredIndicatorProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <span {...props}>{children}</span>;
}

// ---------------------------------------------------------------------------
// Control â€” always renderless Slot. Merges accessible control props onto child.
// The child element (input, select, textarea, or custom trigger) keeps its own
// semantics; Field.Control only contributes IDs and ARIA attributes.
// ---------------------------------------------------------------------------

export interface FieldControlProps {
  children: ReactNode;
}

function Control({ children }: FieldControlProps) {
  const api = useCtx();
  return <Slot {...api.getControlProps()}>{children}</Slot>;
}

// ---------------------------------------------------------------------------
// Description â€” registers itself so aria-describedby is auto-populated.
// ---------------------------------------------------------------------------

export interface FieldDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function Description({ asChild, children, ...rest }: FieldDescriptionProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.registerDescription();
    return () => api.unregisterDescription();
  }, [api]);

  const props = { ...api.getDescriptionProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <p {...props}>{children}</p>;
}

// ---------------------------------------------------------------------------
// Error â€” renders only when invalid; auto-registers for aria-describedby.
// Named FieldError internally to avoid shadowing the global Error constructor.
// ---------------------------------------------------------------------------

export interface FieldErrorProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function FieldError({ asChild, children, ...rest }: FieldErrorProps) {
  const api = useCtx();

  useLayoutEffect(() => {
    api.registerError();
    return () => api.unregisterError();
  }, [api]);

  if (!api.context.invalid) return null;

  const props = { ...api.getErrorProps(), ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <p {...props}>{children}</p>;
}

// ---------------------------------------------------------------------------
// Group â€” wraps a set of form controls (checkboxes, radios) with role="group"
// and aria-labelledby so screen readers announce the group label.
// ---------------------------------------------------------------------------

interface FieldGroupContextValue { labelId: string }
const FieldGroupCtx = createContext<FieldGroupContextValue | null>(null);

export interface FieldGroupProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

function Group({ asChild, children, ...rest }: FieldGroupProps) {
  const reactId = useId();
  const labelId = `${reactId.replace(/:/g, "")}-group-label`;
  const props = { role: "group" as const, "aria-labelledby": labelId, ...rest };
  return (
    <FieldGroupCtx.Provider value={{ labelId }}>
      {asChild ? <Slot {...props}>{children}</Slot> : <div {...props}>{children}</div>}
    </FieldGroupCtx.Provider>
  );
}

export interface FieldGroupLabelProps extends HTMLAttributes<HTMLParagraphElement> {
  asChild?: boolean;
}

function GroupLabel({ asChild, children, ...rest }: FieldGroupLabelProps) {
  const ctx = useContext(FieldGroupCtx);
  if (!ctx) throw new Error("Field.GroupLabel must be used inside <Field.Group>");
  const props = { id: ctx.labelId, ...rest };
  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <p {...props}>{children}</p>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const Field = {
  Root,
  Label,
  RequiredIndicator,
  Control,
  Description,
  Error: FieldError,
  Group,
  GroupLabel,
} as const;
