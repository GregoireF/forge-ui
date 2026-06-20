<template>
  <div class="forge-demo">
    <SelectRoot>
      <SelectTrigger>
        <SelectValue placeholder="Pick a fruit…" />
        <SelectIndicator>▾</SelectIndicator>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent>
          <SelectItem v-for="fruit in fruits" :key="fruit.value" :value="fruit.value">
            <SelectItemText>{{ fruit.label }}</SelectItemText>
          </SelectItem>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<script setup lang="ts">
import {
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "@forge-ui/vue";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "mango", label: "Mango" },
  { value: "pineapple", label: "Pineapple" },
];
</script>
