<template>
  <div class="forge-demo" style="display: block; padding: 1.5rem">
    <AccordionRoot
      type="single"
      :collapsible="true"
      style="width: 100%; max-width: 480px; margin: 0 auto"
    >
      <AccordionItem value="what">
        <AccordionHeader>
          <AccordionTrigger>
            What is forge-ui?
            <span aria-hidden="true">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          forge-ui is a headless component library built on a machine → connect → framework
          architecture, giving you complete styling freedom.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="why">
        <AccordionHeader>
          <AccordionTrigger>
            Why headless?
            <span aria-hidden="true">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
          Headless components handle behavior and accessibility while you own the styles. No CSS
          overrides, no specificity wars.
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="how">
        <AccordionHeader>
          <AccordionTrigger>
            How does the CSS contract work?
            <span aria-hidden="true">▾</span>
          </AccordionTrigger>
        </AccordionHeader>
        <AccordionContent>
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
</script>
