<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <TabsRoot default-value="overview" style="width: 100%; max-width: 480px; margin: 0 auto">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      <TabsPanel value="overview">
        The Overview tab contains a high-level summary of the component and its main use cases.
      </TabsPanel>
      <TabsPanel value="details">
        The Details tab shows technical specifications, props, and configuration options.
      </TabsPanel>
      <TabsPanel value="reviews">
        The Reviews tab displays user feedback and ratings for this component.
      </TabsPanel>
    </TabsRoot>
  </div>
</template>

<script setup lang="ts">
import { TabsList, TabsPanel, TabsRoot, TabsTrigger } from "@forge-ui/vue";
</script>
