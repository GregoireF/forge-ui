<template>
  <div class="forge-demo" style="flex-direction: column; gap: 0.75rem">
    <SwitchRoot>
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
      <SwitchLabel>Enable notifications</SwitchLabel>
    </SwitchRoot>

    <SwitchRoot :default-checked="true">
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
      <SwitchLabel>Dark mode (on by default)</SwitchLabel>
    </SwitchRoot>

    <SwitchRoot :disabled="true">
      <SwitchControl>
        <SwitchThumb />
      </SwitchControl>
      <SwitchLabel>Disabled switch</SwitchLabel>
    </SwitchRoot>
  </div>
</template>

<script setup lang="ts">
import { SwitchControl, SwitchLabel, SwitchRoot, SwitchThumb } from "@forge-ui/vue";
</script>
