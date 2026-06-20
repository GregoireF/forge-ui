<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <div
      style="width: 100%; max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.5rem"
    >
      <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem"
      >
        <span style="font-size: 0.875rem; color: var(--sl-color-white)">Volume</span>
        <span style="font-size: 0.875rem; color: var(--sl-color-accent); font-weight: 600">
          {{ value }}%
        </span>
      </div>

      <SliderRoot
        :value="value"
        :on-value-change="(v) => (value = v)"
        style="position: relative; height: 20px; display: flex; align-items: center"
      >
        <SliderTrack
          style="flex: 1; height: 6px; background: var(--sl-color-gray-6); border-radius: 999px; position: relative; overflow: visible"
        >
          <SliderRange
            style="position: absolute; height: 100%; background: var(--sl-color-accent); border-radius: 999px"
          />
        </SliderTrack>
        <SliderThumb
          style="position: absolute; width: 18px; height: 18px; background: white; border-radius: 50%; box-shadow: 0 1px 4px rgba(0,0,0,0.4); cursor: pointer; outline: none; top: 50%; transform: translateX(-50%) translateY(-50%)"
          aria-label="Volume"
        />
      </SliderRoot>

      <div style="display: flex; gap: 0.5rem; justify-content: center">
        <button @click="value = 0">Min</button>
        <button @click="value = 50">50%</button>
        <button @click="value = 100">Max</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "@forge-ui/vue";
import { ref } from "vue";

const value = ref(40);
</script>
