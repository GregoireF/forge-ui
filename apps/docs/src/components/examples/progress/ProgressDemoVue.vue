<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <div style="width: 100%; max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem">
      <ProgressRoot :value="value">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem">
          <ProgressLabel>Loading…</ProgressLabel>
          <ProgressValueText />
        </div>
        <ProgressTrack>
          <ProgressFill />
        </ProgressTrack>
      </ProgressRoot>

      <div style="display: flex; gap: 0.5rem; justify-content: center">
        <button @click="value = Math.max(0, value - 10)">−10</button>
        <button @click="value = Math.min(100, value + 10)">+10</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ProgressFill,
  ProgressLabel,
  ProgressRoot,
  ProgressTrack,
  ProgressValueText,
} from "@forge-ui/vue";
import { ref } from "vue";

const value = ref(40);
</script>
