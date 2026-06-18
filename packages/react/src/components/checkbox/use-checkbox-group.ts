import { useCallback, useState } from "react";
import type { CheckboxChecked } from "./use-checkbox.js";

export interface UseCheckboxGroupOptions {
  /** Controlled list of checked item values. */
  value?: string[];
  /** Uncontrolled initial checked values. */
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  /** Shared name for all child hidden inputs (for native form submission). */
  name?: string;
}

export function useCheckboxGroup(options: UseCheckboxGroupOptions = {}) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    disabled = false,
    required = false,
    name,
  } = options;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue ?? []);
  const value = isControlled ? controlledValue : internalValue;

  // Track registered item values so the select-all state can be computed.
  const [allValues, setAllValues] = useState(new Set<string>());

  const commit = useCallback(
    (next: string[]) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      const next = value.includes(itemValue)
        ? value.filter((v) => v !== itemValue)
        : [...value, itemValue];
      commit(next);
    },
    [value, commit],
  );

  const selectAll = useCallback(() => {
    commit([...allValues]);
  }, [allValues, commit]);

  const deselectAll = useCallback(() => {
    commit([]);
  }, [commit]);

  const registerValue = useCallback((v: string) => {
    setAllValues((prev) => new Set([...prev, v]));
  }, []);

  const unregisterValue = useCallback((v: string) => {
    setAllValues((prev) => {
      const s = new Set(prev);
      s.delete(v);
      return s;
    });
  }, []);

  // Derived select-all state — avoids prop drilling.
  const groupChecked: CheckboxChecked =
    value.length === 0
      ? false
      : value.length >= allValues.size && allValues.size > 0
        ? true
        : "indeterminate";

  return {
    value,
    groupChecked,
    disabled,
    required,
    name,
    toggle,
    selectAll,
    deselectAll,
    registerValue,
    unregisterValue,
    isChecked: (itemValue: string) => value.includes(itemValue),
  };
}

export type UseCheckboxGroupReturn = ReturnType<typeof useCheckboxGroup>;
