import type { FieldApi } from "@forge-ui/field";
import type { HTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useLayoutEffect } from "react";
import { Slot } from "../dialog/Slot.js";
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
// Control — always renderless Slot. Merges accessible control props onto child.
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
// Description — registers itself so aria-describedby is auto-populated.
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
// Error — renders only when invalid; auto-registers for aria-describedby.
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
// Namespace export
// ---------------------------------------------------------------------------

export const Field = {
  Root,
  Label,
  Control,
  Description,
  Error: FieldError,
} as const;
