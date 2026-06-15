import type { CreateFieldOptions, FieldApi } from "@forge-ui/field";
import { createField } from "@forge-ui/field";
import { useMemo } from "react";

export type { CreateFieldOptions };

export function useField(options: CreateFieldOptions = {}): FieldApi {
  // biome-ignore lint/correctness/useExhaustiveDependencies: dep on specific option primitives is intentional — options object identity changes every render
  return useMemo(
    () => createField(options),
    [options.id, options.invalid, options.required, options.disabled, options.readOnly],
  );
}
