import type { SeparatorOptions } from "@forge-ui/separator";
import { connectSeparator } from "@forge-ui/separator";
import type { HTMLAttributes } from "react";

export interface SeparatorProps
  extends SeparatorOptions,
    Omit<HTMLAttributes<HTMLDivElement>, "role"> {}

export function Separator({ orientation, decorative, ...rest }: SeparatorProps) {
  const api = connectSeparator({
    ...(orientation !== undefined && { orientation }),
    ...(decorative !== undefined && { decorative }),
  });
  const props = { ...api.getSeparatorProps(), ...rest };
  return <div {...props} />;
}
