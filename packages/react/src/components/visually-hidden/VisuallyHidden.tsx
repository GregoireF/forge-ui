import type { HTMLAttributes, ReactNode } from "react";
import type { VisuallyHiddenOptions } from "@forge-ui/visually-hidden";
import { connectVisuallyHidden } from "@forge-ui/visually-hidden";

export interface VisuallyHiddenProps
  extends VisuallyHiddenOptions,
    Omit<HTMLAttributes<HTMLSpanElement>, "tabIndex"> {
  children?: ReactNode;
}

export function VisuallyHidden({ focusable, children, ...rest }: VisuallyHiddenProps) {
  const api = connectVisuallyHidden({
    ...(focusable !== undefined && { focusable }),
  });
  const props = { ...api.getProps(), ...rest };
  return <span {...props}>{children}</span>;
}
