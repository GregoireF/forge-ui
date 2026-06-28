<template>
  <div class="forge-demo">
    <RadioGroupRoot default-value="react">
      <RadioGroupItem v-for="opt in options" :key="opt.value" :value="opt.value">
        <RadioGroupRadio />
        <RadioGroupLabel>{{ opt.label }}</RadioGroupLabel>
      </RadioGroupItem>
    </RadioGroupRoot>
  </div>
</template>

<script setup lang="ts">
import { RadioGroupItem, RadioGroupLabel, RadioGroupRadio, RadioGroupRoot } from "@forge-ui/vue";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
];
</script>
