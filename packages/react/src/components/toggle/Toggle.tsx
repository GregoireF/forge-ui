import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseToggleOptions, UseToggleReturn } from "./use-toggle.js";
import { useToggle } from "./use-toggle.js";

// ---------------------------------------------------------------------------
// Standalone Toggle — no compound context needed (single element)
// ---------------------------------------------------------------------------

export interface ToggleProps
  extends UseToggleOptions,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue"> {
  asChild?: boolean;
  children?: ReactNode;
}

export function Toggle({
  asChild,
  children,
  pressed,
  defaultPressed,
  onPressedChange,
  disabled,
  id,
  value,
  ...rest
}: ToggleProps) {
  const api = useToggle({
    ...(pressed !== undefined && { pressed }),
    ...(defaultPressed !== undefined && { defaultPressed }),
    ...(onPressedChange !== undefined && { onPressedChange }),
    ...(disabled !== undefined && { disabled }),
    ...(id !== undefined && { id }),
    ...(value !== undefined && { value }),
  });
  const { onKeydown: _kd, ...rootProps } = api.getRootProps();
  const props = { ...rootProps, ...rest } as ButtonHTMLAttributes<HTMLButtonElement>;

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// Re-export hook for composable usage
export type { UseToggleOptions, UseToggleReturn };
