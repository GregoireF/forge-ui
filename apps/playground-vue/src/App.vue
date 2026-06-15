<script setup lang="ts">
import {
  Dialog,
  DialogPortal,
  Popover,
  useDialog,
} from "@forge-ui/vue";
import { ref } from "vue";

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);

// ── Styles ────────────────────────────────────────────────────────────────────

const btnStyle = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
} as const;

const btnGhostStyle = {
  ...btnStyle,
  background: "transparent",
  color: "#1e293b",
  border: "1px solid #cbd5e1",
} as const;

const overlayStyle = {
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
  maxWidth: "480px",
  width: "90vw",
  boxShadow: "0 24px 64px rgb(0 0 0 / 0.18)",
};

const popoverStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "1rem",
  minWidth: "220px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
};

const titleStyle = { margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 };
const descStyle = { color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.5 };
const footerStyle = { display: "flex", justifyContent: "flex-end", gap: "0.5rem" };
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Vue Playground</h1>

    <!-- ── Dialog standard ─────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">Dialog</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        Modal avec Escape + click outside pour fermer.
      </p>
      <Dialog.Root :on-open-change="(o) => console.log('[Dialog] open:', o)">
        <Dialog.Trigger :style="btnStyle">Ouvrir le dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Paramètres du compte</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Modifiez votre profil. Echap ou click outside pour fermer.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnGhostStyle">Annuler</Dialog.Close>
              <Dialog.Close :style="btnStyle">Sauvegarder</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog imbriqué ──────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">Dialog imbriqué</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        Stack registry — seule la couche supérieure capte Escape.
      </p>
      <Dialog.Root>
        <Dialog.Trigger :style="btnStyle">Ouvrir dialog 1</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Dialog 1</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Echap ferme ce dialog. Ouvrez dialog 2 pour tester la stack.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Root>
                <Dialog.Trigger :style="btnStyle">Ouvrir dialog 2</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay :style="{ ...overlayStyle, background: 'rgb(0 0 0 / 0.6)' }" />
                  <Dialog.Content :style="{ ...contentStyle, top: '45%' }">
                    <Dialog.Title :style="titleStyle">Dialog 2 (top layer)</Dialog.Title>
                    <Dialog.Description :style="descStyle">
                      Echap ferme uniquement ce dialog. Dialog 1 reste ouvert.
                    </Dialog.Description>
                    <div :style="footerStyle">
                      <Dialog.Close :style="btnStyle">Fermer dialog 2</Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <Dialog.Close :style="btnGhostStyle">Fermer dialog 1</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog contrôlé ──────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">Dialog contrôlé</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        open + onOpenChange — état géré à l'extérieur.
      </p>
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <button :style="btnStyle" type="button" @click="controlledOpen = true">
          Ouvrir depuis l'extérieur
        </button>
        <span style="font-size:0.875rem;color:#64748b">
          État: <code>{{ controlledOpen ? 'ouvert' : 'fermé' }}</code>
        </span>
        <Dialog.Root :open="controlledOpen" :on-open-change="(o) => (controlledOpen = o)">
          <Dialog.Portal>
            <Dialog.Overlay :style="overlayStyle" />
            <Dialog.Content :style="contentStyle">
              <Dialog.Title :style="titleStyle">Dialog contrôlé</Dialog.Title>
              <Dialog.Description :style="descStyle">
                L'état est géré par le composant parent via <code>open</code> + <code>onOpenChange</code>.
              </Dialog.Description>
              <div :style="footerStyle">
                <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>

    <!-- ── Hook API ──────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">Hook API useDialog</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        Prop-getters manuels sans composants.
      </p>
      <button v-bind="hookDialog.getTriggerProps()" :style="btnStyle">Ouvrir (hook)</button>
      <template v-if="hookDialog.isOpen.value">
        <DialogPortal>
          <div v-bind="hookDialog.getOverlayProps()" :style="overlayStyle" />
          <div v-bind="hookDialog.getContentProps()" :style="contentStyle">
            <h2 v-bind="hookDialog.getTitleProps()" :style="titleStyle">Hook dialog</h2>
            <p v-bind="hookDialog.getDescriptionProps()" :style="descStyle">
              Ouvert via <code>useDialog()</code> — prop-getters étalés manuellement.
            </p>
            <div :style="footerStyle">
              <button v-bind="hookDialog.getCloseProps()" :style="btnStyle">Fermer</button>
            </div>
          </div>
        </DialogPortal>
      </template>
    </section>

    <!-- ── Popover ────────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">Popover</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        Floating, non-modal. Ferme sur outside-click.
      </p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Placement: bottom (défaut)</p>
          <Popover.Root>
            <Popover.Trigger :style="btnStyle">Ouvrir popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverStyle">
                <Popover.Title :style="{ ...titleStyle, fontSize: '0.9rem' }">Popover title</Popover.Title>
                <Popover.Description :style="descStyle">
                  Non-modal — Echap et outside-click ferment.
                </Popover.Description>
                <Popover.Close :style="btnGhostStyle">×</Popover.Close>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Placement: top</p>
          <Popover.Root :positioning="{ placement: 'top' }">
            <Popover.Trigger :style="btnStyle">Top popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverStyle">
                <Popover.Description :style="{ ...descStyle, marginBottom: 0 }">
                  Positionné au-dessus du trigger.
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </section>

    <!-- ── asChild ────────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">asChild</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">
        Forge merge les props sur votre élément, sans wrapper.
      </p>
      <Dialog.Root>
        <Dialog.Trigger :asChild="true">
          <a href="#" :style="{ ...btnStyle, display: 'inline-block', textDecoration: 'none' }">
            Ouvrir via &lt;a&gt; (asChild)
          </a>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">asChild demo</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Le trigger est un <code>&lt;a&gt;</code> — forge a mergé ses props sans wrapper button.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  </main>
</template>
