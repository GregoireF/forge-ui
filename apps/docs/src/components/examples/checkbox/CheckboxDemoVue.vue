<template>
  <div class="forge-demo" style="flex-direction: column; gap: 0.75rem">
    <CheckboxRoot name="terms">
      <CheckboxControl>
        <CheckboxIndicator>✓</CheckboxIndicator>
      </CheckboxControl>
      <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
    </CheckboxRoot>

    <CheckboxRoot :default-checked="true" name="newsletter">
      <CheckboxControl>
        <CheckboxIndicator>✓</CheckboxIndicator>
      </CheckboxControl>
      <CheckboxLabel>Subscribe to newsletter</CheckboxLabel>
    </CheckboxRoot>

    <CheckboxRoot :disabled="true">
      <CheckboxControl>
        <CheckboxIndicator>✓</CheckboxIndicator>
      </CheckboxControl>
      <CheckboxLabel>Disabled option</CheckboxLabel>
    </CheckboxRoot>
  </div>
</template>

<script setup lang="ts">
import { CheckboxControl, CheckboxIndicator, CheckboxLabel, CheckboxRoot } from "@forge-ui/vue";
</script>
