<template>
  <div class="forge-demo">
    <div class="forge-field-demo">
      <FieldRoot :invalid="hasError">
        <FieldLabel>
          Username
          <FieldRequiredIndicator />
        </FieldLabel>
        <FieldControl
          as="input"
          type="text"
          placeholder="Enter username…"
          v-model="value"
        />
        <FieldDescription>Must be at least 3 characters.</FieldDescription>
        <FieldError v-if="hasError">Too short — minimum 3 characters.</FieldError>
      </FieldRoot>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldRequiredIndicator,
  FieldRoot,
} from "@forge-ui/vue";
import { computed, ref } from "vue";

const value = ref("");
const hasError = computed(() => value.value.length > 0 && value.value.length < 3);
</script>
