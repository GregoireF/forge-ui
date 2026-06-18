export interface FieldIds {
  controlId: string;
  labelId: string;
  descriptionId: string;
  errorId: string;
}

export interface FieldState {
  invalid: boolean;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  hasDescription: boolean;
  hasError: boolean;
}

export interface FieldContext extends FieldIds, FieldState {}

export interface CreateFieldOptions {
  id?: string;
  invalid?: boolean;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

export interface FieldConnectReturn {
  context: FieldContext;
  getLabelProps(): { id: string; htmlFor: string };
  getControlProps(): {
    id: string;
    "aria-labelledby": string;
    "aria-describedby": string | undefined;
    "aria-invalid": true | undefined;
    "aria-required": true | undefined;
    "aria-disabled": true | undefined;
    "aria-readonly": true | undefined;
    required: true | undefined;
    disabled: true | undefined;
    readOnly: true | undefined;
  };
  getDescriptionProps(): { id: string };
  getErrorProps(): { id: string; role: "alert"; "aria-live": "assertive" };
  /** Wraps the required indicator (* or custom) with aria-hidden so screen readers skip it.
   *  Screen readers already get the required status from aria-required on the control. */
  getRequiredIndicatorProps(): { "aria-hidden": true };
}

// Full API returned by framework hooks — extends connect with reactive register/unregister.
export interface FieldApi extends FieldConnectReturn {
  registerDescription(): void;
  unregisterDescription(): void;
  registerError(): void;
  unregisterError(): void;
}
