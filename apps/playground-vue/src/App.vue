<script setup lang="ts">
import {
  Accordion,
  AlertDialog,
  Checkbox,
  CheckboxControl,
  CheckboxGroup,
  CheckboxGroupAll,
  CheckboxIndicator,
  CheckboxLabel,
  CheckboxRoot,
  Collapsible,
  Combobox,
  Dialog,
  DialogPortal,
  Field,
  FieldGroup,
  FieldGroupLabel,
  FieldRequiredIndicator,
  HoverCard,
  HoverCardArrow,
  HoverCardContent,
  HoverCardPortal,
  HoverCardRoot,
  HoverCardTrigger,
  Popover,
  Progress,
  RadioGroup,
  Select,
  NumberInput,
  Slider,
  Switch,
  SwitchControl,
  SwitchLabel,
  SwitchRoot,
  SwitchThumb,
  Tabs,
  Tooltip,
  TooltipAnchor,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TagsInput,
  useDialog,
} from "@forge-ui/vue";
import { ref } from "vue";

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);
const selectedValue = ref<string[]>([]);
const selectedMultiple = ref<string[]>([]);
const checkboxControlled = ref<boolean | "indeterminate">("indeterminate");
const groupValues = ref<string[]>(["react"]);
const switchOn = ref(false);

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
const tooltipStyle = { background: "#1e293b", color: "#f1f5f9", borderRadius: "6px", padding: "0.35rem 0.6rem", fontSize: "0.8rem", boxShadow: "0 4px 12px rgb(0 0 0 / 0.2)", maxWidth: "240px" } as const;

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

const checkboxControlStyle = { width: "18px", height: "18px", border: "2px solid #cbd5e1", borderRadius: "4px", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 };
const checkboxIndicatorStyle = { fontSize: "11px", fontWeight: 700, color: "#1e293b", lineHeight: 1 };
const checkboxLabelStyle = { fontSize: "0.875rem", color: "#1e293b", cursor: "pointer" };
const switchOffStyle = { width: "44px", height: "24px", borderRadius: "12px", background: "#cbd5e1", border: "none", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", transition: "background 0.15s", flexShrink: 0 };
const switchOnStyle = { ...switchOffStyle, background: "#1e293b" };
const switchThumbOffStyle = { width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgb(0 0 0 / 0.2)", transform: "translateX(0)", transition: "transform 0.15s" };
const switchThumbOnStyle = { ...switchThumbOffStyle, transform: "translateX(20px)" };

const comboboxContentStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "0.25rem", boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)", listStyle: "none" as const, margin: 0, maxHeight: "200px", overflowY: "auto" as const };
const comboboxItemStyle = { padding: "0.45rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", cursor: "pointer", color: "#1e293b", display: "flex", alignItems: "center", gap: "0.25rem" };

const hoverCardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "1rem", minWidth: "260px", maxWidth: "320px", boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)" } as const;
const hoverCardAvatarStyle = { width: "40px", height: "40px", borderRadius: "50%", background: "#6366f1", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 } as const;
const hoverCardLinkStyle = { color: "#6366f1", fontWeight: 500, fontSize: "0.9rem", textDecoration: "underline", cursor: "pointer" } as const;

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
const comboboxSelected = ref<string[]>([]);
const tagsInputTags = ref<string[]>(["TypeScript", "Vue"]);
const progressValue = ref(42);
const sliderValue = ref(50);
const numberInputValue = ref<number | null>(50);
const radioGroupValue = ref<string[]>(["react"]);
</script>

