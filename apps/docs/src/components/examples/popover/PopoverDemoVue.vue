<template>
  <div class="forge-demo">
    <PopoverRoot>
      <PopoverTrigger>Open Popover</PopoverTrigger>
      <PopoverPortal>
        <PopoverContent :side-offset="8">
          <PopoverTitle style="font-weight: 600; margin-bottom: 0.25rem; color: var(--sl-color-white)">
            Settings
          </PopoverTitle>
          <PopoverDescription>
            Configure your preferences. Changes apply immediately.
          </PopoverDescription>
          <PopoverClose style="margin-top: 0.75rem; display: block">Close</PopoverClose>
          <PopoverArrow />
        </PopoverContent>
      </PopoverPortal>
    </PopoverRoot>
  </div>
</template>

<script setup lang="ts">
import {
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverPortal,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@forge-ui/vue";
</script>
