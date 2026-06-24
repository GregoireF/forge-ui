<template>
  <div class="forge-demo" style="flex-direction: column; gap: 1.5rem">
    <div>
      <NumberInputRoot
        :default-value="50"
        :min="0"
        :max="100"
        :step="1"
        :on-value-change="(v) => (value = v)"
        style="display: flex; flex-direction: column; gap: 0.35rem"
      >
        <NumberInputLabel style="font-size: 0.875rem; font-weight: 500; color: var(--sl-color-white)">
          Quantity
        </NumberInputLabel>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <NumberInputDecrementTrigger :style="btnStyle">−</NumberInputDecrementTrigger>
          <NumberInputInput aria-label="Quantity" :style="inputStyle" />
          <NumberInputIncrementTrigger :style="btnStyle">+</NumberInputIncrementTrigger>
        </div>
        <span style="font-size: 0.75rem; color: var(--sl-color-gray-3)">
          value: {{ value ?? "empty" }} — min 0, max 100
        </span>
        <NumberInputHiddenInput name="quantity" />
      </NumberInputRoot>
    </div>

    <div>
      <NumberInputRoot
        :default-value="25"
        :min="0"
        :max="100"
        :step="5"
        style="display: flex; flex-direction: column; gap: 0.35rem"
      >
        <NumberInputLabel style="font-size: 0.875rem; font-weight: 500; color: var(--sl-color-white)">
          Step 5
        </NumberInputLabel>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <NumberInputDecrementTrigger :style="btnStyle">−</NumberInputDecrementTrigger>
          <NumberInputInput aria-label="Step 5" :style="inputStyle" />
          <NumberInputIncrementTrigger :style="btnStyle">+</NumberInputIncrementTrigger>
        </div>
        <span style="font-size: 0.75rem; color: var(--sl-color-gray-3)">
          ArrowUp/Down ±5 · PageUp/Down ±50
        </span>
      </NumberInputRoot>
    </div>

    <div style="opacity: 0.5">
      <NumberInputRoot
        :default-value="25"
        :min="0"
        :max="100"
        :disabled="true"
        style="display: flex; flex-direction: column; gap: 0.35rem"
      >
        <NumberInputLabel style="font-size: 0.875rem; font-weight: 500; color: var(--sl-color-white)">
          Disabled
        </NumberInputLabel>
        <div style="display: flex; align-items: center; gap: 0.5rem">
          <NumberInputDecrementTrigger :style="btnStyle">−</NumberInputDecrementTrigger>
          <NumberInputInput aria-label="Disabled quantity" :style="inputStyle" />
          <NumberInputIncrementTrigger :style="btnStyle">+</NumberInputIncrementTrigger>
        </div>
      </NumberInputRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  NumberInputDecrementTrigger,
  NumberInputHiddenInput,
  NumberInputIncrementTrigger,
  NumberInputInput,
  NumberInputLabel,
  NumberInputRoot,
} from "@forge-ui/vue";
import { ref } from "vue";

const value = ref<number | null>(50);

const btnStyle = {
  width: "32px",
  height: "32px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--sl-color-gray-5)",
  borderRadius: "6px",
  background: "var(--sl-color-black)",
  color: "var(--sl-color-white)",
  cursor: "pointer",
  fontSize: "1.125rem",
};

const inputStyle = {
  width: "70px",
  textAlign: "center" as const,
  padding: "0.4rem",
  border: "1px solid var(--sl-color-gray-5)",
  borderRadius: "6px",
  background: "var(--sl-color-black)",
  color: "var(--sl-color-white)",
  fontSize: "0.875rem",
};
</script>
