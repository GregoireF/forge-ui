import type { HTMLAttributes } from "react";
import type { SeparatorOptions } from "@forge-ui/separator";
import { connectSeparator } from "@forge-ui/separator";

export interface SeparatorProps
  extends SeparatorOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "role"> {}

export function Separator({ orientation, decorative, ...rest }: SeparatorProps) {
  const api = connectSeparator({ orientation, decorative });
  const props = { ...api.getSeparatorProps(), ...rest };
  return <div {...props} />;
}
