<script setup lang="ts">
// Aucun import nécessaire — @forge-ui/nuxt auto-importe tout.
// useDialog, AlertDialog, Dialog, Popover, Select, etc. sont disponibles directement.

const hookDialog = useDialog({
  onOpenChange: (o) => console.log("[useDialog] open:", o),
});

const controlledOpen = ref(false);
const selectedValue = ref<string[]>([]);
const selectedMultiple = ref<string[]>([]);

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
              <Select.Value placeholder="Choisir un framework…" />
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

          <TooltipRoot :positioning="{ placement: 'bottom' }">
            <TooltipTrigger :style="btnGhost">Placement bas</TooltipTrigger>
            <TooltipPortal>
              <TooltipContent :style="tooltipS">placement="bottom"</TooltipContent>
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
        <Field.Root :invalid="fieldInvalid" :required="true">
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

        <FieldGroup>
          <FieldGroupLabel style="font-size:0.8rem;font-weight:600;margin-bottom:0.5rem;display:block">
            Préférences de notification
          </FieldGroupLabel>
          <div style="display:flex;flex-direction:column;gap:0.35rem">
            <label style="font-size:0.875rem"><input type="checkbox" /> Email</label>
            <label style="font-size:0.875rem"><input type="checkbox" /> SMS</label>
            <label style="font-size:0.875rem"><input type="checkbox" /> Push</label>
          </div>
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
      </div>
    </section>
  </main>
</template>
