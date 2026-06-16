<script setup lang="ts">
import {
  AlertDialog,
  Dialog,
  DialogPortal,
  Popover,
  Select,
  useDialog,
} from "@forge-ui/vue";
import { ref } from "vue";

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);
const selectedValue = ref<string[]>([]);
const selectedMultiple = ref<string[]>([]);

const alertConfirming = ref(false);
function handleAlertConfirm() {
  alertConfirming.value = true;
  setTimeout(() => {
    alertConfirming.value = false;
    console.log("[AlertDialog] confirmed");
  }, 1200);
}

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

const btnDangerStyle = { ...btnStyle, background: "#dc2626" } as const;

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
const sectionStyle = { padding: "1.5rem 0", borderBottom: "1px solid #e2e8f0" };
const sectionTitleStyle = { margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600 };
const sectionDescStyle = { margin: "0 0 1rem", color: "#64748b", fontSize: "0.8rem" };

const labelStyle = { display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" };
const selectTriggerStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.5rem 0.75rem",
  minWidth: "200px",
  background: "#fff",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
} as const;
const selectContentStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none",
  margin: 0,
} as const;
const selectItemStyle = { padding: "0.45rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", color: "#1e293b" };
const separatorStyle = { height: "1px", background: "#e2e8f0", margin: "0.25rem 0", listStyle: "none" as const };
const groupLabelStyle = { padding: "0.35rem 0.75rem 0.15rem", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em", listStyle: "none" as const };
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Vue Playground</h1>

    <!-- ── Dialog standard ─────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog</h2>
      <p :style="sectionDescStyle">Modal avec Escape + click outside pour fermer.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog imbriqué</h2>
      <p :style="sectionDescStyle">Stack registry — seule la couche supérieure capte Escape.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Dialog contrôlé</h2>
      <p :style="sectionDescStyle">open + onOpenChange — état géré à l'extérieur.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Hook API useDialog</h2>
      <p :style="sectionDescStyle">Prop-getters manuels sans composants composés.</p>
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

    <!-- ── AlertDialog ───────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">AlertDialog</h2>
      <p :style="sectionDescStyle">
        Confirmation destructive — Escape et outside-click bloqués par WAI-ARIA.
      </p>
      <AlertDialog.Root :on-open-change="(o) => console.log('[AlertDialog] open:', o)">
        <AlertDialog.Trigger :style="btnDangerStyle">Supprimer le compte</AlertDialog.Trigger>
        <AlertDialog.Portal>
          <AlertDialog.Overlay :style="overlayStyle" />
          <AlertDialog.Content :style="contentStyle">
            <AlertDialog.Title :style="titleStyle">Supprimer définitivement ?</AlertDialog.Title>
            <AlertDialog.Description :style="descStyle">
              Cette action est irréversible. Escape et click en dehors ne ferment <strong>pas</strong> ce dialog.
            </AlertDialog.Description>
            <div :style="footerStyle">
              <AlertDialog.Cancel :style="btnGhostStyle">Annuler</AlertDialog.Cancel>
              <AlertDialog.Action
                :style="btnDangerStyle"
                @click="handleAlertConfirm"
                :disabled="alertConfirming"
              >
                {{ alertConfirming ? 'Suppression…' : 'Supprimer' }}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </section>

    <!-- ── Popover ────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Popover</h2>
      <p :style="sectionDescStyle">Floating, non-modal. Ferme sur outside-click.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Placement: bottom (défaut)</p>
          <Popover.Root>
            <Popover.Trigger :style="btnStyle">Ouvrir popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="popoverStyle">
                <Popover.Title :style="{ ...titleStyle, fontSize: '0.9rem' }">Popover title</Popover.Title>
                <Popover.Description :style="descStyle">
                  Non-modal — outside-click et Escape ferment.
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

    <!-- ── Select ─────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Select</h2>
      <p :style="sectionDescStyle">WAI-ARIA 1.2 Select-Only Combobox. Keyboard + typeahead.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Select simple</p>
          <Select.Root :on-value-change="(v) => selectedValue = v">
            <Select.Label :style="labelStyle">Framework</Select.Label>
            <Select.Trigger :style="selectTriggerStyle">
              <Select.Value placeholder="Choisir un framework…" />
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContentStyle">
                <Select.Item value="react" :style="selectItemStyle">React</Select.Item>
                <Select.Item value="vue" :style="selectItemStyle">Vue</Select.Item>
                <Select.Item value="angular" :style="selectItemStyle">Angular</Select.Item>
                <Select.Separator :style="separatorStyle" />
                <Select.Item value="svelte" :style="selectItemStyle">Svelte</Select.Item>
                <Select.Item value="solid" :style="selectItemStyle">Solid</Select.Item>
                <Select.Item value="qwik" :disabled="true" :style="{ ...selectItemStyle, opacity: 0.4 }">Qwik (désactivé)</Select.Item>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
          <p v-if="selectedValue.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
            Valeur: <code>{{ selectedValue[0] }}</code>
          </p>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec groupes</p>
          <Select.Root>
            <Select.Label :style="labelStyle">Langage</Select.Label>
            <Select.Trigger :style="selectTriggerStyle">
              <Select.Value placeholder="Choisir…" />
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContentStyle">
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelStyle">Frontend</Select.GroupLabel>
                  <Select.Item value="ts" :style="selectItemStyle">TypeScript</Select.Item>
                  <Select.Item value="js" :style="selectItemStyle">JavaScript</Select.Item>
                </Select.Group>
                <Select.Separator :style="separatorStyle" />
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelStyle">Backend</Select.GroupLabel>
                  <Select.Item value="go" :style="selectItemStyle">Go</Select.Item>
                  <Select.Item value="rust" :style="selectItemStyle">Rust</Select.Item>
                  <Select.Item value="python" :style="selectItemStyle">Python</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    </section>

    <!-- ── Select multiple ────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Select multiple</h2>
      <p :style="sectionDescStyle">Multi-sélection — reste ouvert après chaque choix.</p>
      <Select.Root :multiple="true" :on-value-change="(v) => selectedMultiple = v">
        <Select.Label :style="labelStyle">Intérêts</Select.Label>
        <Select.Trigger :style="selectTriggerStyle">
          <Select.Value placeholder="Sélectionner plusieurs…" />
          <span style="margin-left:auto;opacity:0.5">▾</span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content :style="selectContentStyle">
            <Select.Item value="design" :style="selectItemStyle">Design</Select.Item>
            <Select.Item value="dev" :style="selectItemStyle">Développement</Select.Item>
            <Select.Item value="ux" :style="selectItemStyle">UX Research</Select.Item>
            <Select.Item value="perf" :style="selectItemStyle">Performance</Select.Item>
            <Select.Item value="a11y" :style="selectItemStyle">Accessibilité</Select.Item>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <p v-if="selectedMultiple.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ selectedMultiple.join(', ') }}</code>
      </p>
    </section>

    <!-- ── asChild ────────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitleStyle">asChild</h2>
      <p :style="sectionDescStyle">Forge merge les props sur votre élément, sans wrapper.</p>
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
