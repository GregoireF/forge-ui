import type { ButtonHTMLAttributes, ReactNode } from "react";
import { createContext, useContext } from "react";
import { Slot } from "../shared/Slot.js";
import type { UseToggleGroupOptions, UseToggleGroupReturn } from "./use-toggle-group.js";
import { useToggleGroup } from "./use-toggle-group.js";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToggleGroupCtx = createContext<UseToggleGroupReturn | null>(null);

function useCtx(): UseToggleGroupReturn {
  const ctx = useContext(ToggleGroupCtx);
  if (!ctx) throw new Error("ToggleGroup.Item must be used inside <ToggleGroup.Root>");
  return ctx;
}

// ---------------------------------------------------------------------------
// Root — role="toolbar"
// ---------------------------------------------------------------------------

export interface ToggleGroupRootProps extends UseToggleGroupOptions {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

function Root({ children, className, style, "aria-label": ariaLabel, ...opts }: ToggleGroupRootProps) {
  const api = useToggleGroup(opts);

  return (
    <ToggleGroupCtx.Provider value={api}>
      <div
        {...api.getRootProps()}
        className={className}
        style={style}
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </ToggleGroupCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// Item — role="button" aria-pressed
// ---------------------------------------------------------------------------

export interface ToggleGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue"> {
  value: string;
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
}

function Item({ value, asChild, children, disabled, ...rest }: ToggleGroupItemProps) {
  const api = useCtx();
  const { onKeydown: _kd, ...itemProps } = api.getItemProps(value, disabled);
  const props = { ...itemProps, ...rest } as ButtonHTMLAttributes<HTMLButtonElement>;

  if (asChild) return <Slot {...props}>{children}</Slot>;
  return <button {...props}>{children}</button>;
}

// ---------------------------------------------------------------------------
// Namespace export
// ---------------------------------------------------------------------------

export const ToggleGroup = { Root, Item } as const;
