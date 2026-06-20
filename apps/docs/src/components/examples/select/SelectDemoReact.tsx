import { Select } from "@forge-ui/react";

const FRUITS = ["Apple", "Banana", "Cherry", "Mango", "Pineapple"];

export function SelectDemoReact() {
  return (
    <div className="forge-demo">
      <Select.Root>
        <Select.Trigger>
          <Select.Value placeholder="Pick a fruit…" />
          <Select.Indicator>▾</Select.Indicator>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content>
            {FRUITS.map((fruit) => (
              <Select.Item key={fruit} value={fruit.toLowerCase()}>
                <Select.ItemText>{fruit}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
