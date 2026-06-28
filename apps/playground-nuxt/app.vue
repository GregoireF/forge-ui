<script setup lang="ts">
// Namespace objects (dot-notation API) need an explicit import even with @forge-ui/nuxt.
// The Vue template compiler resolves <Accordion.Root> by looking up `Accordion` in the
// script scope. Nuxt's addImports works for composables but for plain objects used as
// component namespaces, a direct import is the reliable approach across all SSR modes.
// Flat API (<AccordionRoot>, <AccordionItem>, etc.) needs NO import at all.
import {
  Accordion,
  AlertDialog,
  Avatar,
  Collapsible,
  Combobox,
  ContextMenu,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  Field,
  HoverCard,
  Menu,
  NumberInput,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Slider,
  Tabs,
  TagsInput,
  TimePicker,
  useDialog,
} from "@forge-ui/vue";

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);
const selectedValue = ref<string[]>([]);
const selectedMultiple = ref<string[]>([]);
const dateFieldValue = ref<{ year: number; month: number; day: number } | null>(null);
const timePickerValue = ref<{ hours: number; minutes: number; seconds: number } | null>(null);
const datePickerSelected = ref<string | null>(null);
const dateRangePickerRange = ref<string | null>(null);

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

const labelS = { display: "block", fontSize: "0.8rem", fontWeight: 500, color: "#374151", marginBottom: "0.35rem" };
const selectTrigger = {
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
const selectContent = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none",
  margin: 0,
} as const;
const selectItem = { padding: "0.45rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", color: "#1e293b" };
const separatorS = { height: "1px", background: "#e2e8f0", margin: "0.25rem 0", listStyle: "none" as const };
const groupLabelS = { padding: "0.35rem 0.75rem 0.15rem", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em", listStyle: "none" as const };

const titleS = { margin: "0 0 0.5rem", fontSize: "1.05rem", fontWeight: 600 };
const descS = { color: "#64748b", marginBottom: "1.5rem", fontSize: "0.875rem", lineHeight: 1.5 };
const footer = { display: "flex", justifyContent: "flex-end", gap: "0.5rem" };
const section = { padding: "1.5rem 0", borderBottom: "1px solid #e2e8f0" };
const sectionTitle = { margin: "0 0 0.25rem", fontSize: "1rem", fontWeight: 600 };
const sectionDesc = { margin: "0 0 1rem", color: "#64748b", fontSize: "0.8rem" };

const checkboxControl = { width: "18px", height: "18px", border: "2px solid #cbd5e1", borderRadius: "4px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 };
const checkboxIndicator = { fontSize: "11px", fontWeight: 700, color: "#1e293b", lineHeight: 1 };
const checkboxLabel = { fontSize: "0.875rem", color: "#1e293b", cursor: "pointer" };
const switchOff = { width: "44px", height: "24px", borderRadius: "12px", background: "#cbd5e1", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", transition: "background 0.15s", flexShrink: 0 };
const switchOn = { ...switchOff, background: "#1e293b" };
const thumbOff = { width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 0.2)", transform: "translateX(0)", transition: "transform 0.15s" };
const thumbOn = { ...thumbOff, transform: "translateX(20px)" };

const checkboxControlled = ref<boolean | "indeterminate">("indeterminate");
const groupValues = ref<string[]>(["react"]);
const switchChecked = ref(false);

const tooltipS = { background: "#1e293b", color: "#f1f5f9", borderRadius: "6px", padding: "0.35rem 0.6rem", fontSize: "0.8rem", boxShadow: "0 4px 12px rgb(0 0 0 / 0.2)", maxWidth: "240px" } as const;
const btnDanger = { ...btn, background: "#dc2626" } as const;

const comboboxContent = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.25rem", boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)", listStyle: "none" as const, margin: 0, maxHeight: "200px", overflowY: "auto" as const };
const comboboxItem = { padding: "0.45rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.25rem" };
const groupLabel = { padding: "0.35rem 0.75rem 0.15rem", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: "0.05em", listStyle: "none" as const };
const hoverCardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", minWidth: "260px", maxWidth: "320px", boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)" } as const;
const hoverCardLink = { color: "#6366f1", fontWeight: 500, fontSize: "0.9rem", textDecoration: "underline" as const, cursor: "pointer" } as const;

const fieldInvalid = ref(false);
const fieldEmail = ref("");

const languages = [
  { value: "ts", label: "TypeScript" },
  { value: "js", label: "JavaScript" },
  { value: "py", label: "Python" },
  { value: "rs", label: "Rust" },
  { value: "go", label: "Go" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "cs", label: "C#" },
];
const cbSelected = ref<string[]>([]);
const tagsInputTags = ref<string[]>(["TypeScript", "Nuxt"]);
const progressValue = ref(42);
const sliderValue = ref(50);
const numberInputValue = ref<number | null>(50);
const radioGroupValue = ref<string>("react");
const alertConfirming = ref(false);
function handleDeleteConfirm() {
  alertConfirming.value = true;
  // Simulate async operation.
  setTimeout(() => {
    alertConfirming.value = false;
    console.log("[AlertDialog] delete confirmed");
  }, 1200);
}

// ── Menu ─────────────────────────────────────────────────────────────────────
const menuLastSelect = ref<string | null>(null);
const menuTheme = ref("system");
const menuShowGrid = ref(false);
const menuShowRuler = ref(true);
const ctxMenuSelect = ref<string | null>(null);
const ctxMenuBookmarked = ref(false);
const menuAnchorOpen = ref(false);
const menuAnchorSelect = ref<string | null>(null);

const menuContentS = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "4px", boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)", minWidth: "160px", outline: "none" } as const;
const menuItemS = { padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "0.875rem", outline: "none", userSelect: "none" as const };
const menuGroupS = { padding: "4px 12px 2px", fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const menuSepS = { height: "1px", background: "#e2e8f0", margin: "4px 0" };
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Nuxt Playground</h1>
    <p style="color:#64748b;font-size:0.8rem;margin:0.25rem 0 0">
      Flat API : zéro import (<code>CheckboxRoot</code>, etc.) — Namespace API : un import suffit (<code>import { Dialog } from '@forge-ui/vue'</code>).
    </p>

    <!-- ── Animations CSS (data-state) ──────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Animations CSS (data-state)</h2>
      <p :style="sectionDesc">Transitions d'entrée/sortie CSS-only via data-state. Aucune librairie externe.</p>
      <!-- Le CSS data-state fait le travail — watchPresence maintient le composant monté jusqu'à animationend -->
      <Dialog.Root :on-open-change="(o) => console.log('[AnimatedDialog] open:', o)">
        <Dialog.Trigger :style="btn">Dialog avec animation</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlay" />
          <Dialog.Content :style="panel">
            <Dialog.Title :style="titleS">Dialog animé</Dialog.Title>
            <Dialog.Description :style="descS">
              Le CSS <code>data-state</code> fait le travail — aucune prop <code>forceMount</code> nécessaire.
              <code>watchPresence</code> maintient le composant monté jusqu'à <code>animationend</code>.
            </Dialog.Description>
            <div :style="footer">
              <Dialog.Close :style="btnGhost">Annuler</Dialog.Close>
              <Dialog.Close :style="btn">Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

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

    <!-- ── Select ───────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Select</h2>
      <p :style="sectionDesc">WAI-ARIA 1.2 Select-Only Combobox. Keyboard + typeahead.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Select simple</p>
          <Select.Root :on-value-change="(v) => selectedValue = v">
            <Select.Label :style="labelS">Framework</Select.Label>
            <Select.Trigger :style="selectTrigger">
              <!-- SelectPlaceholder : visible seulement quand aucune valeur n'est sélectionnée -->
              <Select.Value>
                <select-placeholder style="color:#94a3b8">Choisir un framework…</select-placeholder>
              </Select.Value>
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContent">
                <Select.Item value="react" :style="selectItem">React</Select.Item>
                <Select.Item value="vue" :style="selectItem">Vue</Select.Item>
                <Select.Item value="angular" :style="selectItem">Angular</Select.Item>
                <Select.Separator :style="separatorS" />
                <Select.Item value="svelte" :style="selectItem">Svelte</Select.Item>
                <Select.Item value="solid" :style="selectItem">Solid</Select.Item>
                <Select.Item value="qwik" :disabled="true" :style="{ ...selectItem, opacity: 0.4 }">Qwik (désactivé)</Select.Item>
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
            <Select.Label :style="labelS">Langage</Select.Label>
            <Select.Trigger :style="selectTrigger">
              <Select.Value placeholder="Choisir…" />
              <span style="margin-left:auto;opacity:0.5">▾</span>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content :style="selectContent">
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelS">Frontend</Select.GroupLabel>
                  <Select.Item value="ts" :style="selectItem">TypeScript</Select.Item>
                  <Select.Item value="js" :style="selectItem">JavaScript</Select.Item>
                </Select.Group>
                <Select.Separator :style="separatorS" />
                <Select.Group>
                  <Select.GroupLabel :style="groupLabelS">Backend</Select.GroupLabel>
                  <Select.Item value="go" :style="selectItem">Go</Select.Item>
                  <Select.Item value="rust" :style="selectItem">Rust</Select.Item>
                  <Select.Item value="python" :style="selectItem">Python</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      </div>
    </section>

    <!-- ── Select multiple ───────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Select multiple</h2>
      <p :style="sectionDesc">Multi-sélection — reste ouvert après chaque choix.</p>
      <Select.Root :multiple="true" :on-value-change="(v) => selectedMultiple = v">
        <Select.Label :style="labelS">Intérêts</Select.Label>
        <Select.Trigger :style="selectTrigger">
          <Select.Value placeholder="Sélectionner plusieurs…" />
          <span style="margin-left:auto;opacity:0.5">▾</span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content :style="selectContent">
            <Select.Item value="design" :style="selectItem">Design</Select.Item>
            <Select.Item value="dev" :style="selectItem">Développement</Select.Item>
            <Select.Item value="ux" :style="selectItem">UX Research</Select.Item>
            <Select.Item value="perf" :style="selectItem">Performance</Select.Item>
            <Select.Item value="a11y" :style="selectItem">Accessibilité</Select.Item>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <p v-if="selectedMultiple.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ selectedMultiple.join(', ') }}</code>
      </p>
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

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec Popover.Arrow</p>
          <Popover.Root>
            <Popover.Trigger :style="btn">Arrow popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="{ ...popoverPanel, position: 'relative' }">
                <Popover.Arrow>
                  <svg
                    width="12"
                    height="6"
                    viewBox="0 0 12 6"
                    style="position:absolute;top:-6px"
                    aria-hidden="true"
                  >
                    <path d="M0,6 L6,0 L12,6 Z" fill="#fff" stroke="#e2e8f0" stroke-width="1" stroke-linejoin="round" />
                  </svg>
                </Popover.Arrow>
                <Popover.Description :style="{ ...descS, marginBottom: 0 }">
                  Flèche centrée par Floating UI. <code>data-side</code> pour rotation CSS.
                </Popover.Description>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
      </div>
    </section>

    <!-- ── Checkbox ──────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Checkbox</h2>
      <p :style="sectionDesc">Tri-state. Indicateur + Label associé. Auto-import Nuxt.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <CheckboxRoot :default-checked="true">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControl">
              <CheckboxIndicator :style="checkboxIndicator">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabel">Accepter les CGU (uncontrolled)</CheckboxLabel>
          </div>
        </CheckboxRoot>
        <CheckboxRoot :checked="checkboxControlled" :on-checked-change="(v) => checkboxControlled = v">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControl">
              <CheckboxIndicator :style="checkboxIndicator">
                {{ checkboxControlled === 'indeterminate' ? '—' : '✓' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabel">
              Controlled — <code>{{ String(checkboxControlled) }}</code>
            </CheckboxLabel>
          </div>
        </CheckboxRoot>
      </div>
    </section>

    <!-- ── Checkbox.Group ─────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Checkbox.Group + GroupAll</h2>
      <p :style="sectionDesc">Select-all automatique. GroupAll dérive indeterminate natif.</p>
      <CheckboxGroup v-model:value="groupValues">
        <CheckboxGroupAll>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
            <CheckboxControl :style="{ ...checkboxControl, background: '#f1f5f9' }">
              <CheckboxIndicator :style="checkboxIndicator">
                {{ groupValues.length === 3 ? '✓' : '—' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="{ ...checkboxLabel, fontWeight: 600 }">Tout sélectionner</CheckboxLabel>
          </div>
        </CheckboxGroupAll>
        <CheckboxRoot v-for="item in [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }]" :key="item.value" :value="item.value">
          <div style="display:flex;align-items:center;gap:0.5rem;padding-left:1.25rem">
            <CheckboxControl :style="checkboxControl">
              <CheckboxIndicator :style="checkboxIndicator">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabel">{{ item.label }}</CheckboxLabel>
          </div>
        </CheckboxRoot>
      </CheckboxGroup>
      <p style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ groupValues.join(', ') || 'aucun' }}</code>
      </p>
    </section>

    <!-- ── Switch ────────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Switch</h2>
      <p :style="sectionDesc">Toggle binaire. role=switch. Auto-import Nuxt.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <SwitchRoot :checked="switchChecked" :on-checked-change="(v) => switchChecked = v">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="switchChecked ? switchOn : switchOff">
              <SwitchThumb :style="switchChecked ? thumbOn : thumbOff" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabel">
              Notifications — <code>{{ switchChecked ? 'activées' : 'désactivées' }}</code>
            </SwitchLabel>
          </div>
        </SwitchRoot>

        <SwitchRoot :default-checked="true" :disabled="true">
          <div style="display:flex;align-items:center;gap:0.75rem;opacity:0.4">
            <SwitchControl :style="switchOn">
              <SwitchThumb :style="thumbOn" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabel">Désactivé (on)</SwitchLabel>
          </div>
        </SwitchRoot>

        <SwitchRoot :invalid="true">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="{ ...switchOff, borderColor: '#dc2626', outline: '1px solid #dc2626' }">
              <SwitchThumb :style="thumbOff" />
            </SwitchControl>
            <SwitchLabel style="font-size:0.875rem;color:#dc2626;cursor:pointer">
              État invalide (data-invalid + aria-invalid)
            </SwitchLabel>
          </div>
        </SwitchRoot>
      </div>
    </section>

    <!-- ── Tooltip ───────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitle">Tooltip</h2>
      <p :style="sectionDesc">Survol/focus. Provider skip-delay SSR-safe. Auto-import Nuxt.</p>
      <TooltipProvider :open-delay="400" :close-delay="200" :skip-delay="300">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
          <TooltipRoot>
            <TooltipTrigger :style="btn">Survol (400ms)</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">Ouvre après 400ms — délai Provider</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btn">Skip-delay</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">Instantané si un tooltip vient de fermer</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :interactive="true">
            <TooltipTrigger :style="btn">Interactive</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="{ ...tooltipS, padding: '0.5rem 0.75rem' }">
                <p style="margin:0 0 0.25rem;font-size:0.8rem">Cliquez le lien ↓</p>
                <a href="#" style="color:#38bdf8;font-size:0.8rem">Lien dans le tooltip</a>
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :disabled="true">
            <TooltipTrigger :style="{ ...btn, opacity: 0.5 }" :disabled="true">Désactivé</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">Ne s'affiche pas</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :positioning="{ placement: 'bottom' }">
            <TooltipTrigger :style="btnGhost">Placement bas</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">placement="bottom"</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btnGhost">Anchor demo</TooltipTrigger>
            <TooltipAnchor>
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-left:0.5rem;vertical-align:middle" />
            </TooltipAnchor>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">Positionné sur le point orange ↑</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </div>
      </TooltipProvider>
    </section>

    <!-- ── Field ────────────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Field</h2>
      <p :style="sectionDesc">Champ accessible — aucun import requis, auto-importé par @forge-ui/nuxt.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <Field.Root id="nuxt-field-email" :invalid="fieldInvalid" :required="true">
          <Field.Label :style="labelS">
            Email <FieldRequiredIndicator style="color:#dc2626;margin-left:0.15rem" />
          </Field.Label>
          <Field.Control>
            <input
              v-model="fieldEmail"
              type="email"
              placeholder="vous@exemple.fr"
              style="padding:0.5rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:220px"
              @blur="fieldInvalid = fieldEmail.length > 0 && !fieldEmail.includes('@')"
            />
          </Field.Control>
          <Field.Description style="font-size:0.75rem;color:#64748b">Entrez votre adresse e-mail.</Field.Description>
          <Field.Error style="font-size:0.75rem;color:#dc2626">Adresse e-mail invalide.</Field.Error>
        </Field.Root>

        <FieldGroup data-testid="field-group" style="display:flex;flex-direction:column;gap:0.5rem">
          <FieldGroupLabel :style="labelS">Notifications</FieldGroupLabel>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="nuxt-notif-email" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par email</Field.Label>
            </div>
          </Field.Root>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="nuxt-notif-sms" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par SMS</Field.Label>
            </div>
          </Field.Root>
        </FieldGroup>

      </div>
    </section>

    <!-- ── Combobox ──────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Combobox</h2>
      <p :style="sectionDesc">WAI-ARIA 1.2 — auto-importé par @forge-ui/nuxt.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Single-select</p>
          <Combobox.Root :on-value-change="(v) => cbSelected = v">
            <Combobox.Label :style="labelS">Langage préféré</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhost">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhost">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContent">
                <Combobox.Item v-for="l in languages" :key="l.value" :value="l.value" :label="l.label" :style="comboboxItem">
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
          <p v-if="cbSelected.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">Sélectionné : {{ cbSelected.join(', ') }}</p>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Multi-select</p>
          <Combobox.Root :multiple="true">
            <Combobox.Label :style="labelS">Langages maîtrisés</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhost">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContent">
                <Combobox.Item v-for="l in languages" :key="l.value" :value="l.value" :label="l.label" :style="comboboxItem">
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec groupes</p>
          <Combobox.Root>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhost">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContent">
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabel">Frontend</Combobox.GroupLabel>
                  <Combobox.Item value="ts" label="TypeScript" :style="comboboxItem"><Combobox.ItemText>TypeScript</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="js" label="JavaScript" :style="comboboxItem"><Combobox.ItemText>JavaScript</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabel">Backend</Combobox.GroupLabel>
                  <Combobox.Item value="py" label="Python" :style="comboboxItem"><Combobox.ItemText>Python</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="rs" label="Rust" :style="comboboxItem"><Combobox.ItemText>Rust</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="go" label="Go" :style="comboboxItem"><Combobox.ItemText>Go</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Creatable — crée une option absente</p>
          <Combobox.Root :on-create-option="(v) => console.log('Créer:', v)">
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhost">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhost">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContent">
                <Combobox.Item v-for="l in languages" :key="l.value" :value="l.value" :label="l.label" :style="comboboxItem">
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
                <Combobox.CreateOption :style="{ ...comboboxItem, fontStyle: 'italic', color: '#6366f1' }" />
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>
    </section>

    <!-- ── HoverCard ─────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">HoverCard</h2>
      <p :style="sectionDesc">Aperçu au survol. openDelay=700ms, closeDelay=300ms. Contenu interactif possible.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <HoverCard.Root>
          <HoverCard.Trigger :asChild="true">
            <a :style="hoverCardLink" href="#" @click.prevent>@forge-ui</a>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content :style="hoverCardStyle">
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
                <div style="width:40px;height:40px;border-radius:50%;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.1rem">F</div>
                <div>
                  <p style="margin:0;font-weight:600;color:#1e293b">forge-ui</p>
                  <p style="margin:0;font-size:0.8rem;color:#64748b">@forge-ui</p>
                </div>
              </div>
              <p style="margin:0 0 0.75rem;font-size:0.85rem;color:#374151">
                Primitives UI headless — accessibles, légers, sans style imposé.
              </p>
              <div style="display:flex;gap:1rem;font-size:0.8rem;color:#64748b">
                <span><strong style="color:#1e293b">142</strong> Following</span>
                <span><strong style="color:#1e293b">2.4k</strong> Followers</span>
              </div>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>

        <HoverCard.Root :positioning="{ placement: 'bottom' }">
          <HoverCard.Trigger :asChild="true">
            <a :style="hoverCardLink" href="#" @click.prevent>Placement bottom</a>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content :style="hoverCardStyle">
              <p style="margin:0;font-size:0.85rem;color:#374151">
                HoverCard positionné en dessous. Survolez le contenu pour maintenir l'ouverture.
              </p>
            </HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </div>
    </section>

    <!-- ── TagsInput ─────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">TagsInput</h2>
      <p :style="sectionDesc">Saisie libre de tags. Enter=ajouter, Backspace=supprimer dernier.</p>
      <TagsInput.Root
        :value="tagsInputTags"
        :on-value-change="(v) => tagsInputTags = v"
        style="border:1px solid #cbd5e1;border-radius:8px;padding:0.375rem 0.5rem;display:flex;flex-wrap:wrap;gap:0.375rem;align-items:center;background:#fff;cursor:text;min-width:280px"
      >
        <TagsInput.Tag
          v-for="tag in tagsInputTags"
          :key="tag"
          :value="tag"
          style="display:flex;align-items:center;gap:0.25rem;background:#e2e8f0;border-radius:4px;padding:0.15rem 0.375rem 0.15rem 0.5rem;font-size:0.875rem;color:#1e293b"
        >
          {{ tag }}
          <TagsInput.TagDelete
            :value="tag"
            style="border:none;background:none;cursor:pointer;color:#64748b;padding:0 0.1rem;line-height:1;font-size:1rem"
          />
        </TagsInput.Tag>
        <TagsInput.Input
          style="border:none;outline:none;font-size:0.875rem;min-width:120px;flex:1;background:transparent;padding:0.15rem 0"
          placeholder="Ajouter un tag…"
        />
      </TagsInput.Root>
      <p v-if="tagsInputTags.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Tags : {{ tagsInputTags.join(', ') }}
      </p>
    </section>

    <!-- ── Accordion ─────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Accordion</h2>
      <p :style="sectionDesc">Panneau accordéon — single, multiple, ou collapsible.</p>
      <div style="width:100%;max-width:400px">
        <Accordion.Root type="single" :collapsible="true" :default-value="[]">
          <Accordion.Item value="what">
            <Accordion.Header>
              <Accordion.Trigger data-testid="accordion-trigger-what" style="width:100%;display:flex;justify-content:space-between;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500">
                Qu'est-ce que forge-ui ? <span aria-hidden="true">▾</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content data-testid="accordion-content-what" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
              Une bibliothèque de composants UI headless avec architecture 3 niveaux.
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item value="why" style="margin-top:0.5rem">
            <Accordion.Header>
              <Accordion.Trigger data-testid="accordion-trigger-why" style="width:100%;display:flex;justify-content:space-between;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500">
                Pourquoi headless ? <span aria-hidden="true">▾</span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content data-testid="accordion-content-why" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
              Vous gardez le contrôle total du CSS — aucun style imposé.
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    </section>

    <!-- ── Collapsible ───────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Collapsible</h2>
      <p :style="sectionDesc">Toggle simple — un contenu masqué/révélé.</p>
      <Collapsible.Root style="width:100%;max-width:400px">
        <Collapsible.Trigger data-testid="collapsible-trigger" style="width:100%;padding:0.75rem 1rem;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:0.875rem;font-weight:500;text-align:left;display:flex;justify-content:space-between">
          Voir les détails <span aria-hidden="true">▾</span>
        </Collapsible.Trigger>
        <Collapsible.Content data-testid="collapsible-content" style="padding:0.75rem 1rem;border:1px solid #e2e8f0;border-top:none;font-size:0.875rem;color:#374151">
          Contenu masqué révélé par le trigger collapsible.
        </Collapsible.Content>
      </Collapsible.Root>
    </section>

    <!-- ── Tabs ──────────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Tabs</h2>
      <p :style="sectionDesc">Navigation par onglets WAI-ARIA. Keyboard ArrowLeft/Right.</p>
      <div style="width:100%;max-width:400px">
        <Tabs.Root default-value="react">
          <Tabs.List data-testid="tabs-list" style="display:flex;border-bottom:2px solid #e2e8f0;gap:0.25rem">
            <Tabs.Trigger value="react" data-testid="tabs-trigger-react" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">React</Tabs.Trigger>
            <Tabs.Trigger value="vue" data-testid="tabs-trigger-vue" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">Vue</Tabs.Trigger>
            <Tabs.Trigger value="nuxt" data-testid="tabs-trigger-nuxt" style="padding:0.5rem 1rem;border:none;background:none;cursor:pointer;font-size:0.875rem;font-weight:500">Nuxt</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Panel value="react" data-testid="tabs-panel-react" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            React — bibliothèque UI pour créer des interfaces composant.
          </Tabs.Panel>
          <Tabs.Panel value="vue" data-testid="tabs-panel-vue" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            Vue — framework progressif pour les interfaces utilisateur.
          </Tabs.Panel>
          <Tabs.Panel value="nuxt" data-testid="tabs-panel-nuxt" style="padding:1rem 0;font-size:0.875rem;color:#374151">
            Nuxt — framework full-stack basé sur Vue.
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </section>

    <!-- ── Progress ──────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Progress</h2>
      <p :style="sectionDesc">Barre de progression — déterminée ou indéterminée.</p>
      <div style="display:flex;flex-direction:column;gap:1rem;width:100%;max-width:400px">
        <Progress.Root :value="progressValue" :max="100" aria-label="Chargement" style="display:flex;flex-direction:column;gap:0.5rem">
          <div style="display:flex;justify-content:space-between">
            <Progress.Label style="font-size:0.875rem;font-weight:500">Chargement</Progress.Label>
            <Progress.ValueText data-testid="progress-value" style="font-size:0.875rem;color:#64748b" />
          </div>
          <Progress.Track data-testid="progress-track" style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden">
            <Progress.Fill data-testid="progress-fill" style="height:100%;background:#1e293b;transition:width 0.3s;border-radius:999px" />
          </Progress.Track>
        </Progress.Root>
        <div style="display:flex;gap:0.5rem">
          <button :style="btn" @click="progressValue = Math.max(0, progressValue - 10)">−10</button>
          <button :style="btn" @click="progressValue = Math.min(100, progressValue + 10)">+10</button>
        </div>
        <Progress.Root data-testid="progress-indeterminate" aria-label="Indéterminé" style="display:flex;flex-direction:column;gap:0.5rem">
          <Progress.Label style="font-size:0.875rem;font-weight:500">Indéterminé</Progress.Label>
          <Progress.Track style="height:8px;background:#e2e8f0;border-radius:999px;overflow:hidden">
            <Progress.Fill style="height:100%;background:#6366f1;border-radius:999px" />
          </Progress.Track>
        </Progress.Root>
      </div>
    </section>

    <!-- ── RadioGroup ─────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">RadioGroup</h2>
      <p :style="sectionDesc">Sélection exclusive. Arrow keys pour naviguer.</p>
      <RadioGroup.Root
        :value="radioGroupValue"
        :on-value-change="(v) => radioGroupValue = v"
        name="framework"
        style="display:flex;flex-direction:column;gap:0.75rem"
      >
        <RadioGroup.Item
          v-for="opt in [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }]"
          :key="opt.value"
          :value="opt.value"
          :data-testid="`radio-item-${opt.value}`"
        >
          <div style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
            <RadioGroup.Radio />
            <RadioGroup.Label style="font-size:0.875rem;color:#1e293b;cursor:pointer">
              {{ opt.label }}
            </RadioGroup.Label>
          </div>
          <RadioGroup.HiddenInput />
        </RadioGroup.Item>
      </RadioGroup.Root>
    </section>

    <!-- ── Slider ─────────────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">Slider</h2>
      <p :style="sectionDesc">Curseur draggable. Arrow keys pour incrémenter/décrémenter.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;max-width:320px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.875rem;font-weight:500">Volume</span>
          <code data-testid="slider-value" style="font-size:0.875rem;color:#64748b">{{ sliderValue }}</code>
        </div>
        <Slider.Root
          :value="sliderValue"
          :on-value-change="(v) => sliderValue = v[0] ?? 0"
          :min="0"
          :max="100"
          :step="1"
          style="position:relative;height:20px;display:flex;align-items:center"
        >
          <Slider.Track data-testid="slider-track" style="position:relative;height:4px;background:#e2e8f0;border-radius:2px;flex-grow:1">
            <Slider.Range style="position:absolute;height:100%;background:#1e293b;border-radius:2px" />
          </Slider.Track>
          <Slider.Thumb aria-label="Valeur" data-testid="slider-thumb" style="display:block;width:20px;height:20px;border-radius:50%;background:#fff;border:2px solid #1e293b;box-shadow:0 1px 4px rgb(0 0 0 / 0.15);cursor:grab" />
        </Slider.Root>
      </div>
    </section>

    <!-- ── NumberInput ───────────────────────────────────────────────────────── -->
    <section :style="section">
      <h2 :style="sectionTitle">NumberInput</h2>
      <p :style="sectionDesc">Saisie numérique. WAI-ARIA §3.21 spinbutton — ArrowUp/Down, PageUp/Down, Home/End.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <NumberInput.Root
            :default-value="50"
            :min="0"
            :max="100"
            :step="1"
            :on-value-change="(v) => numberInputValue = v"
          >
            <NumberInput.Label :style="labelS">Quantité</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement" :style="btnGhost">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input"
                aria-label="Quantité"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment" :style="btnGhost">+</NumberInput.IncrementTrigger>
            </div>
            <code data-testid="number-input-value" style="font-size:0.8rem;color:#64748b;display:block;margin-top:0.35rem">
              valeur: {{ numberInputValue ?? 'vide' }}
            </code>
            <NumberInput.HiddenInput name="quantity" />
          </NumberInput.Root>
        </div>

        <div>
          <NumberInput.Root :default-value="25" :min="0" :max="100" :disabled="true">
            <NumberInput.Label :style="{ ...labelS, opacity: 0.5 }">Désactivé</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem;opacity:0.5">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement-disabled" :style="btnGhost">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input-disabled"
                aria-label="Quantité désactivée"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment-disabled" :style="btnGhost">+</NumberInput.IncrementTrigger>
            </div>
          </NumberInput.Root>
        </div>
      </div>
    </section>

    <!-- ── DateField ─────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">DateField</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">Saisie de date en segments indépendants (MM/JJ/AAAA). WAI-ARIA spinbutton par segment.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <DateField.Root data-testid="date-field-root" :on-value-change="(d) => dateFieldValue = d">
          <DateField.Group
            data-testid="date-field-group"
            :style="{ display:'inline-flex', alignItems:'center', gap:'2px', padding:'0.45rem 0.75rem', border:'1px solid #cbd5e1', borderRadius:'6px', fontSize:'0.875rem', background:'#fff' }"
          >
            <DateField.MonthSegment data-testid="date-field-month" :style="{ minWidth:'3ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
            <DateField.Separator :style="{ color:'#94a3b8', userSelect:'none' }" />
            <DateField.DaySegment data-testid="date-field-day" :style="{ minWidth:'2ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
            <DateField.Separator :style="{ color:'#94a3b8', userSelect:'none' }" />
            <DateField.YearSegment data-testid="date-field-year" :style="{ minWidth:'4ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
          </DateField.Group>
          <DateField.HiddenInput name="date" />
        </DateField.Root>
        <p v-if="dateFieldValue" data-testid="date-field-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Date : {{ dateFieldValue.year }}-{{ String(dateFieldValue.month).padStart(2, '0') }}-{{ String(dateFieldValue.day).padStart(2, '0') }}
        </p>
      </div>
    </section>

    <!-- ── TimePicker ─────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">TimePicker</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">Saisie d'heure en segments (HH:MM:SS AM/PM). WAI-ARIA spinbutton par segment.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <TimePicker.Root data-testid="time-picker-root" :on-value-change="(t) => timePickerValue = t">
          <TimePicker.Group
            data-testid="time-picker-group"
            :style="{ display:'inline-flex', alignItems:'center', gap:'2px', padding:'0.45rem 0.75rem', border:'1px solid #cbd5e1', borderRadius:'6px', fontSize:'0.875rem', background:'#fff' }"
          >
            <TimePicker.HoursSegment data-testid="time-picker-hours" :style="{ minWidth:'2ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
            <TimePicker.Separator :style="{ color:'#94a3b8', userSelect:'none' }" />
            <TimePicker.MinutesSegment data-testid="time-picker-minutes" :style="{ minWidth:'2ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
            <TimePicker.Separator :style="{ color:'#94a3b8', userSelect:'none' }" />
            <TimePicker.SecondsSegment data-testid="time-picker-seconds" :style="{ minWidth:'2ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
            <span style="margin-left:4px" />
            <TimePicker.PeriodSegment data-testid="time-picker-period" :style="{ minWidth:'2ch', outline:'none', padding:'1px 2px', borderRadius:'3px' }" />
          </TimePicker.Group>
          <TimePicker.HiddenInput name="time" />
        </TimePicker.Root>
        <p v-if="timePickerValue" data-testid="time-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Heure : {{ String(timePickerValue.hours).padStart(2,'0') }}:{{ String(timePickerValue.minutes).padStart(2,'0') }}:{{ String(timePickerValue.seconds).padStart(2,'0') }}
        </p>
      </div>
    </section>

    <!-- ── DatePicker ─────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">DatePicker</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">Calendrier popup pour sélectionner une date. Vues jour/mois/année.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <DatePicker.Root
          data-testid="date-picker-root"
          :on-value-change="(d) => datePickerSelected = d ? `${d.year}-${String(d.month).padStart(2,'0')}-${String(d.day).padStart(2,'0')}` : null"
        >
          <DatePicker.Trigger data-testid="date-picker-trigger" :style="btn">{{ datePickerSelected ?? 'Choisir une date' }}</DatePicker.Trigger>
          <DatePicker.Content
            data-testid="date-picker-content"
            :style="{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'1rem', boxShadow:'0 8px 30px rgb(0 0 0 / 0.12)', zIndex:50, minWidth:'280px' }"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <DatePicker.PrevMonthButton data-testid="date-picker-prev" :style="{ ...btnGhost, padding:'0.25rem 0.6rem' }">←</DatePicker.PrevMonthButton>
              <DatePicker.CalendarHeader data-testid="date-picker-header" :style="{ fontWeight:600, fontSize:'0.875rem' }" />
              <DatePicker.NextMonthButton data-testid="date-picker-next" :style="{ ...btnGhost, padding:'0.25rem 0.6rem' }">→</DatePicker.NextMonthButton>
            </div>
            <DatePicker.CalendarGrid data-testid="date-picker-grid" :style="{ display:'grid', gap:'2px' }" />
          </DatePicker.Content>
          <DatePicker.HiddenInput name="date" />
        </DatePicker.Root>
        <p v-if="datePickerSelected" data-testid="date-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Sélectionné : {{ datePickerSelected }}
        </p>
      </div>
    </section>

    <!-- ── DateRangePicker ────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 style="margin:0 0 0.25rem;font-size:1rem;font-weight:600">DateRangePicker</h2>
      <p style="margin:0 0 1rem;color:#64748b;font-size:0.8rem">Sélection d'une plage de dates (début → fin). Double calendrier, presets.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <DateRangePicker.Root
          data-testid="date-range-picker-root"
          :on-value-change="(r) => dateRangePickerRange = r ? `${r.start?.year ?? '?'} → ${r.end?.year ?? '?'}` : null"
        >
          <DateRangePicker.Trigger data-testid="date-range-picker-trigger" :style="btn">{{ dateRangePickerRange ?? 'Choisir une plage' }}</DateRangePicker.Trigger>
          <DateRangePicker.Content
            data-testid="date-range-picker-content"
            :style="{ position:'fixed', top:'50%', left:'50%', transform:'translate(-50%,-50%)', background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'1rem', boxShadow:'0 8px 30px rgb(0 0 0 / 0.12)', zIndex:50, minWidth:'300px' }"
          >
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem">
              <DateRangePicker.PrevMonthButton data-testid="date-range-picker-prev" :style="{ ...btnGhost, padding:'0.25rem 0.6rem' }">←</DateRangePicker.PrevMonthButton>
              <DateRangePicker.CalendarHeader data-testid="date-range-picker-header" :style="{ fontWeight:600, fontSize:'0.875rem' }" />
              <DateRangePicker.NextMonthButton data-testid="date-range-picker-next" :style="{ ...btnGhost, padding:'0.25rem 0.6rem' }">→</DateRangePicker.NextMonthButton>
            </div>
            <DateRangePicker.CalendarGrid data-testid="date-range-picker-grid" :style="{ display:'grid', gap:'2px' }" />
            <DateRangePicker.ClearButton data-testid="date-range-picker-clear" :style="{ ...btnGhost, marginTop:'0.75rem', width:'100%' }">Effacer</DateRangePicker.ClearButton>
          </DateRangePicker.Content>
          <DateRangePicker.HiddenInputs start-name="start" end-name="end" />
        </DateRangePicker.Root>
        <p v-if="dateRangePickerRange" data-testid="date-range-picker-value" style="margin:0;font-size:0.8rem;color:#64748b">
          Plage : {{ dateRangePickerRange }}
        </p>
      </div>
    </section>

    <!-- ── Menu (DropdownMenu) ──────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 :style="sectionTitle">Menu (DropdownMenu)</h2>
      <p :style="sectionDesc">WAI-ARIA Menu Button. N-level sub-menus, radio, checkbox, typeahead.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <Menu.Root :on-select="(v: string) => menuLastSelect = v">
          <Menu.Trigger :style="btn">Actions ▾</Menu.Trigger>
          <Menu.Portal>
            <Menu.Content :style="menuContentS">
              <Menu.Label :style="menuGroupS">Fichier</Menu.Label>
              <Menu.Item value="new" :style="menuItemS" :navigate="() => console.log('[navigate] /new')">Nouveau fichier</Menu.Item>
              <Menu.Item value="open" :style="menuItemS">Ouvrir...</Menu.Item>
              <Menu.Separator :style="menuSepS" />
              <Menu.Group id="edit-g">
                <Menu.GroupLabel group-id="edit-g" :style="menuGroupS">Edition</Menu.GroupLabel>
                <Menu.Item value="cut" :style="menuItemS">Couper</Menu.Item>
                <Menu.Item value="copy" :style="menuItemS">Copier</Menu.Item>
                <Menu.Item value="paste" :disabled="true" :style="{ ...menuItemS, opacity: 0.45 }">Coller</Menu.Item>
              </Menu.Group>
              <Menu.Separator :style="menuSepS" />
              <Menu.Label :style="menuGroupS">Theme</Menu.Label>
              <Menu.RadioGroup group-id="theme" :value="menuTheme" :on-value-change="(v: string) => menuTheme = v">
                <Menu.RadioItem v-for="t in ['light', 'dark', 'system']" :key="t" :value="t" :style="menuItemS" :close-on-select="false">
                  <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                  {{ t.charAt(0).toUpperCase() + t.slice(1) }}
                </Menu.RadioItem>
              </Menu.RadioGroup>
              <Menu.Separator :style="menuSepS" />
              <Menu.Label :style="menuGroupS">Vue</Menu.Label>
              <Menu.CheckboxItem value="grid" :checked="menuShowGrid" :on-checked-change="(v: boolean) => menuShowGrid = v" :style="menuItemS">
                <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                Grille
              </Menu.CheckboxItem>
              <Menu.CheckboxItem value="ruler" :checked="menuShowRuler" :on-checked-change="(v: boolean) => menuShowRuler = v" :style="menuItemS">
                <Menu.ItemIndicator><span style="margin-right:6px">✓</span></Menu.ItemIndicator>
                Regle
              </Menu.CheckboxItem>
              <Menu.Separator :style="menuSepS" />
              <Menu.Sub>
                <Menu.SubTrigger value="share" :style="menuItemS">Partager ▶</Menu.SubTrigger>
                <Menu.SubContent :style="menuContentS">
                  <Menu.Item value="share-link" :style="menuItemS">Lien</Menu.Item>
                  <Menu.Item value="share-email" :style="menuItemS">Email</Menu.Item>
                  <Menu.Separator :style="menuSepS" />
                  <Menu.Sub>
                    <Menu.SubTrigger value="social" :style="menuItemS">Reseaux ▶</Menu.SubTrigger>
                    <Menu.SubContent :style="menuContentS">
                      <Menu.Item value="twitter" :style="menuItemS">Twitter</Menu.Item>
                      <Menu.Item value="linkedin" :style="menuItemS">LinkedIn</Menu.Item>
                    </Menu.SubContent>
                  </Menu.Sub>
                </Menu.SubContent>
              </Menu.Sub>
            </Menu.Content>
          </Menu.Portal>
        </Menu.Root>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="menuLastSelect">Selection : {{ menuLastSelect }}</div>
          <div>Theme : {{ menuTheme }}</div>
          <div>Grille : {{ menuShowGrid ? 'oui' : 'non' }}</div>
        </div>
      </div>
    </section>

    <!-- ── Menu — Anchor ────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0;border-bottom:1px solid #e2e8f0">
      <h2 :style="sectionTitle">Menu — Anchor</h2>
      <p :style="sectionDesc">Menu.Anchor positionne le floating par rapport a un element arbitraire.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <div>
          <Menu.Root :open="menuAnchorOpen" :on-open-change="(v: boolean) => menuAnchorOpen = v" :on-select="(v: string) => menuAnchorSelect = v">
            <Menu.Anchor>
              <div style="width:200px;padding:0.5rem;background:#f1f5f9;border:2px dashed #94a3b8;border-radius:8px;text-align:center;font-size:0.8rem;color:#64748b">
                Ancre (reference)
              </div>
            </Menu.Anchor>
            <Menu.Trigger :style="{ ...btn, marginTop: '0.5rem' }">
              {{ menuAnchorOpen ? 'Fermer' : 'Ouvrir (ancre)' }}
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Content :style="menuContentS">
                <Menu.Item value="profile" :style="menuItemS">Profil</Menu.Item>
                <Menu.Item value="settings" :style="menuItemS">Parametres</Menu.Item>
                <Menu.Separator :style="menuSepS" />
                <Menu.Item value="logout" :style="menuItemS">Deconnexion</Menu.Item>
              </Menu.Content>
            </Menu.Portal>
          </Menu.Root>
        </div>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="menuAnchorSelect">Selection : {{ menuAnchorSelect }}</div>
          <div style="color:#94a3b8">Le menu se positionne par rapport a l'ancre</div>
        </div>
      </div>
    </section>

    <!-- ── ContextMenu (avec Sub) ────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitle">ContextMenu (avec Sub)</h2>
      <p :style="sectionDesc">Clic-droit + sous-menus imbriques — auto-portal vers document.body.</p>
      <div style="display:flex;gap:1rem;align-items:flex-start;flex-wrap:wrap">
        <ContextMenu.Root :on-select="(v: string) => ctxMenuSelect = v">
          <ContextMenu.Trigger>
            <div style="width:200px;height:80px;background:#1e40af;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.8rem;user-select:none">
              Clic-droit ici
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Portal>
            <ContextMenu.Content :style="menuContentS">
              <ContextMenu.Item value="inspect" :style="menuItemS">Inspecter</ContextMenu.Item>
              <ContextMenu.Item value="reload" :style="menuItemS">Recharger</ContextMenu.Item>
              <ContextMenu.Separator :style="menuSepS" />
              <ContextMenu.CheckboxItem value="bookmark" :checked="ctxMenuBookmarked" :on-checked-change="(v: boolean) => ctxMenuBookmarked = v" :style="menuItemS">
                <ContextMenu.ItemIndicator><span style="margin-right:6px">★</span></ContextMenu.ItemIndicator>
                Marquer comme favori
              </ContextMenu.CheckboxItem>
              <ContextMenu.Separator :style="menuSepS" />
              <ContextMenu.Sub>
                <ContextMenu.SubTrigger value="share" :style="menuItemS">Partager ▶</ContextMenu.SubTrigger>
                <ContextMenu.SubContent :style="menuContentS">
                  <ContextMenu.Item value="share-link" :style="menuItemS">Lien</ContextMenu.Item>
                  <ContextMenu.Item value="share-email" :style="menuItemS">Email</ContextMenu.Item>
                  <ContextMenu.Separator :style="menuSepS" />
                  <ContextMenu.Sub>
                    <ContextMenu.SubTrigger value="social" :style="menuItemS">Reseaux ▶</ContextMenu.SubTrigger>
                    <ContextMenu.SubContent :style="menuContentS">
                      <ContextMenu.Item value="twitter" :style="menuItemS">Twitter</ContextMenu.Item>
                      <ContextMenu.Item value="linkedin" :style="menuItemS">LinkedIn</ContextMenu.Item>
                    </ContextMenu.SubContent>
                  </ContextMenu.Sub>
                </ContextMenu.SubContent>
              </ContextMenu.Sub>
              <ContextMenu.Separator :style="menuSepS" />
              <ContextMenu.Item value="copy-link" :style="menuItemS">Copier le lien</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        </ContextMenu.Root>
        <div style="font-size:0.8rem;color:#64748b">
          <div v-if="ctxMenuSelect">Selection : {{ ctxMenuSelect }}</div>
          <div>Favori : {{ ctxMenuBookmarked ? '★' : '☆' }}</div>
        </div>
      </div>
    </section>

    <!-- ── Avatar ───────────────────────────────────────────────────────────── -->
    <section style="padding:1.5rem 0">
      <h2 :style="sectionTitle">Avatar</h2>
      <p :style="sectionDesc">Image avec fallback accessible. delayMs sur Fallback évite le flash sur les connexions rapides.</p>
      <div style="display:flex;gap:1.5rem;align-items:center;flex-wrap:wrap">

        <!-- Image cassée → fallback immédiat -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root style="display:inline-flex;position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e2e8f0">
            <Avatar.Image src="https://invalid.domain/broken.jpg" alt="Bob" style="width:100%;height:100%;object-fit:cover" />
            <Avatar.Fallback style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:#475569;background:#e2e8f0">BO</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">Image cassée</span>
        </div>

        <!-- Sans image -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root style="display:inline-flex;position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e2e8f0">
            <Avatar.Image alt="Carol" style="width:100%;height:100%;object-fit:cover" />
            <Avatar.Fallback style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:#475569;background:#e2e8f0">CA</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">Sans image</span>
        </div>

        <!-- delayMs=600 sur Fallback (pas Root) -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root style="display:inline-flex;position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e2e8f0">
            <Avatar.Image src="https://invalid.domain/slow.jpg" alt="Dave" style="width:100%;height:100%;object-fit:cover" />
            <Avatar.Fallback :delay-ms="600" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:#475569;background:#e2e8f0">DA</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">delayMs=600 (Fallback)</span>
        </div>

        <!-- name prop → initials (api.initials = "JD") -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root name="John Doe" style="display:inline-flex;position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e2e8f0">
            <Avatar.Image alt="John Doe" style="width:100%;height:100%;object-fit:cover" />
            <Avatar.Fallback style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:#475569;background:#e2e8f0">JD</Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">name + initials</span>
        </div>

        <!-- asChild: Fallback rendu comme un div -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem">
          <Avatar.Root style="display:inline-flex;position:relative;width:48px;height:48px;border-radius:50%;overflow:hidden;background:#e2e8f0">
            <Avatar.Image alt="Eve" style="width:100%;height:100%;object-fit:cover" />
            <Avatar.Fallback as-child style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:#475569;background:#e2e8f0">
              <div>EV</div>
            </Avatar.Fallback>
          </Avatar.Root>
          <span style="font-size:0.75rem;color:#64748b">asChild (div)</span>
        </div>

      </div>
    </section>
  </main>
</template>

<style>
/* forge-ui — CSS data-state animations
 * watchPresence keeps the component mounted until the animation ends.
 */

@keyframes forge-fade-scale-in {
  from { opacity: 0; scale: 0.97; translate: 0 -6px; }
  to   { opacity: 1; scale: 1;    translate: none; }
}

@keyframes forge-fade-scale-out {
  from { opacity: 1; scale: 1;    translate: none; }
  to   { opacity: 0; scale: 0.97; translate: 0 6px; }
}

@keyframes forge-overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes forge-overlay-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

/* Dialog */
[data-forge-scope="dialog"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 150ms ease forwards;
}
[data-forge-scope="dialog"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 120ms ease forwards;
}

[data-forge-scope="dialog"][data-forge-part="overlay"][data-state="open"] {
  animation: forge-overlay-in 150ms ease forwards;
}
[data-forge-scope="dialog"][data-forge-part="overlay"][data-state="closed"] {
  animation: forge-overlay-out 120ms ease forwards;
}

/* Select dropdown */
[data-forge-scope="select"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="select"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Combobox dropdown */
[data-forge-scope="combobox"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="combobox"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Popover */
[data-forge-scope="popover"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 120ms ease forwards;
}
[data-forge-scope="popover"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 100ms ease forwards;
}

/* Tooltip */
[data-forge-scope="tooltip"][data-forge-part="content"][data-state="open"] {
  animation: forge-fade-scale-in 100ms ease forwards;
}
[data-forge-scope="tooltip"][data-forge-part="content"][data-state="closed"] {
  animation: forge-fade-scale-out 80ms ease forwards;
}

/* RadioGroup */
[data-forge-part="radio"] {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid #cbd5e1; background: #fff;
  display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s;
}
[data-forge-part="radio"][data-state="checked"] {
  border-color: #1e293b;
  box-shadow: inset 0 0 0 4px #fff, inset 0 0 0 9px #1e293b;
}
</style>
