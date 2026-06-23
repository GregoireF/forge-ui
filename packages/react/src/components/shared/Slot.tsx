import type { ReactElement, ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";

type AnyProps = Record<string, unknown>;

function mergeProps(slot: AnyProps, child: AnyProps): AnyProps {
  const merged: AnyProps = { ...slot };
  for (const key of Object.keys(child)) {
    const s = slot[key];
    const c = child[key];
    if (/^on[A-Z]/.test(key) && typeof s === "function" && typeof c === "function") {
      merged[key] = (...args: unknown[]) => {
        (c as (...a: unknown[]) => void)(...args);
        (s as (...a: unknown[]) => void)(...args);
      };
    } else if (key === "className") {
      merged[key] = [s, c].filter(Boolean).join(" ");
    } else if (key === "style") {
      merged[key] = { ...(s as object), ...(c as object) };
    } else {
      merged[key] = c;
    }
  }
  return merged;
}

export interface SlotProps {
  children?: ReactNode;
  [key: string]: unknown;
}

export function Slot({ children, ...slotProps }: SlotProps) {
  if (!isValidElement(children)) {
    // biome-ignore lint/complexity/noUselessFragments: children may contain multiple nodes
    return Children.count(children) > 0 ? <>{children}</> : null;
  }
  return cloneElement(
    children as ReactElement<AnyProps>,
    mergeProps(slotProps, (children as ReactElement<AnyProps>).props),
  );
}
