<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <CollapsibleRoot style="width: 100%; max-width: 400px; margin: 0 auto">
      <CollapsibleTrigger>Toggle details ▾</CollapsibleTrigger>
      <CollapsibleContent>
        <p>
          This panel is toggled by the button above. It supports exit animations via
          <code>forceMount</code> and controlled/uncontrolled modes.
        </p>
      </CollapsibleContent>
    </CollapsibleRoot>
  </div>
</template>

<script setup lang="ts">
import { CollapsibleContent, CollapsibleRoot, CollapsibleTrigger } from "@forge-ui/vue";
</script>
