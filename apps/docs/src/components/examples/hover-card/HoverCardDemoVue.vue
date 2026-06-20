<template>
  <div class="forge-demo">
    <HoverCardRoot :open-delay="200" :close-delay="150">
      <HoverCardTrigger>
        <span style="text-decoration: underline; cursor: pointer; color: var(--sl-color-accent)">
          @forge-ui
        </span>
      </HoverCardTrigger>
      <HoverCardPortal>
        <HoverCardContent :side-offset="8">
          <div style="display: flex; flex-direction: column; gap: 0.5rem">
            <strong style="color: var(--sl-color-white); font-size: 0.95rem">forge-ui</strong>
            <p style="margin: 0; font-size: 0.8rem; color: var(--sl-color-gray-3); line-height: 1.5">
              Headless UI primitives for React and Vue. Unstyled, accessible, and built on a stable
              CSS contract.
            </p>
            <span style="font-size: 0.75rem; color: var(--sl-color-gray-4)">
              14 primitives · MIT license
            </span>
          </div>
          <HoverCardArrow />
        </HoverCardContent>
      </HoverCardPortal>
    </HoverCardRoot>
  </div>
</template>

<script setup lang="ts">
import {
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
} from "@forge-ui/vue";
</script>
