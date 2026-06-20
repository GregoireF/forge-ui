import { Field } from "@forge-ui/react";
import { useState } from "react";

export function FieldDemoReact() {
  const [value, setValue] = useState("");
  const hasError = value.length > 0 && value.length < 3;

  return (
    <div className="forge-demo">
      <div className="forge-field-demo">
        <Field.Root invalid={hasError}>
          <Field.Label>
            Username
            <Field.RequiredIndicator />
          </Field.Label>
          <Field.Control
            as="input"
            type="text"
            placeholder="Enter username…"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
          />
          <Field.Description>Must be at least 3 characters.</Field.Description>
          {hasError && <Field.Error>Too short — minimum 3 characters.</Field.Error>}
        </Field.Root>
      </div>
    </div>
  );
}
