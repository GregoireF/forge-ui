<template>
  <div class="forge-demo" style="gap: 1.5rem">
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :side-offset="6">
            This is a tooltip
            <TooltipArrow />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>

      <TooltipRoot>
        <TooltipTrigger>Settings</TooltipTrigger>
        <TooltipPortal>
          <TooltipContent :side-offset="6">
            Open application settings
            <TooltipArrow />
          </TooltipContent>
        </TooltipPortal>
      </TooltipRoot>
    </TooltipProvider>
  </div>
</template>

<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "@forge-ui/vue";
</script>
