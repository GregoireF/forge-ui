<template>
  <div class="forge-demo" style="flex-direction: column; gap: 0.75rem">
    <CheckboxRoot>
      <CheckboxControl>
        <CheckboxIndicator>✓</CheckboxIndicator>
      </CheckboxControl>
      <CheckboxLabel>Accept terms and conditions</CheckboxLabel>
      <CheckboxHiddenInput name="terms" />
    </CheckboxRoot>

    <CheckboxRoot :default-checked="true">
      <CheckboxControl>
        <CheckboxIndicator>✓</CheckboxIndicator>
      </CheckboxControl>
      <CheckboxLabel>Subscribe to newsletter</CheckboxLabel>
      <CheckboxHiddenInput name="newsletter" />
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
import {
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxRoot,
} from "@forge-ui/vue";
</script>
