<script setup lang="ts">
// Aucun import nécessaire — @forge-ui/nuxt auto-importe tout.
// useDialog, AlertDialog, Dialog, Popover, etc. sont disponibles directement.

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);

// ── Styles ────────────────────────────────────────────────────────────────────

const btn = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
} as const;

const btnGhost = { ...btn, background: "transparent", color: "#1e293b", border: "1px solid #cbd5e1" } as const;

const overlay = { position: "fixed" as const, inset: 0, background: "rgb(0 0 0 / 0.45)" };

const panel = {
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

const popoverPanel = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "1rem",
  minWidth: "220px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
};

const titleS = { margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 };
const descS = { color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.5 };
const footer = { display: "flex", justifyContent: "flex-end", gap: "0.5rem" };
const section = { padding: "1.5rem 0", borderBottom: "1px solid #e2e8f0" };
const sectionTitle = { margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600 };
const sectionDesc = { margin: "0 0 1rem", color: "#64748b", fontSize: "0.8rem" };

const btnDanger = { ...btn, background: "#dc2626" } as const;
const alertConfirming = ref(false);
function handleDeleteConfirm() {
  alertConfirming.value = true;
  // Simulate async operation.
  setTimeout(() => {
    alertConfirming.value = false;
    console.log("[AlertDialog] delete confirmed");
  }, 1200);
}
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Nuxt Playground</h1>
    <p style="color:#64748b;font-size:0.8rem;margin:0.25rem 0 0">
      Aucun import — <code>@forge-ui/nuxt</code> auto-importe tout.
    </p>

    <!-- ── Dialog ─────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Dialog</h2>
      <p :style="sectionDesc">Modal — Escape + click outside pour fermer.</p>
      <Dialog.Root>
        <Dialog.Trigger :style="btn">Ouvrir le dialog</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlay" />
          <Dialog.Content :style="panel">
            <Dialog.Title :style="titleS">Paramètres du compte</Dialog.Title>
            <Dialog.Description :style="descS">
              Modifiez votre profil. Echap ou click outside pour fermer.
            </Dialog.Description>
            <div :style="footer">
              <Dialog.Close :style="btnGhost">Annuler</Dialog.Close>
              <Dialog.Close :style="btn">Sauvegarder</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog imbriqué ────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Dialog imbriqué</h2>
      <p :style="sectionDesc">Stack registry — seule la couche supérieure capte Escape.</p>
      <Dialog.Root>
        <Dialog.Trigger :style="btn">Ouvrir dialog 1</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlay" />
          <Dialog.Content :style="panel">
            <Dialog.Title :style="titleS">Dialog 1</Dialog.Title>
            <Dialog.Description :style="descS">
              Ouvrez dialog 2 pour tester la stack.
            </Dialog.Description>
            <div :style="footer">
              <Dialog.Root>
                <Dialog.Trigger :style="btn">Ouvrir dialog 2</Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay :style="{ ...overlay, background: 'rgb(0 0 0 / 0.6)' }" />
                  <Dialog.Content :style="{ ...panel, top: '45%' }">
                    <Dialog.Title :style="titleS">Dialog 2 (top layer)</Dialog.Title>
                    <Dialog.Description :style="descS">
                      Echap ferme uniquement ce dialog. Dialog 1 reste ouvert.
                    </Dialog.Description>
                    <div :style="footer">
                      <Dialog.Close :style="btn">Fermer dialog 2</Dialog.Close>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
              <Dialog.Close :style="btnGhost">Fermer dialog 1</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

    <!-- ── Dialog contrôlé ────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Dialog contrôlé</h2>
      <p :style="sectionDesc">v-model:open — état géré à l'extérieur.</p>
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <button :style="btn" type="button" @click="controlledOpen = true">
          Ouvrir depuis l'extérieur
        </button>
        <span style="font-size:0.875rem;color:#64748b">
          État: <code>{{ controlledOpen ? 'ouvert' : 'fermé' }}</code>
        </span>
        <Dialog.Root :open="controlledOpen" :on-open-change="(o) => (controlledOpen = o)">
          <Dialog.Portal>
            <Dialog.Overlay :style="overlay" />
            <Dialog.Content :style="panel">
              <Dialog.Title :style="titleS">Dialog contrôlé</Dialog.Title>
              <Dialog.Description :style="descS">
                État géré par le parent via <code>open</code> + <code>onOpenChange</code>.
              </Dialog.Description>
              <div :style="footer">
                <Dialog.Close :style="btn">Fermer</Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </section>

    <!-- ── Hook API ───────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Hook API useDialog</h2>
      <p :style="sectionDesc">Prop-getters manuels sans composants composés.</p>
      <button v-bind="hookDialog.getTriggerProps()" :style="btn">Ouvrir (hook)</button>
      <template v-if="hookDialog.isOpen.value">
        <DialogPortal>
          <div v-bind="hookDialog.getOverlayProps()" :style="overlay" />
          <div v-bind="hookDialog.getContentProps()" :style="panel">
            <h2 v-bind="hookDialog.getTitleProps()" :style="titleS">Hook dialog</h2>
            <p v-bind="hookDialog.getDescriptionProps()" :style="descS">
              Ouvert via <code>useDialog()</code> auto-importé par Nuxt.
            </p>
            <div :style="footer">
              <button v-bind="hookDialog.getCloseProps()" :style="btn">Fermer</button>
            </div>
          </div>
        </DialogPortal>
      </template>
    </section>

    <!-- ── AlertDialog ───────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">AlertDialog</h2>
      <p :style="sectionDesc">
        Destructive confirmation — Escape et outside-click bloqués par WAI-ARIA.
        Cancel = ferme, Action = n'auto-ferme pas (caller décide).
      </p>
      <AlertDialog.Root :on-open-change="(o) => console.log('[AlertDialog] open:', o)">
        <AlertDialog.Trigger :style="btnDanger">Supprimer le compte</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay :style="overlay" />
          <AlertDialog.Content :style="panel">
            <AlertDialog.Title :style="titleS">Supprimer définitivement ?</AlertDialog.Title>
            <AlertDialog.Description :style="descS">
              Cette action est irréversible. Toutes vos données seront supprimées.
              Escape et click en dehors ne ferment pas ce dialog.
            </AlertDialog.Description>
            <div :style="footer">
              <AlertDialog.Cancel :style="btnGhost">Annuler</AlertDialog.Cancel>
              <AlertDialog.Action :style="btnDanger" @click="handleDeleteConfirm" :disabled="alertConfirming">
                {{ alertConfirming ? 'Suppression…' : 'Supprimer' }}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>

    <!-- ── Popover ────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitle">Popover</h2>
      <p :style="sectionDesc">Floating, non-modal. Ferme sur outside-click.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">bottom (défaut)</p>
          <Popover.Root>
            <Popover.Trigger :style="btn">Ouvrir popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverPanel">
                <Popover.Title :style="{ ...titleS, fontSize: '0.9rem' }">Popover</Popover.Title>
                <Popover.Description :style="descS">
                  Non-modal — outside-click et Escape ferment.
                </Popover.Description>
                <Popover.Close :style="btnGhost">×</Popover.Close>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">top</p>
          <Popover.Root :positioning="{ placement: 'top' }">
            <Popover.Trigger :style="btn">Top popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverPanel">
                <Popover.Description :style="{ ...descS, marginBottom: 0 }">
                  Positionné au-dessus du trigger.
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </section>
  </main>
</template>
