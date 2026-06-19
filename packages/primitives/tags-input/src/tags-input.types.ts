export interface TagsInputContext {
  id: string;
  inputId: string;
  labelId: string;
  value: string[];
  inputValue: string;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  invalid: boolean;
  maxTags?: number;
  delimiter?: string;
  allowDuplicates: boolean;
  onValueChange?: (value: string[]) => void;
  onInputChange?: (value: string) => void;
}

export type TagsInputState = "idle" | "focused";

export type TagsInputEvent =
  | { type: "FOCUS" }
  | { type: "BLUR" }
  | { type: "INPUT_CHANGE"; value: string }
  | { type: "ADD_TAG" }
  | { type: "REMOVE_TAG"; value: string }
  | { type: "REMOVE_LAST_TAG" }
  | { type: "SET_VALUE"; value: string[] };

export type TagsInputSend = (event: TagsInputEvent) => void;
