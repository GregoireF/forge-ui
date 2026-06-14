<script setup lang="ts">
import { Dialog, DialogPortal, useDialog } from "@forge-ui/vue";

// Hook API instance
const dialog = useDialog({
  onOpen: () => console.log("[forge-ui] hook dialog opened"),
  onClose: () => console.log("[forge-ui] hook dialog closed"),
});

const btnStyle = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
} as const;

const backdropStyle = {
  position: "fixed" as const,
  inset: 0,
  background: "rgb(0 0 0 / 0.45)",
};

const contentStyle = {
  position: "fixed" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "1.75rem",
  minWidth: "340px",
  boxShadow: "0 24px 64px rgb(0 0 0 / 0.18)",
};

const descStyle = {
  color: "#64748b",
  marginBottom: "1.5rem",
  fontSize: "0.9rem",
};
</script>

<template>
  <main style="display: flex; flex-direction: column; gap: 3rem; padding: 2rem">
    <h1 style="margin: 0">forge-ui — Vue Playground</h1>

    <!-- ── Compound API (primary — E2E tests target this section) ──────────── -->
    <section>
      <h2 style="margin-bottom: 0.25rem">Compound API <code>Dialog.*</code></h2>
      <p style="color: #64748b; margin-bottom: 1rem; font-size: 0.875rem">
        Radix-style components. Supports <code>asChild</code>, <code>forceMount</code>, and portal.
      </p>

      <Dialog.Root>
        <Dialog.Trigger :style="btnStyle">Open dialog</Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay :style="backdropStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title style="margin-bottom: 0.5rem">Compound dialog</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Opened via <code>&lt;Dialog.Root&gt;</code>. Context is shared automatically.
            </Dialog.Description>
            <div style="display: flex; justify-content: flex-end">
              <Dialog.Close :style="btnStyle">Close</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <hr style="border: none; border-top: 1px solid #e2e8f0" />

    <!-- ── Hook API ───────────────────────────────────────────────────────── -->
    <section>
      <h2 style="margin-bottom: 0.25rem">Hook API <code>useDialog</code></h2>
      <p style="color: #64748b; margin-bottom: 1rem; font-size: 0.875rem">
        Full control — spread props manually onto any element.
      </p>

      <button v-bind="dialog.getTriggerProps()" :style="btnStyle">Open (hook)</button>

      <template v-if="dialog.isOpen.value">
        <DialogPortal>
          <div v-bind="dialog.getBackdropProps()" :style="backdropStyle" />
          <div v-bind="dialog.getContentProps()" :style="contentStyle">
            <h2 v-bind="dialog.getTitleProps()" style="margin-bottom: 0.5rem">Hook dialog</h2>
            <p v-bind="dialog.getDescriptionProps()" :style="descStyle">
              Opened via <code>useDialog()</code>. Every aria and data attribute is provided by forge.
            </p>
            <div style="display: flex; justify-content: flex-end">
              <button v-bind="dialog.getCloseProps()" :style="btnStyle">Close</button>
            </div>
          </div>
        </DialogPortal>
      </template>
    </section>

    <hr style="border: none; border-top: 1px solid #e2e8f0" />

    <!-- ── asChild demo ───────────────────────────────────────────────────── -->
    <section>
      <h2 style="margin-bottom: 0.25rem">asChild demo</h2>
      <p style="color: #64748b; margin-bottom: 1rem; font-size: 0.875rem">
        Forge merges aria/data props onto your element — no wrapper button.
      </p>

      <Dialog.Root>
        <Dialog.Trigger :asChild="true">
          <a href="#" :style="{ ...btnStyle, display: 'inline-block', textDecoration: 'none' }">
            Open via &lt;a&gt; (asChild)
          </a>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay :style="backdropStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title style="margin-bottom: 0.5rem">asChild dialog</Dialog.Title>
            <Dialog.Description :style="descStyle">
              The trigger is an <code>&lt;a&gt;</code> tag — forge merged its props onto it with no
              wrapper button.
            </Dialog.Description>
            <div style="display: flex; justify-content: flex-end">
              <Dialog.Close :asChild="true">
                <a href="#" :style="{ ...btnStyle, display: 'inline-block', textDecoration: 'none' }">
                  Close via &lt;a&gt;
                </a>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  </main>
</template>