<template>
  <main style="display:flex;flex-direction:column;gap:0;padding:2rem;max-width:680px;margin:0 auto;font-family:system-ui,sans-serif">
    <h1 style="margin:0;font-size:1.5rem">forge-ui — Vue Playground</h1>

    <!-- ── Animations CSS (data-state) ──────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Animations CSS (data-state)</h2>
      <p :style="sectionDescStyle">Transitions d'entrée/sortie CSS-only via data-state. Aucune librairie externe.</p>
      <!-- Le CSS data-state fait le travail — watchPresence maintient le composant monté jusqu'à animationend -->
      <Dialog.Root :on-open-change="(o) => console.log('[AnimatedDialog] open:', o)">
        <Dialog.Trigger :style="btnStyle">Dialog avec animation</Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay :style="overlayStyle" />
          <Dialog.Content :style="contentStyle">
            <Dialog.Title :style="titleStyle">Dialog animé</Dialog.Title>
            <Dialog.Description :style="descStyle">
              Le CSS <code>data-state</code> fait le travail — aucune prop <code>forceMount</code> nécessaire.
              <code>watchPresence</code> maintient le composant monté jusqu'à <code>animationend</code>.
            </Dialog.Description>
            <div :style="footerStyle">
              <Dialog.Close :style="btnGhostStyle">Annuler</Dialog.Close>
              <Dialog.Close :style="btnStyle">Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>

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

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Avec Popover.Arrow</p>
          <Popover.Root>
            <Popover.Trigger :style="btnStyle">Arrow popover</Popover.Trigger>
            <Popover.Portal>
              <Popover.Content :style="{ ...popoverStyle, position: 'relative' }">
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
                <Popover.Description :style="{ ...descStyle, marginBottom: 0 }">
                  Flèche centrée par Floating UI. Utilisez <code>data-side</code> pour la rotation CSS.
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
              <!-- Select.Placeholder : visible seulement quand aucune valeur n'est sélectionnée -->
              <Select.Value>
                <Select.Placeholder style="color:#94a3b8">Choisir un framework…</Select.Placeholder>
              </Select.Value>
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

    <!-- ── Checkbox ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Checkbox</h2>
      <p :style="sectionDescStyle">Tri-state (unchecked / indeterminate / checked). Indicateur + Label associé.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <CheckboxRoot :default-checked="true">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">Accepter les CGU (uncontrolled)</CheckboxLabel>
          </div>
        </CheckboxRoot>
        <CheckboxRoot :checked="checkboxControlled" :on-checked-change="(v) => checkboxControlled = v">
          <div style="display:flex;align-items:center;gap:0.5rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">
                {{ checkboxControlled === 'indeterminate' ? '—' : '✓' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">
              Controlled — état: <code>{{ String(checkboxControlled) }}</code>
            </CheckboxLabel>
          </div>
        </CheckboxRoot>
        <CheckboxRoot :disabled="true">
          <div style="display:flex;align-items:center;gap:0.5rem;opacity:0.4">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">Désactivé</CheckboxLabel>
          </div>
        </CheckboxRoot>
      </div>
    </section>

    <!-- ── Checkbox.Group ─────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Checkbox.Group + GroupAll</h2>
      <p :style="sectionDescStyle">Select-all natif. GroupAll dérive indeterminate automatiquement.</p>
      <CheckboxGroup v-model:value="groupValues">
        <CheckboxGroupAll>
          <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem">
            <CheckboxControl :style="{ ...checkboxControlStyle, background: '#f1f5f9' }">
              <CheckboxIndicator :style="checkboxIndicatorStyle">
                {{ groupValues.length === 3 ? '✓' : '—' }}
              </CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="{ ...checkboxLabelStyle, fontWeight: 600 }">Tout sélectionner</CheckboxLabel>
          </div>
        </CheckboxGroupAll>
        <CheckboxRoot v-for="item in [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'angular', label: 'Angular' }]" :key="item.value" :value="item.value">
          <div style="display:flex;align-items:center;gap:0.5rem;padding-left:1.25rem">
            <CheckboxControl :style="checkboxControlStyle">
              <CheckboxIndicator :style="checkboxIndicatorStyle">✓</CheckboxIndicator>
            </CheckboxControl>
            <CheckboxLabel :style="checkboxLabelStyle">{{ item.label }}</CheckboxLabel>
          </div>
        </CheckboxRoot>
      </CheckboxGroup>
      <p style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
        Sélectionnés: <code>{{ groupValues.join(', ') || 'aucun' }}</code>
      </p>
    </section>

    <!-- ── Switch ────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Switch</h2>
      <p :style="sectionDescStyle">Toggle binaire. role=switch, hidden input auto.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem">
        <SwitchRoot :checked="switchOn" :on-checked-change="(v) => switchOn = v">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="switchOn ? switchOnStyle : switchOffStyle">
              <SwitchThumb :style="switchOn ? switchThumbOnStyle : switchThumbOffStyle" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabelStyle">
              Notifications — <code>{{ switchOn ? 'activées' : 'désactivées' }}</code>
            </SwitchLabel>
          </div>
        </SwitchRoot>
        <SwitchRoot :default-checked="true" :disabled="true">
          <div style="display:flex;align-items:center;gap:0.75rem;opacity:0.4">
            <SwitchControl :style="switchOnStyle">
              <SwitchThumb :style="switchThumbOnStyle" />
            </SwitchControl>
            <SwitchLabel :style="checkboxLabelStyle">Désactivé (on)</SwitchLabel>
          </div>
        </SwitchRoot>

        <SwitchRoot :invalid="true">
          <div style="display:flex;align-items:center;gap:0.75rem">
            <SwitchControl :style="{ ...switchOffStyle, borderColor: '#dc2626', outline: '1px solid #dc2626' }">
              <SwitchThumb :style="switchThumbOffStyle" />
            </SwitchControl>
            <SwitchLabel :style="{ ...checkboxLabelStyle, color: '#dc2626' }">
              État invalide (data-invalid + aria-invalid)
            </SwitchLabel>
          </div>
        </SwitchRoot>
      </div>
    </section>

    <!-- ── Tooltip ───────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Tooltip</h2>
      <p :style="sectionDescStyle">Survol/focus. Provider skip-delay SSR-safe.</p>
      <TooltipProvider :open-delay="400" :close-delay="200" :skip-delay="300">
        <div style="display:flex;gap:1rem;flex-wrap:wrap;align-items:center">
          <TooltipRoot>
            <TooltipTrigger :style="btnStyle">Survol (400ms)</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Ouvre après 400ms — délai Provider</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btnStyle">Skip-delay</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Instantané si un tooltip vient de fermer</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :interactive="true">
            <TooltipTrigger :style="btnStyle">Interactive</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="{ ...tooltipStyle, padding: '0.5rem 0.75rem' }">
                <p style="margin:0 0 0.25rem;font-size:0.8rem">Cliquez le lien ↓</p>
                <a href="#" style="color:#38bdf8;font-size:0.8rem">Lien dans le tooltip</a>
              </TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :disabled="true">
            <TooltipTrigger :style="{ ...btnStyle, opacity: 0.5 }" :disabled="true">Désactivé</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Ne s'affiche pas</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot :positioning="{ placement: 'bottom' }">
            <TooltipTrigger :style="btnGhostStyle">Placement bas</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">placement="bottom"</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>

          <TooltipRoot>
            <TooltipTrigger :style="btnGhostStyle">Anchor demo</TooltipTrigger>
            <!-- TooltipAnchor redirige le positioner vers cet élément -->
            <TooltipAnchor>
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f59e0b;margin-left:0.5rem;vertical-align:middle" />
            </TooltipAnchor>
            <TooltipPortal>
              <TooltipContent :style="tooltipStyle">Positionné sur le point orange ↑</TooltipContent>
            </TooltipPortal>
          </TooltipRoot>
        </div>
      </TooltipProvider>
    </section>

    <!-- ── HoverCard ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">HoverCard</h2>
      <p :style="sectionDescStyle">Aperçu au survol. openDelay=700ms, closeDelay=300ms. Contenu interactif possible.</p>
      <div style="display:flex;gap:2rem;flex-wrap:wrap;align-items:flex-start">
        <HoverCardRoot>
          <HoverCardTrigger :asChild="true">
            <a :style="hoverCardLinkStyle" href="#" @click.prevent>@forge-ui</a>
          </HoverCardTrigger>
          <HoverCardPortal>
            <HoverCardContent :style="hoverCardStyle">
              <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
                <div :style="hoverCardAvatarStyle">F</div>
                <div>
                  <p style="margin:0;font-weight:600;font-size:0.9rem">forge-ui</p>
                  <p style="margin:0;font-size:0.75rem;color:#64748b">@forge-ui · headless UI</p>
                </div>
              </div>
              <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#374151;line-height:1.5">
                Bibliothèque de primitives UI headless. Architecture 3 niveaux : machine → connect → bindings.
              </p>
              <div style="display:flex;gap:1rem;font-size:0.75rem;color:#64748b">
                <span><strong style="color:#1e293b">142</strong> Following</span>
                <span><strong style="color:#1e293b">2.4k</strong> Followers</span>
              </div>
            </HoverCardContent>
          </HoverCardPortal>
        </HoverCardRoot>

        <HoverCard.Root :positioning="{ placement: 'bottom' }">
          <HoverCard.Trigger :asChild="true">
            <a :style="hoverCardLinkStyle" href="#" @click.prevent>Placement bottom</a>
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

    <!-- ── Field ────────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Field</h2>
      <p :style="sectionDescStyle">Champ accessible : Label + RequiredIndicator + Description + Error + Group.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <Field.Root id="vue-field-email" :invalid="fieldInvalid" :required="true">
          <Field.Label :style="labelStyle">
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
          <FieldGroupLabel :style="labelStyle">Notifications</FieldGroupLabel>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="vue-notif-email" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par email</Field.Label>
            </div>
          </Field.Root>
          <Field.Root>
            <div style="display:flex;align-items:center;gap:0.5rem">
              <Field.Control><input type="checkbox" id="vue-notif-sms" /></Field.Control>
              <Field.Label style="font-size:0.875rem">Par SMS</Field.Label>
            </div>
          </Field.Root>
        </FieldGroup>

      </div>
    </section>

    <!-- ── Combobox ──────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Combobox</h2>
      <p :style="sectionDescStyle">WAI-ARIA 1.2 Combobox. Filtre client-side, multi-select.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Single-select (filtre client-side)</p>
          <Combobox.Root :on-value-change="(v) => comboboxSelected = v">
            <Combobox.Label :style="labelStyle">Langage préféré</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhostStyle">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item
                  v-for="l in languages"
                  :key="l.value"
                  :value="l.value"
                  :label="l.label"
                  :style="comboboxItemStyle"
                >
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
          <p v-if="comboboxSelected.length" style="margin:0.5rem 0 0;font-size:0.8rem;color:#64748b">
            Sélectionné : {{ comboboxSelected.join(', ') }}
          </p>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Multi-select</p>
          <Combobox.Root :multiple="true">
            <Combobox.Label :style="labelStyle">Langages maîtrisés</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item
                  v-for="l in languages"
                  :key="l.value"
                  :value="l.value"
                  :label="l.label"
                  :style="comboboxItemStyle"
                >
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
            <Combobox.Label :style="labelStyle">Langage</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabelStyle">Frontend</Combobox.GroupLabel>
                  <Combobox.Item value="ts" label="TypeScript" :style="comboboxItemStyle"><Combobox.ItemText>TypeScript</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="js" label="JavaScript" :style="comboboxItemStyle"><Combobox.ItemText>JavaScript</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
                <Combobox.Group>
                  <Combobox.GroupLabel :style="groupLabelStyle">Backend</Combobox.GroupLabel>
                  <Combobox.Item value="py" label="Python" :style="comboboxItemStyle"><Combobox.ItemText>Python</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="rs" label="Rust" :style="comboboxItemStyle"><Combobox.ItemText>Rust</Combobox.ItemText></Combobox.Item>
                  <Combobox.Item value="go" label="Go" :style="comboboxItemStyle"><Combobox.ItemText>Go</Combobox.ItemText></Combobox.Item>
                </Combobox.Group>
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>

        <div>
          <p style="margin:0 0 0.5rem;font-size:0.8rem;color:#64748b">Creatable — crée une option absente</p>
          <Combobox.Root :on-create-option="(v) => console.log('Créer:', v)">
            <Combobox.Label :style="labelStyle">Langage personnalisé</Combobox.Label>
            <div style="display:flex;gap:0.25rem">
              <Combobox.Input style="padding:0.45rem 0.6rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;width:200px" />
              <Combobox.Trigger :style="btnGhostStyle">▾</Combobox.Trigger>
              <Combobox.ClearTrigger :style="btnGhostStyle">✕</Combobox.ClearTrigger>
            </div>
            <Combobox.Portal>
              <Combobox.Content :style="comboboxContentStyle">
                <Combobox.Item v-for="l in languages" :key="l.value" :value="l.value" :label="l.label" :style="comboboxItemStyle">
                  <Combobox.ItemIndicator :value="l.value">✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{{ l.label }}</Combobox.ItemText>
                </Combobox.Item>
                <Combobox.CreateOption :style="{ ...comboboxItemStyle, fontStyle: 'italic', color: '#6366f1' }" />
              </Combobox.Content>
            </Combobox.Portal>
          </Combobox.Root>
        </div>
      </div>
    </section>

    <!-- ── TagsInput ─────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">TagsInput</h2>
      <p :style="sectionDescStyle">Saisie libre de tags. Enter=ajouter, Backspace=supprimer dernier.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Accordion</h2>
      <p :style="sectionDescStyle">Panneau accordéon — single, multiple, ou collapsible.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Collapsible</h2>
      <p :style="sectionDescStyle">Toggle simple — un contenu masqué/révélé.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Tabs</h2>
      <p :style="sectionDescStyle">Navigation par onglets WAI-ARIA. Keyboard ArrowLeft/Right.</p>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Progress</h2>
      <p :style="sectionDescStyle">Barre de progression — déterminée ou indéterminée.</p>
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
          <button :style="btnStyle" @click="progressValue = Math.max(0, progressValue - 10)">−10</button>
          <button :style="btnStyle" @click="progressValue = Math.min(100, progressValue + 10)">+10</button>
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">RadioGroup</h2>
      <p :style="sectionDescStyle">Sélection exclusive. Arrow keys pour naviguer.</p>
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
            <RadioGroup.Radio style="width:18px;height:18px;border-radius:50%;border:2px solid #cbd5e1;background:#fff;display:flex;align-items:center;justify-content:center">
              <span data-forge-part="indicator" style="width:8px;height:8px;border-radius:50%;background:#1e293b;display:none" />
            </RadioGroup.Radio>
            <RadioGroup.Label style="font-size:0.875rem;color:#1e293b;cursor:pointer">
              {{ opt.label }}
            </RadioGroup.Label>
          </div>
          <RadioGroup.HiddenInput />
        </RadioGroup.Item>
      </RadioGroup.Root>
    </section>

    <!-- ── Slider ─────────────────────────────────────────────────────────────── -->
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">Slider</h2>
      <p :style="sectionDescStyle">Curseur draggable. Arrow keys pour incrémenter/décrémenter.</p>
      <div style="display:flex;flex-direction:column;gap:0.75rem;width:100%;max-width:320px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:0.875rem;font-weight:500">Volume</span>
          <code data-testid="slider-value" style="font-size:0.875rem;color:#64748b">{{ sliderValue }}</code>
        </div>
        <Slider.Root
          :value="sliderValue"
          :on-value-change="(v) => sliderValue = v"
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
    <section :style="sectionStyle">
      <h2 :style="sectionTitleStyle">NumberInput</h2>
      <p :style="sectionDescStyle">Saisie numérique. WAI-ARIA §3.21 spinbutton — ArrowUp/Down, PageUp/Down, Home/End.</p>
      <div style="display:flex;flex-direction:column;gap:1.5rem">
        <div>
          <NumberInput.Root
            :default-value="50"
            :min="0"
            :max="100"
            :step="1"
            :on-value-change="(v) => numberInputValue = v"
          >
            <NumberInput.Label :style="labelStyle">Quantité</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement" :style="btnGhostStyle">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input"
                aria-label="Quantité"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment" :style="btnGhostStyle">+</NumberInput.IncrementTrigger>
            </div>
            <code data-testid="number-input-value" style="font-size:0.8rem;color:#64748b;display:block;margin-top:0.35rem">
              valeur: {{ numberInputValue ?? 'vide' }}
            </code>
            <NumberInput.HiddenInput name="quantity" />
          </NumberInput.Root>
        </div>

        <div>
          <NumberInput.Root :default-value="25" :min="0" :max="100" :disabled="true">
            <NumberInput.Label :style="{ ...labelStyle, opacity: 0.5 }">Désactivé</NumberInput.Label>
            <div style="display:flex;align-items:center;gap:0.5rem;margin-top:0.35rem;opacity:0.5">
              <NumberInput.DecrementTrigger data-testid="number-input-decrement-disabled" :style="btnGhostStyle">−</NumberInput.DecrementTrigger>
              <NumberInput.Input
                data-testid="number-input-input-disabled"
                aria-label="Quantité désactivée"
                style="width:80px;text-align:center;padding:0.45rem;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem"
              />
              <NumberInput.IncrementTrigger data-testid="number-input-increment-disabled" :style="btnGhostStyle">+</NumberInput.IncrementTrigger>
            </div>
          </NumberInput.Root>
        </div>
      </div>
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

<style>
/* forge-ui — CSS data-state animations
 * watchPresence maintient le composant monté jusqu'à la fin de l'animation.
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
</style>
