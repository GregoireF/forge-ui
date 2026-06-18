import type { CreateFieldOptions, FieldApi, FieldContext } from "@forge-ui/field";
import { connectField, createFieldIds } from "@forge-ui/field";
import { useId, useLayoutEffect, useMemo, useState } from "react";

export type { CreateFieldOptions };

export function useField(options: CreateFieldOptions = {}): FieldApi {
  // useId() is stable across SSR + hydration — avoids module-level counter mismatch.
  const reactId = useId();
  // IDs are stable — only regenerate when the explicit id option changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional — id is the only dep that should reset IDs
  const ids = useMemo(
    () => createFieldIds(options.id ?? reactId.replace(/:/g, "")),
    [options.id, reactId],
  );

  // Framework-owned reactive state for slot registration.
  // useState ensures React re-renders Field.Control when Description or
  // Error mount/unmount, so aria-describedby stays in sync.
  const [hasDescription, setHasDescription] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Sync description/error registration state when unmounting during strict mode double-invoke.
  useLayoutEffect(() => () => { setHasDescription(false); setHasError(false); }, []);

  const context = useMemo<FieldContext>(
    () => ({
      ...ids,
      invalid: options.invalid ?? false,
      required: options.required ?? false,
      disabled: options.disabled ?? false,
      readOnly: options.readOnly ?? false,
      hasDescription,
      hasError,
    }),
    // biome-ignore lint/correctness/useExhaustiveDependencies: dep on specific option primitives, not the options object
    [ids, options.invalid, options.required, options.disabled, options.readOnly, hasDescription, hasError],
  );

  const connect = useMemo(() => connectField(context), [context]);

  return useMemo(
    () => ({
      ...connect,
      registerDescription: () => setHasDescription(true),
      unregisterDescription: () => setHasDescription(false),
      registerError: () => setHasError(true),
      unregisterError: () => setHasError(false),
    }),
    [connect],
  );
}
