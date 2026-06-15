// ---------------------------------------------------------------------------
// @forge-ui/field — field context types
//
// Field is a pure context provider (no FSM). It wires accessible IDs between
// label, control, description and error elements — same pattern as Radix Form
// + shadcn FormField, but framework-agnostic.
// ---------------------------------------------------------------------------

export interface FieldIds {
  /** id of the form control element (input, select, textarea, or custom). */
  controlId: string;
  /** id of the <label> element. */
  labelId: string;
  /** id of the helper description element (optional). */
  descriptionId: string;
  /** id of the validation error element (optional). */
  errorId: string;
}

export interface FieldState {
  /** Whether the field currently has a validation error. */
  invalid: boolean;
  /** Whether the field is required. */
  required: boolean;
  /** Whether the field is disabled. */
  disabled: boolean;
  /** Whether the field is read-only. */
  readOnly: boolean;
  /** Whether a description element is rendered (auto-detected by Field.Description). */
  hasDescription: boolean;
  /** Whether an error element is rendered (auto-detected by Field.Error). */
  hasError: boolean;
}

export interface FieldContext extends FieldIds, FieldState {}

export interface CreateFieldOptions {
  /** Stable base id. Defaults to a generated id. */
  id?: string;
  /** Whether the field has a validation error. Default: false. */
  invalid?: boolean;
  /** Whether the field is required. Default: false. */
  required?: boolean;
  /** Whether the field is disabled. Default: false. */
  disabled?: boolean;
  /** Whether the field is read-only. Default: false. */
  readOnly?: boolean;
}
