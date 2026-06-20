import { RadioGroup } from "@forge-ui/react";

const OPTIONS = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];

export function RadioGroupDemoReact() {
  return (
    <div className="forge-demo">
      <RadioGroup.Root defaultValue="react">
        {OPTIONS.map(({ value, label }) => (
          <RadioGroup.Item key={value} value={value}>
            <RadioGroup.Radio value={value} />
            <RadioGroup.Label value={value}>{label}</RadioGroup.Label>
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  );
}
