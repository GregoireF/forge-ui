<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <AccordionRoot
      type="single"
      :collapsible="true"
      style="width: 100%; max-width: 480px; margin: 0 auto"
    >
      <AccordionItem value="what">
        <AccordionHeader>
          <AccordionTrigger :style="triggerStyle">
            What is forge-ui?
            <span style="opacity: 0.5">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent :style="contentStyle">
          forge-ui is a headless component library built on a machine → connect → framework
          architecture, giving you complete styling freedom.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="why">
        <AccordionHeader>
          <AccordionTrigger :style="triggerStyle">
            Why headless?
            <span style="opacity: 0.5">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent :style="contentStyle">
          Headless components handle behavior and accessibility while you own the styles. No CSS
          overrides, no specificity wars.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="how">
        <AccordionHeader>
          <AccordionTrigger :style="{ ...triggerStyle, borderBottom: 'none' }">
            How does the CSS contract work?
            <span style="opacity: 0.5">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent :style="{ ...contentStyle, borderBottom: 'none' }">
          Every element gets <code>data-forge-scope</code> and <code>data-forge-part</code>
          attributes. Style them with stable selectors that never break.
        </AccordionContent>
      </AccordionItem>
    </AccordionRoot>
  </div>
</template>

<script setup lang="ts">
import {
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionRoot,
  AccordionTrigger,
} from "@forge-ui/vue";

const triggerStyle = {
  width: "100%",
  textAlign: "left",
  padding: "0.75rem 0",
  background: "none",
  border: "none",
  borderBottom: "1px solid var(--sl-color-hairline)",
  color: "var(--sl-color-white)",
  cursor: "pointer",
  fontSize: "0.9rem",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const contentStyle = {
  padding: "0.75rem 0",
  fontSize: "0.875rem",
  color: "var(--sl-color-gray-3)",
  borderBottom: "1px solid var(--sl-color-hairline)",
};
</script>
