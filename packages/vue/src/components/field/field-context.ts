import type { FieldApi } from "@forge-ui/field";
import type { InjectionKey } from "vue";

export const fieldKey: InjectionKey<FieldApi> = Symbol("forge-field");
