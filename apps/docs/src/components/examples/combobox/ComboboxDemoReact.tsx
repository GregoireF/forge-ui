import { Combobox } from "@forge-ui/react";

const FRAMEWORKS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular" },
  { value: "preact", label: "Preact" },
];

export function ComboboxDemoReact() {
  return (
    <div className="forge-demo">
      <Combobox.Root options={FRAMEWORKS} placeholder="Search frameworks…">
        <Combobox.Label>Framework</Combobox.Label>
        <Combobox.Input />
        <Combobox.Portal>
          <Combobox.Content>
            {FRAMEWORKS.map((opt) => (
              <Combobox.Item key={opt.value} value={opt.value}>
                <Combobox.ItemText>{opt.label}</Combobox.ItemText>
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Portal>
      </Combobox.Root>
    </div>
  );
}
