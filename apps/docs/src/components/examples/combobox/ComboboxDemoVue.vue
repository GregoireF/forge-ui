<template>
  <div class="forge-demo">
    <ComboboxRoot :options="frameworks" placeholder="Search frameworks…">
      <ComboboxLabel>Framework</ComboboxLabel>
      <ComboboxInput />
      <ComboboxPortal>
        <ComboboxContent>
          <ComboboxItem v-for="opt in frameworks" :key="opt.value" :value="opt.value">
            <ComboboxItemText>{{ opt.label }}</ComboboxItemText>
          </ComboboxItem>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </div>
</template>

<script setup lang="ts">
import {
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemText,
  ComboboxLabel,
  ComboboxPortal,
  ComboboxRoot,
} from "@forge-ui/vue";

const frameworks = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid" },
  { value: "angular", label: "Angular" },
  { value: "preact", label: "Preact" },
];
</script>
