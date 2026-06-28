import {
  Accordion,
  AlertDialog,
  Avatar,
  Checkbox,
  Collapsible,
  Combobox,
  ContextMenu,
  DateField,
  DatePicker,
  DateRangePicker,
  Dialog,
  DialogPortal,
  Field,
  HoverCard,
  Menu,
  NumberInput,
  Popover,
  Progress,
  RadioGroup,
  Select,
  Separator,
  Slider,
  Switch,
  Tabs,
  TagsInput,
  TimePicker,
  Toggle,
  ToggleGroup,
  Tooltip,
  useAvatarContext,
  useDatePickerContext,
  useDateRangePickerContext,
  useDialog,
  VisuallyHidden,
} from "@forge-ui/react";
import { useState } from "react";

export default function App() {
  return (
    <main style={mainStyle}>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>forge-ui — React Playground</h1>

      <Section title="Dialog" description="Modal avec Escape + click outside pour fermer.">
        <DialogDemo />
      </Section>

      <Section
        title="Animations CSS (data-state)"
        description="Transitions d'entrée/sortie CSS-only via data-state. Aucune librairie externe."
      >
        <AnimatedDialogDemo />
      </Section>

      <Section
        title="Dialog imbriqué"
        description="Stack registry — seule la couche supérieure capte Escape."
      >
        <NestedDialogDemo />
      </Section>

      <Section title="Dialog contrôlé" description="open + onOpenChange — état géré à l'extérieur.">
        <ControlledDialogDemo />
      </Section>

      <Section title="Hook API useDialog" description="Prop-getters manuels sans composants.">
        <HookDemo />
      </Section>

      <Section
        title="AlertDialog"
        description="Confirmation destructive — Escape et outside-click bloqués par WAI-ARIA."
      >
        <AlertDialogDemo />
      </Section>

      <Section title="Popover" description="Floating, non-modal. Ferme sur outside-click.">
        <PopoverDemo />
      </Section>

      <Section
        title="Select"
        description="WAI-ARIA 1.2 Select-Only Combobox. Keyboard + typeahead."
      >
        <SelectDemo />
      </Section>

      <Section
        title="Select multiple"
        description="Multi-sélection — reste ouvert après chaque choix."
      >
        <SelectMultipleDemo />
      </Section>

      <Section
        title="Checkbox"
        description="Tri-state (unchecked / indeterminate / checked). Indicateur + Label associé."
      >
        <CheckboxDemo />
      </Section>

      <Section
        title="Checkbox.Group + GroupAll"
        description="Select-all natif. GroupAll dérive indeterminate automatiquement."
      >
        <CheckboxGroupDemo />
      </Section>

      <Section title="Switch" description="Toggle binaire. role=switch, hidden input auto.">
        <SwitchDemo />
      </Section>

      <Section
        title="Tooltip"
        description="Survol/focus pour info contextuelle. Provider avec skip-delay SSR-safe."
      >
        <TooltipDemo />
      </Section>

      <Section
        title="HoverCard"
        description="Aperçu au survol. openDelay=700ms, closeDelay=300ms. Contenu interactif possible."
      >
        <HoverCardDemo />
      </Section>

      <Section
        title="Field"
        description="Champ accessible : Label + RequiredIndicator + Description + Error + Group."
      >
        <FieldDemo />
      </Section>

      <Section
        title="Combobox"
        description="WAI-ARIA 1.2 Combobox. Filtre client-side, multi-select, mode async."
      >
        <ComboboxDemo />
      </Section>

      <Section title="asChild" description="Forge merge les props sur votre élément, sans wrapper.">
        <AsChildDemo />
      </Section>

      <Section
        title="TagsInput"
        description="Saisie libre de tags. Enter=ajouter, Backspace=supprimer dernier."
      >
        <TagsInputDemo />
      </Section>

      <Section
        title="Accordion"
        description="Panneau accordéon — simple, multiple, ou collapsible."
      >
        <AccordionDemo />
      </Section>

      <Section title="Collapsible" description="Toggle simple — un contenu masqué/révélé.">
        <CollapsibleDemo />
      </Section>

      <Section
        title="Tabs"
        description="Navigation par onglets WAI-ARIA. Keyboard ArrowLeft/Right."
      >
        <TabsDemo />
      </Section>

      <Section title="Progress" description="Barre de progression — déterminée ou indéterminée.">
        <ProgressDemo />
      </Section>

      <Section title="RadioGroup" description="Sélection exclusive. Arrow keys pour naviguer.">
        <RadioGroupDemo />
      </Section>

      <Section
        title="Slider"
        description="Curseur draggable. Arrow keys pour incrémenter/décrémenter."
      >
        <SliderDemo />
      </Section>

      <Section
        title="NumberInput"
        description="Saisie numérique. WAI-ARIA §3.21 spinbutton — ArrowUp/Down, PageUp/Down, Home/End."
      >
        <NumberInputDemo />
      </Section>

      <Section
        title="DateField"
        description="Saisie de date en segments indépendants (MM/JJ/AAAA). WAI-ARIA spinbutton par segment."
      >
        <DateFieldDemo />
      </Section>

      <Section
        title="TimePicker"
        description="Saisie d'heure en segments (HH:MM:SS AM/PM). WAI-ARIA spinbutton par segment."
      >
        <TimePickerDemo />
      </Section>

      <Section
        title="DatePicker"
        description="Calendrier popup pour sélectionner une date. Vues jour/mois/année."
      >
        <DatePickerDemo />
      </Section>

      <Section
        title="DateRangePicker"
        description="Sélection d'une plage de dates (début → fin). Double calendrier, presets."
      >
        <DateRangePickerDemo />
      </Section>

      <Section
        title="Toggle"
        description="Bouton bascule — role=button + aria-pressed. WAI-ARIA Button Pattern §3.5."
      >
        <ToggleDemo />
      </Section>

      <Section
        title="ToggleGroup"
        description="Barre d'outils de toggles — role=toolbar + roving tabindex. WAI-ARIA APG Toolbar Pattern."
      >
        <ToggleGroupDemo />
      </Section>

      <Section
        title="Separator"
        description="Séparateur sémantique (role=separator) ou décoratif (role=none + aria-hidden)."
      >
        <SeparatorDemo />
      </Section>

      <Section
        title="VisuallyHidden"
        description="Contenu visible pour les lecteurs d'écran, invisible visuellement. Utile pour les labels SR."
      >
        <VisuallyHiddenDemo />
      </Section>

      <Section
        title="Menu (DropdownMenu)"
        description="WAI-ARIA Menu Button. Focus dans le content. Keyboard nav. Sous-menus imbriqués. navigate prop."
      >
        <MenuDemo />
      </Section>

      <Section
        title="Menu — Sub click-only (openOnHover=false)"
        description="SubTrigger avec openOnHover={false} : le survol ne suffit pas, seul le clic ouvre le sous-menu."
      >
        <MenuClickOnlySubDemo />
      </Section>

      <Section
        title="Menu — Anchor (positionnement personnalisé)"
        description="Menu.Anchor positionne le floating par rapport à un élément arbitraire, pas le trigger."
      >
        <MenuAnchorDemo />
      </Section>

      <Section
        title="Menu — ContextMenu (avec Sub)"
        description="Clic-droit + sous-menus imbriqués portés vers document.body. Clipping impossible."
      >
        <ContextMenuDemo />
      </Section>

      <Section
        title="Avatar"
        description="Image avec fallback accessible. Supporte delayMs pour éviter le flash du fallback sur les connexions rapides."
      >
        <AvatarDemo />
      </Section>
    </main>
  );
}

/* ── Dialog standard ────────────────────────────────────────────────────────── */

function DialogDemo() {
  return (
    <Dialog.Root onOpenChange={(o) => console.log("[Dialog] open:", o)}>
      <Dialog.Trigger style={btnStyle}>Ouvrir le dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={titleStyle}>Paramètres du compte</Dialog.Title>
          <Dialog.Description style={descStyle}>
            Modifiez les informations de votre profil ici. Appuyez sur Echap ou cliquez à
            l'extérieur pour fermer.
          </Dialog.Description>
          <div style={footerStyle}>
            <Dialog.Close style={btnGhostStyle}>Annuler</Dialog.Close>
            <Dialog.Close style={btnStyle}>Sauvegarder</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Dialog animé (CSS data-state) ─────────────────────────────────────────── */
// Les animations sont définies dans animations.css via les sélecteurs data-forge-scope/part/state.
// watchPresence maintient le composant monté jusqu'à la fin de l'animation de sortie.

function AnimatedDialogDemo() {
  return (
    <Dialog.Root onOpenChange={(o) => console.log("[AnimatedDialog] open:", o)}>
      <Dialog.Trigger style={btnStyle}>Dialog avec animation</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={titleStyle}>Dialog animé</Dialog.Title>
          <Dialog.Description style={descStyle}>
            Le CSS <code>data-state</code> fait le travail — aucune prop <code>forceMount</code>{" "}
            nécessaire. Le système <code>watchPresence</code> lit <code>animationDuration</code> et
            maintient le composant monté jusqu'à <code>animationend</code>.
          </Dialog.Description>
          <div style={footerStyle}>
            <Dialog.Close style={btnGhostStyle}>Annuler</Dialog.Close>
            <Dialog.Close style={btnStyle}>Fermer</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Dialog imbriqué ────────────────────────────────────────────────────────── */

function NestedDialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger style={btnStyle}>Ouvrir dialog 1</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={titleStyle}>Dialog 1</Dialog.Title>
          <Dialog.Description style={descStyle}>
            Echap ferme ce dialog. Ouvrez dialog 2 pour tester la stack.
          </Dialog.Description>
          <div style={footerStyle}>
            <Dialog.Root>
              <Dialog.Trigger style={btnStyle}>Ouvrir dialog 2</Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay style={{ ...overlayStyle, background: "rgb(0 0 0 / 0.6)" }} />
                <Dialog.Content style={{ ...contentStyle, top: "45%" }}>
                  <Dialog.Title style={titleStyle}>Dialog 2 (top layer)</Dialog.Title>
                  <Dialog.Description style={descStyle}>
                    Echap ferme uniquement ce dialog. Dialog 1 reste ouvert.
                  </Dialog.Description>
                  <div style={footerStyle}>
                    <Dialog.Close style={btnStyle}>Fermer dialog 2</Dialog.Close>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
            <Dialog.Close style={btnGhostStyle}>Fermer dialog 1</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Dialog contrôlé ───────────────────────────────────────────────────────── */

function ControlledDialogDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      <button style={btnStyle} type="button" onClick={() => setOpen(true)}>
        Ouvrir depuis l'extérieur
      </button>
      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
        État: <code>{open ? "ouvert" : "fermé"}</code>
      </span>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay style={overlayStyle} />
          <Dialog.Content style={contentStyle}>
            <Dialog.Title style={titleStyle}>Dialog contrôlé</Dialog.Title>
            <Dialog.Description style={descStyle}>
              L'état est géré par le composant parent via <code>open</code> +{" "}
              <code>onOpenChange</code>.
            </Dialog.Description>
            <div style={footerStyle}>
              <Dialog.Close style={btnStyle}>Fermer</Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ── Hook API ───────────────────────────────────────────────────────────────── */

function HookDemo() {
  const dialog = useDialog({
    onOpenChange: (o) => console.log("[useDialog] open:", o),
  });

  return (
    <>
      <button {...dialog.getTriggerProps()} style={btnStyle}>
        Ouvrir (hook)
      </button>

      {dialog.isOpen && (
        <DialogPortal>
          <div {...dialog.getOverlayProps()} style={overlayStyle} />
          <div {...dialog.getContentProps()} style={contentStyle}>
            <h2 {...dialog.getTitleProps()} style={titleStyle}>
              Hook dialog
            </h2>
            <p {...dialog.getDescriptionProps()} style={descStyle}>
              Ouvert via <code>useDialog()</code> — prop-getters étalés manuellement.
            </p>
            <div style={footerStyle}>
              <button {...dialog.getCloseProps()} style={btnStyle}>
                Fermer
              </button>
            </div>
          </div>
        </DialogPortal>
      )}
    </>
  );
}

/* ── AlertDialog ────────────────────────────────────────────────────────────── */

function AlertDialogDemo() {
  const [confirming, setConfirming] = useState(false);

  function handleConfirm() {
    setConfirming(true);
    setTimeout(() => {
      setConfirming(false);
      console.log("[AlertDialog] confirmed");
    }, 1200);
  }

  return (
    <AlertDialog.Root onOpenChange={(o) => console.log("[AlertDialog] open:", o)}>
      <AlertDialog.Trigger style={btnDangerStyle}>Supprimer le compte</AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay style={overlayStyle} />
        <AlertDialog.Content style={contentStyle}>
          <AlertDialog.Title style={titleStyle}>Supprimer définitivement ?</AlertDialog.Title>
          <AlertDialog.Description style={descStyle}>
            Cette action est irréversible. Toutes vos données seront supprimées. Escape et click en
            dehors ne ferment <strong>pas</strong> ce dialog.
          </AlertDialog.Description>
          <div style={footerStyle}>
            <AlertDialog.Cancel style={btnGhostStyle}>Annuler</AlertDialog.Cancel>
            <AlertDialog.Action
              style={btnDangerStyle}
              onClick={handleConfirm}
              disabled={confirming}
            >
              {confirming ? "Suppression…" : "Supprimer"}
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

/* ── Popover ────────────────────────────────────────────────────────────────── */

function PopoverDemo() {
  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Placement: bottom (défaut)
        </p>
        <Popover.Root>
          <Popover.Trigger style={btnStyle}>Ouvrir popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content style={popoverStyle}>
              <Popover.Title style={{ ...titleStyle, fontSize: "0.9rem" }}>
                Popover title
              </Popover.Title>
              <Popover.Description style={descStyle}>
                Non-modal — Echap et outside-click ferment. Stack registry inclus.
              </Popover.Description>
              <Popover.Close style={btnGhostStyle}>×</Popover.Close>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Placement: top</p>
        <Popover.Root positioning={{ placement: "top" }}>
          <Popover.Trigger style={btnStyle}>Top popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content style={popoverStyle}>
              <Popover.Description style={{ ...descStyle, marginBottom: 0 }}>
                Positionné au-dessus du trigger.
              </Popover.Description>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Avec Popover.Arrow
        </p>
        <Popover.Root>
          <Popover.Trigger style={btnStyle}>Arrow popover</Popover.Trigger>
          <Popover.Portal>
            <Popover.Content style={{ ...popoverStyle, position: "relative" }}>
              {/* Arrow — Floating UI centre left/top via JS; data-side allows CSS rotation */}
              <Popover.Arrow>
                <svg
                  width="12"
                  height="6"
                  viewBox="0 0 12 6"
                  style={{ position: "absolute", top: "-6px" }}
                  aria-hidden="true"
                >
                  <path
                    d="M0,6 L6,0 L12,6 Z"
                    fill="#fff"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    strokeLinejoin="round"
                  />
                </svg>
              </Popover.Arrow>
              <Popover.Description style={{ ...descStyle, marginBottom: 0 }}>
                La flèche est centrée par Floating UI. Utilisez <code>data-side</code> pour la
                rotation CSS.
              </Popover.Description>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────────────────────── */

function SelectDemo() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Select simple</p>
        <Select.Root onValueChange={setValue}>
          <Select.Label style={labelStyle}>Framework</Select.Label>
          <Select.Trigger style={selectTriggerStyle}>
            <Select.Value>
              {/* Select.Placeholder : visible seulement quand aucune valeur n'est sélectionnée */}
              <Select.Placeholder style={{ color: "#94a3b8" }}>
                Choisir un framework…
              </Select.Placeholder>
            </Select.Value>
            <span style={{ marginLeft: "auto", opacity: 0.5 }}>▾</span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content style={selectContentStyle}>
              <Select.Item value="react" style={selectItemStyle}>
                React
              </Select.Item>
              <Select.Item value="vue" style={selectItemStyle}>
                Vue
              </Select.Item>
              <Select.Item value="angular" style={selectItemStyle}>
                Angular
              </Select.Item>
              <Select.Separator style={separatorStyle} />
              <Select.Item value="svelte" style={selectItemStyle}>
                Svelte
              </Select.Item>
              <Select.Item value="solid" style={selectItemStyle}>
                Solid
              </Select.Item>
              <Select.Item value="qwik" disabled style={{ ...selectItemStyle, opacity: 0.4 }}>
                Qwik (désactivé)
              </Select.Item>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
        {value.length > 0 && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
            Valeur: <code>{value[0]}</code>
          </p>
        )}
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Avec groupes</p>
        <Select.Root>
          <Select.Label style={labelStyle}>Langage</Select.Label>
          <Select.Trigger style={selectTriggerStyle}>
            <Select.Value placeholder="Choisir…" />
            <span style={{ marginLeft: "auto", opacity: 0.5 }}>▾</span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content style={selectContentStyle}>
              <Select.Group>
                <Select.GroupLabel style={groupLabelStyle}>Frontend</Select.GroupLabel>
                <Select.Item value="ts" style={selectItemStyle}>
                  TypeScript
                </Select.Item>
                <Select.Item value="js" style={selectItemStyle}>
                  JavaScript
                </Select.Item>
              </Select.Group>
              <Select.Separator style={separatorStyle} />
              <Select.Group>
                <Select.GroupLabel style={groupLabelStyle}>Backend</Select.GroupLabel>
                <Select.Item value="go" style={selectItemStyle}>
                  Go
                </Select.Item>
                <Select.Item value="rust" style={selectItemStyle}>
                  Rust
                </Select.Item>
                <Select.Item value="python" style={selectItemStyle}>
                  Python
                </Select.Item>
              </Select.Group>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>
    </div>
  );
}

/* ── Select multiple ─────────────────────────────────────────────────────────── */

function SelectMultipleDemo() {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div>
      <Select.Root multiple onValueChange={setValues}>
        <Select.Label style={labelStyle}>Intérêts</Select.Label>
        <Select.Trigger style={selectTriggerStyle}>
          <Select.Value placeholder="Sélectionner plusieurs…" />
          <span style={{ marginLeft: "auto", opacity: 0.5 }}>▾</span>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content style={selectContentStyle}>
            <Select.Item value="design" style={selectItemStyle}>
              Design
            </Select.Item>
            <Select.Item value="dev" style={selectItemStyle}>
              Développement
            </Select.Item>
            <Select.Item value="ux" style={selectItemStyle}>
              UX Research
            </Select.Item>
            <Select.Item value="perf" style={selectItemStyle}>
              Performance
            </Select.Item>
            <Select.Item value="a11y" style={selectItemStyle}>
              Accessibilité
            </Select.Item>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      {values.length > 0 && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
          Sélectionnés: <code>{values.join(", ")}</code>
        </p>
      )}
    </div>
  );
}

/* ── Checkbox ───────────────────────────────────────────────────────────────── */

function CheckboxDemo() {
  const [checked, setChecked] = useState<boolean | "indeterminate">("indeterminate");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Checkbox.Root defaultChecked>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Checkbox.Control style={checkboxControlStyle}>
            <Checkbox.Indicator style={checkboxIndicatorStyle}>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label style={checkboxLabelStyle}>
            Accepter les CGU (uncontrolled)
          </Checkbox.Label>
        </div>
      </Checkbox.Root>

      <Checkbox.Root checked={checked} onCheckedChange={setChecked}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Checkbox.Control style={checkboxControlStyle}>
            <Checkbox.Indicator style={checkboxIndicatorStyle}>
              {checked === "indeterminate" ? "—" : "✓"}
            </Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label style={checkboxLabelStyle}>
            Controlled — état: <code>{String(checked)}</code>
          </Checkbox.Label>
        </div>
      </Checkbox.Root>

      <Checkbox.Root disabled>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Checkbox.Control style={{ ...checkboxControlStyle, opacity: 0.4 }}>
            <Checkbox.Indicator style={checkboxIndicatorStyle}>✓</Checkbox.Indicator>
          </Checkbox.Control>
          <Checkbox.Label style={{ ...checkboxLabelStyle, opacity: 0.4 }}>Désactivé</Checkbox.Label>
        </div>
      </Checkbox.Root>
    </div>
  );
}

/* ── Checkbox.Group ─────────────────────────────────────────────────────────── */

function CheckboxGroupDemo() {
  const [values, setValues] = useState<string[]>(["react"]);
  const items = [
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Checkbox.Group value={values} onValueChange={setValues}>
        <Checkbox.GroupAll>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}
          >
            <Checkbox.Control style={{ ...checkboxControlStyle, background: "#f1f5f9" }}>
              <Checkbox.Indicator style={checkboxIndicatorStyle}>
                {values.length === items.length ? "✓" : "—"}
              </Checkbox.Indicator>
            </Checkbox.Control>
            <Checkbox.Label style={{ ...checkboxLabelStyle, fontWeight: 600 }}>
              Tout sélectionner
            </Checkbox.Label>
          </div>
        </Checkbox.GroupAll>
        {items.map((item) => (
          <Checkbox.Root key={item.value} value={item.value}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                paddingLeft: "1.25rem",
              }}
            >
              <Checkbox.Control style={checkboxControlStyle}>
                <Checkbox.Indicator style={checkboxIndicatorStyle}>✓</Checkbox.Indicator>
              </Checkbox.Control>
              <Checkbox.Label style={checkboxLabelStyle}>{item.label}</Checkbox.Label>
            </div>
          </Checkbox.Root>
        ))}
      </Checkbox.Group>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
        Sélectionnés: <code>{values.join(", ") || "aucun"}</code>
      </p>
    </div>
  );
}

/* ── Switch ─────────────────────────────────────────────────────────────────── */

function SwitchDemo() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <Switch.Root checked={on} onCheckedChange={setOn}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Switch.Control style={switchControlStyle(on)}>
            <Switch.Thumb style={switchThumbStyle(on)} />
          </Switch.Control>
          <Switch.Label style={checkboxLabelStyle}>
            Notifications — <code>{on ? "activées" : "désactivées"}</code>
          </Switch.Label>
        </div>
      </Switch.Root>

      <Switch.Root defaultChecked disabled>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", opacity: 0.4 }}>
          <Switch.Control style={switchControlStyle(true)}>
            <Switch.Thumb style={switchThumbStyle(true)} />
          </Switch.Control>
          <Switch.Label style={checkboxLabelStyle}>Désactivé (on)</Switch.Label>
        </div>
      </Switch.Root>

      <Switch.Root invalid>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Switch.Control
            style={{
              ...switchControlStyle(false),
              borderColor: "#dc2626",
              outline: "1px solid #dc2626",
            }}
          >
            <Switch.Thumb style={switchThumbStyle(false)} />
          </Switch.Control>
          <Switch.Label style={{ ...checkboxLabelStyle, color: "#dc2626" }}>
            État invalide (data-invalid + aria-invalid)
          </Switch.Label>
        </div>
      </Switch.Root>
    </div>
  );
}

/* ── Tooltip ────────────────────────────────────────────────────────────────── */

function TooltipDemo() {
  return (
    <Tooltip.Provider openDelay={400} closeDelay={200} skipDelay={300}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <Tooltip.Root>
          <Tooltip.Trigger style={btnStyle}>Survol (400ms)</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={tooltipStyle}>
              Ouvre après 400ms — délai Provider
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger style={btnStyle}>Skip-delay</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={tooltipStyle}>
              S'ouvre instantanément si un tooltip vient de fermer
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root interactive>
          <Tooltip.Trigger style={btnStyle}>Interactive</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={{ ...tooltipStyle, padding: "0.5rem 0.75rem" }}>
              <p style={{ margin: 0, marginBottom: "0.25rem", fontSize: "0.8rem" }}>
                Cliquez le lien ↓
              </p>
              {/* biome-ignore lint/a11y/useValidAnchor: demo interactive */}
              <a href="#" style={{ color: "#38bdf8", fontSize: "0.8rem" }}>
                Lien dans le tooltip
              </a>
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root disabled>
          <Tooltip.Trigger style={{ ...btnStyle, opacity: 0.5 }} disabled>
            Désactivé
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={tooltipStyle}>Ne s'affiche pas</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root positioning={{ placement: "bottom" }}>
          <Tooltip.Trigger style={btnGhostStyle}>Placement bas</Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content style={tooltipStyle}>placement=&quot;bottom&quot;</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        <Tooltip.Root>
          <Tooltip.Trigger style={btnGhostStyle}>Anchor demo</Tooltip.Trigger>
          {/* Tooltip.Anchor redirige le positioner vers cet élément au lieu du trigger */}
          <Tooltip.Anchor>
            <span
              style={{
                display: "inline-block",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#f59e0b",
                marginLeft: "0.5rem",
                verticalAlign: "middle",
              }}
            />
          </Tooltip.Anchor>
          <Tooltip.Portal>
            <Tooltip.Content style={tooltipStyle}>Positionné sur le point orange ↑</Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
  );
}

const tooltipStyle: React.CSSProperties = {
  background: "#1e293b",
  color: "#f1f5f9",
  borderRadius: "6px",
  padding: "0.35rem 0.6rem",
  fontSize: "0.8rem",
  boxShadow: "0 4px 12px rgb(0 0 0 / 0.2)",
  maxWidth: "240px",
};

/* ── HoverCard ──────────────────────────────────────────────────────────────── */

function HoverCardDemo() {
  return (
    <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
      <HoverCard.Root>
        {/* biome-ignore lint/a11y/useValidAnchor: demo */}
        <HoverCard.Trigger asChild>
          <a
            href="#"
            style={{
              color: "#6366f1",
              fontWeight: 500,
              fontSize: "0.9rem",
              textDecoration: "underline",
            }}
            onClick={(e) => e.preventDefault()}
          >
            @forge-ui
          </a>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content style={hoverCardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.5rem",
              }}
            >
              <div style={avatarStyle}>F</div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>forge-ui</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>
                  @forge-ui · headless UI
                </p>
              </div>
            </div>
            <p
              style={{
                margin: "0 0 0.5rem",
                fontSize: "0.8rem",
                color: "#374151",
                lineHeight: 1.5,
              }}
            >
              Bibliothèque de primitives UI headless. Architecture 3 niveaux : machine → connect →
              bindings.
            </p>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b" }}>
              <span>
                <strong style={{ color: "#1e293b" }}>142</strong> Following
              </span>
              <span>
                <strong style={{ color: "#1e293b" }}>2.4k</strong> Followers
              </span>
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      <HoverCard.Root positioning={{ placement: "bottom" }}>
        {/* biome-ignore lint/a11y/useValidAnchor: demo */}
        <HoverCard.Trigger asChild>
          <a
            href="#"
            style={{
              color: "#6366f1",
              fontWeight: 500,
              fontSize: "0.9rem",
              textDecoration: "underline",
            }}
            onClick={(e) => e.preventDefault()}
          >
            Placement bottom
          </a>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content style={hoverCardStyle}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#374151" }}>
              HoverCard positionné en dessous. Survolez le contenu pour maintenir l'ouverture.
            </p>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>
    </div>
  );
}

const hoverCardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "1rem",
  minWidth: "260px",
  maxWidth: "320px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
};

const avatarStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  background: "#6366f1",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "1.1rem",
  flexShrink: 0,
};

/* ── Field ──────────────────────────────────────────────────────────────────── */

function FieldDemo() {
  const [invalid, setInvalid] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <Field.Root invalid={invalid} required>
        <Field.Label style={labelStyle}>
          Email <Field.RequiredIndicator style={{ color: "#dc2626", marginLeft: "0.15rem" }} />
        </Field.Label>
        <Field.Control>
          <input
            type="email"
            placeholder="vous@exemple.fr"
            style={{
              padding: "0.5rem",
              border: "1px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "0.875rem",
              width: "220px",
            }}
            onBlur={(e) => setInvalid(e.target.value.length > 0 && !e.target.value.includes("@"))}
          />
        </Field.Control>
        <Field.Description style={{ fontSize: "0.75rem", color: "#64748b" }}>
          Entrez votre adresse e-mail.
        </Field.Description>
        <Field.Error style={{ fontSize: "0.75rem", color: "#dc2626" }}>
          Adresse e-mail invalide.
        </Field.Error>
      </Field.Root>

      <Field.Group
        data-testid="field-group"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Field.GroupLabel style={labelStyle}>Notifications</Field.GroupLabel>
        <Field.Root>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Field.Control>
              <input type="checkbox" id="react-notif-email" />
            </Field.Control>
            <Field.Label htmlFor="react-notif-email" style={{ fontSize: "0.875rem" }}>
              Par email
            </Field.Label>
          </div>
        </Field.Root>
        <Field.Root>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Field.Control>
              <input type="checkbox" id="react-notif-sms" />
            </Field.Control>
            <Field.Label htmlFor="react-notif-sms" style={{ fontSize: "0.875rem" }}>
              Par SMS
            </Field.Label>
          </div>
        </Field.Root>
      </Field.Group>
    </div>
  );
}

/* ── Combobox ───────────────────────────────────────────────────────────────── */

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

function ComboboxDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Single-select (filtre client-side)
        </p>
        <Combobox.Root onValueChange={setSelected}>
          <Combobox.Label style={labelStyle}>Langage préféré</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{
                padding: "0.45rem 0.6rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
                width: "200px",
              }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ▾
            </Combobox.Trigger>
            <Combobox.ClearTrigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ✕
            </Combobox.ClearTrigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item
                  key={l.value}
                  value={l.value}
                  label={l.label}
                  style={comboboxItemStyle}
                >
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
        {selected.length > 0 && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
            Sélectionné : {selected.join(", ")}
          </p>
        )}
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Multi-select avec TagsInput
        </p>
        <Combobox.Root multiple>
          <Combobox.Label style={labelStyle}>Langages maîtrisés</Combobox.Label>
          {/* Tags affichés au-dessus de l'input */}
          <Combobox.TagsInput
            style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}
          >
            {languages.map((l) => (
              <Combobox.Tag
                key={l.value}
                value={l.value}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 6px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                {l.label}
                <Combobox.TagDelete
                  value={l.value}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    color: "#3b82f6",
                    fontSize: "0.75rem",
                    lineHeight: 1,
                  }}
                >
                  ✕
                </Combobox.TagDelete>
              </Combobox.Tag>
            ))}
          </Combobox.TagsInput>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              data-testid="combobox-tags-input"
              style={{
                padding: "0.45rem 0.6rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
                width: "200px",
              }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ▾
            </Combobox.Trigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item
                  key={l.value}
                  value={l.value}
                  label={l.label}
                  style={comboboxItemStyle}
                >
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Avec groupes</p>
        <Combobox.Root>
          <Combobox.Label style={labelStyle}>Langage</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{
                padding: "0.45rem 0.6rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
                width: "200px",
              }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ▾
            </Combobox.Trigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              <Combobox.Group>
                <Combobox.GroupLabel style={groupLabelStyle}>Frontend</Combobox.GroupLabel>
                {[
                  { value: "ts", label: "TypeScript" },
                  { value: "js", label: "JavaScript" },
                ].map((l) => (
                  <Combobox.Item
                    key={l.value}
                    value={l.value}
                    label={l.label}
                    style={comboboxItemStyle}
                  >
                    <Combobox.ItemText>{l.label}</Combobox.ItemText>
                  </Combobox.Item>
                ))}
              </Combobox.Group>
              <Combobox.Group>
                <Combobox.GroupLabel style={groupLabelStyle}>Backend</Combobox.GroupLabel>
                {[
                  { value: "py", label: "Python" },
                  { value: "rs", label: "Rust" },
                  { value: "go", label: "Go" },
                ].map((l) => (
                  <Combobox.Item
                    key={l.value}
                    value={l.value}
                    label={l.label}
                    style={comboboxItemStyle}
                  >
                    <Combobox.ItemText>{l.label}</Combobox.ItemText>
                  </Combobox.Item>
                ))}
              </Combobox.Group>
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Creatable — crée une option absente
        </p>
        <Combobox.Root onCreateOption={(v) => console.log("Créer:", v)}>
          <Combobox.Label style={labelStyle}>Langage personnalisé</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{
                padding: "0.45rem 0.6rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
                width: "200px",
              }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ▾
            </Combobox.Trigger>
            <Combobox.ClearTrigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>
              ✕
            </Combobox.ClearTrigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item
                  key={l.value}
                  value={l.value}
                  label={l.label}
                  style={comboboxItemStyle}
                >
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
              <Combobox.CreateOption
                style={{ ...comboboxItemStyle, fontStyle: "italic", color: "#6366f1" }}
              />
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>
    </div>
  );
}

const comboboxContentStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none",
  margin: 0,
  maxHeight: "200px",
  overflowY: "auto",
};

const comboboxItemStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  borderRadius: "4px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
};

/* ── asChild ────────────────────────────────────────────────────────────────── */

function AsChildDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {/* biome-ignore lint/a11y/useValidAnchor: demo asChild */}
        <a href="#" style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}>
          Ouvrir via &lt;a&gt; (asChild)
        </a>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={titleStyle}>asChild demo</Dialog.Title>
          <Dialog.Description style={descStyle}>
            Le trigger est un <code>&lt;a&gt;</code> — forge a mergé ses props sans wrapper button.
          </Dialog.Description>
          <div style={footerStyle}>
            <Dialog.Close style={btnStyle}>Fermer</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── TagsInput ──────────────────────────────────────────────────────────────── */

function TagsInputDemo() {
  const [tags, setTags] = useState<string[]>(["TypeScript", "React"]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <TagsInput.Root
        value={tags}
        onValueChange={setTags}
        style={{
          border: "1px solid #cbd5e1",
          borderRadius: "8px",
          padding: "0.375rem 0.5rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "0.375rem",
          alignItems: "center",
          background: "#fff",
          cursor: "text",
          minWidth: "280px",
        }}
      >
        {tags.map((tag) => (
          <TagsInput.Tag
            key={tag}
            value={tag}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              background: "#e2e8f0",
              borderRadius: "4px",
              padding: "0.15rem 0.375rem 0.15rem 0.5rem",
              fontSize: "0.875rem",
              color: "#1e293b",
            }}
          >
            {tag}
            <TagsInput.TagDelete
              value={tag}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                color: "#64748b",
                padding: "0 0.1rem",
                lineHeight: 1,
                fontSize: "1rem",
              }}
            />
          </TagsInput.Tag>
        ))}
        <TagsInput.Input
          style={{
            border: "none",
            outline: "none",
            fontSize: "0.875rem",
            minWidth: "120px",
            flex: 1,
            background: "transparent",
            padding: "0.15rem 0",
          }}
          placeholder="Ajouter un tag…"
        />
      </TagsInput.Root>
      {tags.length > 0 && (
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>Tags : {tags.join(", ")}</p>
      )}
    </div>
  );
}

/* ── Accordion ──────────────────────────────────────────────────────────────── */

function AccordionDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <Accordion.Root type="single" collapsible defaultValue={[]}>
        <Accordion.Item value="what">
          <Accordion.Header>
            <Accordion.Trigger
              data-testid="accordion-trigger-what"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Qu'est-ce que forge-ui ? <span aria-hidden="true">▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content
            data-testid="accordion-content-what"
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid #e2e8f0",
              borderTop: "none",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            Une bibliothèque de composants UI headless avec architecture 3 niveaux.
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="why" style={{ marginTop: "0.5rem" }}>
          <Accordion.Header>
            <Accordion.Trigger
              data-testid="accordion-trigger-why"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 500,
              }}
            >
              Pourquoi headless ? <span aria-hidden="true">▾</span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content
            data-testid="accordion-content-why"
            style={{
              padding: "0.75rem 1rem",
              border: "1px solid #e2e8f0",
              borderTop: "none",
              fontSize: "0.875rem",
              color: "#374151",
            }}
          >
            Vous gardez le contrôle total du CSS — aucun style imposé.
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}

/* ── Collapsible ─────────────────────────────────────────────────────────────── */

function CollapsibleDemo() {
  return (
    <Collapsible.Root style={{ width: "100%", maxWidth: "400px" }}>
      <Collapsible.Trigger
        data-testid="collapsible-trigger"
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: 500,
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        Voir les détails <span aria-hidden="true">▾</span>
      </Collapsible.Trigger>
      <Collapsible.Content
        data-testid="collapsible-content"
        style={{
          padding: "0.75rem 1rem",
          border: "1px solid #e2e8f0",
          borderTop: "none",
          fontSize: "0.875rem",
          color: "#374151",
        }}
      >
        Contenu masqué révélé par le trigger collapsible.
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

/* ── Tabs ────────────────────────────────────────────────────────────────────── */

function TabsDemo() {
  return (
    <div style={{ width: "100%", maxWidth: "400px" }}>
      <Tabs.Root defaultValue="react">
        <Tabs.List
          data-testid="tabs-list"
          style={{ display: "flex", borderBottom: "2px solid #e2e8f0", gap: "0.25rem" }}
        >
          <Tabs.Trigger
            value="react"
            data-testid="tabs-trigger-react"
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            React
          </Tabs.Trigger>
          <Tabs.Trigger
            value="vue"
            data-testid="tabs-trigger-vue"
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Vue
          </Tabs.Trigger>
          <Tabs.Trigger
            value="nuxt"
            data-testid="tabs-trigger-nuxt"
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: 500,
            }}
          >
            Nuxt
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel
          value="react"
          data-testid="tabs-panel-react"
          style={{ padding: "1rem 0", fontSize: "0.875rem", color: "#374151" }}
        >
          React — bibliothèque UI pour créer des interfaces composant.
        </Tabs.Panel>
        <Tabs.Panel
          value="vue"
          data-testid="tabs-panel-vue"
          style={{ padding: "1rem 0", fontSize: "0.875rem", color: "#374151" }}
        >
          Vue — framework progressif pour les interfaces utilisateur.
        </Tabs.Panel>
        <Tabs.Panel
          value="nuxt"
          data-testid="tabs-panel-nuxt"
          style={{ padding: "1rem 0", fontSize: "0.875rem", color: "#374151" }}
        >
          Nuxt — framework full-stack basé sur Vue.
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
}

/* ── Progress ────────────────────────────────────────────────────────────────── */

function ProgressDemo() {
  const [value, setValue] = useState(42);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      <Progress.Root
        value={value}
        max={100}
        aria-label="Chargement"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Progress.Label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
            Chargement
          </Progress.Label>
          <Progress.ValueText
            data-testid="progress-value"
            style={{ fontSize: "0.875rem", color: "#64748b" }}
          />
        </div>
        <Progress.Track
          data-testid="progress-track"
          style={{
            height: "8px",
            background: "#e2e8f0",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <Progress.Fill
            data-testid="progress-fill"
            style={{
              height: "100%",
              background: "#1e293b",
              transition: "width 0.3s",
              borderRadius: "999px",
            }}
          />
        </Progress.Track>
      </Progress.Root>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button style={btnStyle} onClick={() => setValue((v) => Math.max(0, v - 10))}>
          −10
        </button>
        <button style={btnStyle} onClick={() => setValue((v) => Math.min(100, v + 10))}>
          +10
        </button>
      </div>
      <Progress.Root
        data-testid="progress-indeterminate"
        aria-label="Indéterminé"
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <Progress.Label style={{ fontSize: "0.875rem", fontWeight: 500 }}>
          Indéterminé
        </Progress.Label>
        <Progress.Track
          style={{
            height: "8px",
            background: "#e2e8f0",
            borderRadius: "999px",
            overflow: "hidden",
          }}
        >
          <Progress.Fill style={{ height: "100%", background: "#6366f1", borderRadius: "999px" }} />
        </Progress.Track>
      </Progress.Root>
    </div>
  );
}

/* ── RadioGroup ──────────────────────────────────────────────────────────────── */

function RadioGroupDemo() {
  const [value, setValue] = useState<string>("react");
  return (
    <>
      <style>{`
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
      `}</style>
      <RadioGroup.Root
        value={value}
        onValueChange={setValue}
        name="framework"
        style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      >
        {[
          { value: "react", label: "React" },
          { value: "vue", label: "Vue" },
          { value: "angular", label: "Angular" },
        ].map((opt) => (
          <RadioGroup.Item
            key={opt.value}
            value={opt.value}
            data-testid={`radio-item-${opt.value}`}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}
            >
              <RadioGroup.Radio />
              <RadioGroup.Label
                style={{ fontSize: "0.875rem", color: "#1e293b", cursor: "pointer" }}
              >
                {opt.label}
              </RadioGroup.Label>
            </div>
            <RadioGroup.HiddenInput />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </>
  );
}

/* ── Slider ──────────────────────────────────────────────────────────────────── */

const PRICE_MARKS = [
  { value: 0, label: "0€" },
  { value: 25, label: "25€" },
  { value: 50, label: "50€" },
  { value: 75, label: "75€" },
  { value: 100, label: "100€" },
];

function SliderDemo() {
  const [value, setValue] = useState(50);
  const [range, setRange] = useState([20, 80]);
  const [vertical, setVertical] = useState(60);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        width: "100%",
        maxWidth: "360px",
      }}
    >
      {/* Horizontal avec marks */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Prix max</span>
          <code data-testid="slider-value" style={{ fontSize: "0.875rem", color: "#64748b" }}>
            {value}€
          </code>
        </div>
        <Slider.Root
          value={value}
          onValueChange={(vals) => setValue(vals[0] ?? 0)}
          min={0}
          max={100}
          step={25}
          marks={PRICE_MARKS}
          style={{ position: "relative", height: "28px", display: "flex", alignItems: "center" }}
          data-testid="slider-root"
        >
          <Slider.Track
            data-testid="slider-track"
            style={{
              position: "relative",
              height: "4px",
              background: "#e2e8f0",
              borderRadius: "2px",
              flexGrow: 1,
            }}
          >
            <Slider.Range
              style={{
                position: "absolute",
                height: "100%",
                background: "#1e293b",
                borderRadius: "2px",
              }}
            />
          </Slider.Track>
          <Slider.Thumb
            aria-label="Prix max"
            data-testid="slider-thumb"
            style={{
              display: "block",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #1e293b",
              boxShadow: "0 1px 4px rgb(0 0 0 / 0.15)",
              cursor: "grab",
            }}
          />
          <Slider.MarkerGroup style={{ position: "absolute", width: "100%", top: "20px", left: 0 }}>
            {PRICE_MARKS.map((m) => (
              <Slider.Marker
                key={m.value}
                value={m.value}
                style={{ fontSize: "0.7rem", color: "#94a3b8", whiteSpace: "nowrap" }}
              >
                {m.label}
              </Slider.Marker>
            ))}
          </Slider.MarkerGroup>
        </Slider.Root>
      </div>

      {/* Range slider (2 thumbs) */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Fourchette</span>
          <code style={{ fontSize: "0.875rem", color: "#64748b" }}>
            {range[0]}–{range[1]}
          </code>
        </div>
        <Slider.Root
          value={range}
          onValueChange={(vals) => setRange(vals)}
          min={0}
          max={100}
          step={1}
          style={{ position: "relative", height: "20px", display: "flex", alignItems: "center" }}
          data-testid="slider-range-root"
        >
          <Slider.Track
            style={{
              position: "relative",
              height: "4px",
              background: "#e2e8f0",
              borderRadius: "2px",
              flexGrow: 1,
            }}
          >
            <Slider.Range
              style={{
                position: "absolute",
                height: "100%",
                background: "#6366f1",
                borderRadius: "2px",
              }}
            />
          </Slider.Track>
          <Slider.Thumb
            index={0}
            aria-label="Minimum"
            style={{
              display: "block",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #6366f1",
              cursor: "grab",
            }}
          />
          <Slider.Thumb
            index={1}
            aria-label="Maximum"
            style={{
              display: "block",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #6366f1",
              cursor: "grab",
            }}
          />
        </Slider.Root>
      </div>

      {/* Vertical */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>Volume vertical</span>
        <Slider.Root
          value={vertical}
          onValueChange={(vals) => setVertical(vals[0] ?? 0)}
          orientation="vertical"
          min={0}
          max={100}
          step={1}
          data-testid="slider-vertical-root"
          style={{
            position: "relative",
            width: "20px",
            height: "120px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Slider.Track
            style={{
              position: "absolute",
              width: "4px",
              height: "100%",
              background: "#e2e8f0",
              borderRadius: "2px",
            }}
          >
            <Slider.Range
              style={{
                position: "absolute",
                width: "100%",
                background: "#1e293b",
                borderRadius: "2px",
              }}
            />
          </Slider.Track>
          <Slider.Thumb
            aria-label="Volume"
            style={{
              display: "block",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#fff",
              border: "2px solid #1e293b",
              cursor: "grab",
            }}
          />
        </Slider.Root>
        <code style={{ fontSize: "0.875rem", color: "#64748b" }}>{vertical}</code>
      </div>
    </div>
  );
}

/* ── NumberInput ─────────────────────────────────────────────────────────────── */

function NumberInputDemo() {
  const [value, setValue] = useState<number | null>(50);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <NumberInput.Root
          defaultValue={50}
          min={0}
          max={100}
          step={1}
          onValueChange={(v) => setValue(v)}
        >
          <NumberInput.Label style={labelStyle}>Quantité</NumberInput.Label>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.35rem" }}
          >
            <NumberInput.DecrementTrigger
              data-testid="number-input-decrement"
              style={btnGhostStyle}
            >
              −
            </NumberInput.DecrementTrigger>
            <NumberInput.Input
              data-testid="number-input-input"
              aria-label="Quantité"
              style={{
                width: "80px",
                textAlign: "center",
                padding: "0.45rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
              }}
            />
            <NumberInput.IncrementTrigger
              data-testid="number-input-increment"
              style={btnGhostStyle}
            >
              +
            </NumberInput.IncrementTrigger>
          </div>
          <code
            data-testid="number-input-value"
            style={{ fontSize: "0.8rem", color: "#64748b", display: "block", marginTop: "0.35rem" }}
          >
            valeur: {value ?? "vide"}
          </code>
          <NumberInput.HiddenInput name="quantity" />
        </NumberInput.Root>
      </div>

      <div>
        <NumberInput.Root defaultValue={25} min={0} max={100} disabled>
          <NumberInput.Label style={{ ...labelStyle, opacity: 0.5 }}>Désactivé</NumberInput.Label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginTop: "0.35rem",
              opacity: 0.5,
            }}
          >
            <NumberInput.DecrementTrigger
              data-testid="number-input-decrement-disabled"
              style={btnGhostStyle}
            >
              −
            </NumberInput.DecrementTrigger>
            <NumberInput.Input
              data-testid="number-input-input-disabled"
              aria-label="Quantité désactivée"
              style={{
                width: "80px",
                textAlign: "center",
                padding: "0.45rem",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.875rem",
              }}
            />
            <NumberInput.IncrementTrigger
              data-testid="number-input-increment-disabled"
              style={btnGhostStyle}
            >
              +
            </NumberInput.IncrementTrigger>
          </div>
        </NumberInput.Root>
      </div>
    </div>
  );
}

/* ── DateField ──────────────────────────────────────────────────────────────── */

function DateFieldDemo() {
  const [date, setDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <DateField.Root
        data-testid="date-field-root"
        locale={locale}
        onValueChange={(d) => setDate(d)}
      >
        <DateField.Group
          data-testid="date-field-group"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            padding: "0.45rem 0.75rem",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.875rem",
            background: "#fff",
            fontVariantNumeric: "tabular-nums",
            cursor: "text",
          }}
        >
          <DateField.MonthSegment
            data-testid="date-field-month"
            style={{
              minWidth: "3ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
          <DateField.Separator style={{ color: "#94a3b8", userSelect: "none" }} />
          <DateField.DaySegment
            data-testid="date-field-day"
            style={{
              minWidth: "2ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
          <DateField.Separator style={{ color: "#94a3b8", userSelect: "none" }} />
          <DateField.YearSegment
            data-testid="date-field-year"
            style={{
              minWidth: "4ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
        </DateField.Group>
        <DateField.HiddenInput name="date" />
      </DateField.Root>
      {date && (
        <p
          data-testid="date-field-value"
          style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}
        >
          Date : {date.year}-{String(date.month).padStart(2, "0")}-
          {String(date.day).padStart(2, "0")}
        </p>
      )}
    </div>
  );
}

/* ── TimePicker ─────────────────────────────────────────────────────────────── */

function TimePickerDemo() {
  const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(
    null,
  );
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <TimePicker.Root
        data-testid="time-picker-root"
        locale={locale}
        onValueChange={(t) => setTime(t)}
      >
        <TimePicker.Group
          data-testid="time-picker-group"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            padding: "0.45rem 0.75rem",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.875rem",
            background: "#fff",
            fontVariantNumeric: "tabular-nums",
            cursor: "text",
          }}
        >
          <TimePicker.HoursSegment
            data-testid="time-picker-hours"
            style={{
              minWidth: "2ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
          <TimePicker.Separator style={{ color: "#94a3b8", userSelect: "none" }} />
          <TimePicker.MinutesSegment
            data-testid="time-picker-minutes"
            style={{
              minWidth: "2ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
          <TimePicker.Separator style={{ color: "#94a3b8", userSelect: "none" }} />
          <TimePicker.SecondsSegment
            data-testid="time-picker-seconds"
            style={{
              minWidth: "2ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
          <span style={{ marginLeft: "4px" }} />
          <TimePicker.PeriodSegment
            data-testid="time-picker-period"
            style={{
              minWidth: "2ch",
              outline: "none",
              padding: "1px 2px",
              borderRadius: "3px",
              cursor: "default",
            }}
          />
        </TimePicker.Group>
        <TimePicker.HiddenInput name="time" />
      </TimePicker.Root>
      {time && (
        <p
          data-testid="time-picker-value"
          style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}
        >
          Heure : {String(time.hours).padStart(2, "0")}:{String(time.minutes).padStart(2, "0")}:
          {String(time.seconds).padStart(2, "0")}
        </p>
      )}
    </div>
  );
}

/* ── DatePicker ─────────────────────────────────────────────────────────────── */

const calendarCellStyle = {
  textAlign: "center" as const,
  padding: "5px 2px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "0.8rem",
  lineHeight: 1,
};

const calPickerCellStyle = {
  textAlign: "center" as const,
  padding: "8px 4px",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "0.8rem",
};

function DatePickerCalendarContent() {
  const api = useDatePickerContext();
  const navBtn = {
    padding: "0.25rem 0.6rem",
    background: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.9rem",
  };
  // "open.month" handles no navigation events — only day/year views have prev/next buttons
  const prevBtn =
    api.view === "day" ? (
      <DatePicker.PrevMonthButton data-testid="date-picker-prev" style={navBtn}>
        ←
      </DatePicker.PrevMonthButton>
    ) : api.view === "year" ? (
      <DatePicker.PrevYearRangeButton style={navBtn}>←</DatePicker.PrevYearRangeButton>
    ) : (
      <span style={{ width: "2rem" }} />
    );
  const nextBtn =
    api.view === "day" ? (
      <DatePicker.NextMonthButton data-testid="date-picker-next" style={navBtn}>
        →
      </DatePicker.NextMonthButton>
    ) : api.view === "year" ? (
      <DatePicker.NextYearRangeButton style={navBtn}>→</DatePicker.NextYearRangeButton>
    ) : (
      <span style={{ width: "2rem" }} />
    );
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.75rem",
        }}
      >
        {prevBtn}
        <DatePicker.ViewSwitchButton
          data-testid="date-picker-header"
          style={{
            fontWeight: 600,
            fontSize: "0.875rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
            borderRadius: "6px",
          }}
        >
          {api.monthYearLabel}
        </DatePicker.ViewSwitchButton>
        {nextBtn}
      </div>

      {api.view === "day" && (
        <DatePicker.CalendarGrid
          data-testid="date-picker-grid"
          style={{ display: "grid", gap: "2px" }}
        >
          <DatePicker.CalendarRow
            weekIndex={-1}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "2px",
              marginBottom: "4px",
            }}
          >
            {api.weekdays.map((_, i) => (
              <DatePicker.WeekdayHeader
                key={i}
                dayIndex={i}
                style={{
                  textAlign: "center",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                }}
              />
            ))}
          </DatePicker.CalendarRow>
          {api.weeks.map((week, wi) => (
            <DatePicker.CalendarRow
              key={wi}
              weekIndex={wi}
              style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}
            >
              {week.map((cell) => (
                <DatePicker.CalendarCell
                  key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
                  date={cell.date}
                  isOutsideMonth={cell.isOutsideMonth}
                  style={{ ...calendarCellStyle, opacity: cell.isOutsideMonth ? 0.35 : 1 }}
                />
              ))}
            </DatePicker.CalendarRow>
          ))}
        </DatePicker.CalendarGrid>
      )}

      {api.view === "month" && (
        <DatePicker.MonthGrid
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <DatePicker.MonthCell key={i} month={i + 1} style={calPickerCellStyle} />
          ))}
        </DatePicker.MonthGrid>
      )}

      {api.view === "year" && (
        <DatePicker.YearGrid
          style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "4px" }}
        >
          {api.yearRange.map((year) => (
            <DatePicker.YearCell key={year} year={year} style={calPickerCellStyle} />
          ))}
        </DatePicker.YearGrid>
      )}
    </>
  );
}

function DatePickerDemo() {
  const [selected, setSelected] = useState<string | null>(null);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <DatePicker.Root
          data-testid="date-picker-root"
          locale={locale}
          firstDayOfWeek={1}
          onValueChange={(d) =>
            setSelected(
              d
                ? `${d.year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`
                : null,
            )
          }
        >
          <DatePicker.Trigger data-testid="date-picker-trigger" style={btnStyle}>
            {selected ?? "Choisir une date"}
          </DatePicker.Trigger>
          <DatePicker.Content
            data-testid="date-picker-content"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "1rem",
              boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
              zIndex: 50,
              minWidth: "280px",
            }}
          >
            <DatePickerCalendarContent />
          </DatePicker.Content>
          <DatePicker.HiddenInput name="date" />
        </DatePicker.Root>
      </div>
      {selected && (
        <p
          data-testid="date-picker-value"
          style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}
        >
          Sélectionné : {selected}
        </p>
      )}
    </div>
  );
}

/* ── DateRangePicker ─────────────────────────────────────────────────────────── */

function DateRangePickerCalendarGrid() {
  const api = useDateRangePickerContext();
  const weeks = api.weeksPerMonth[0] ?? [];
  return (
    <DateRangePicker.CalendarGrid style={{ display: "grid", gap: "2px" }}>
      <DateRangePicker.CalendarRow
        weekIndex={-1}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          marginBottom: "4px",
        }}
      >
        {api.weekdays.map((_, i) => (
          <DateRangePicker.WeekdayHeader
            key={i}
            dayIndex={i}
            style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8" }}
          />
        ))}
      </DateRangePicker.CalendarRow>
      {weeks.map((week, wi) => (
        <DateRangePicker.CalendarRow
          key={wi}
          weekIndex={wi}
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}
        >
          {week.map((cell) => (
            <DateRangePicker.CalendarCell
              key={`${cell.date.year}-${cell.date.month}-${cell.date.day}`}
              date={cell.date}
              isOutsideMonth={cell.isOutsideMonth}
              style={{ ...calendarCellStyle, opacity: cell.isOutsideMonth ? 0.35 : 1 }}
            />
          ))}
        </DateRangePicker.CalendarRow>
      ))}
    </DateRangePicker.CalendarGrid>
  );
}

function DateRangePickerDemo() {
  const [range, setRange] = useState<string | null>(null);
  const locale = typeof navigator !== "undefined" ? navigator.language : "en";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <DateRangePicker.Root
          data-testid="date-range-picker-root"
          locale={locale}
          firstDayOfWeek={1}
          numberOfMonths={1}
          onValueChange={(r) => {
            if (r?.start && r?.end) {
              setRange(
                `${r.start.year}-${String(r.start.month).padStart(2, "0")}-${String(r.start.day).padStart(2, "0")} → ${r.end.year}-${String(r.end.month).padStart(2, "0")}-${String(r.end.day).padStart(2, "0")}`,
              );
            } else {
              setRange(null);
            }
          }}
        >
          <DateRangePicker.Trigger data-testid="date-range-picker-trigger" style={btnStyle}>
            {range ?? "Choisir une plage"}
          </DateRangePicker.Trigger>
          <DateRangePicker.Content
            data-testid="date-range-picker-content"
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "1rem",
              boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
              zIndex: 50,
              minWidth: "300px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.75rem",
              }}
            >
              <DateRangePicker.PrevMonthButton
                data-testid="date-range-picker-prev"
                style={{ ...btnGhostStyle, padding: "0.25rem 0.6rem" }}
              >
                ←
              </DateRangePicker.PrevMonthButton>
              <DateRangePicker.CalendarHeader
                data-testid="date-range-picker-header"
                style={{ fontWeight: 600, fontSize: "0.875rem" }}
              />
              <DateRangePicker.NextMonthButton
                data-testid="date-range-picker-next"
                style={{ ...btnGhostStyle, padding: "0.25rem 0.6rem" }}
              >
                →
              </DateRangePicker.NextMonthButton>
            </div>
            <DateRangePickerCalendarGrid />
            <DateRangePicker.ClearButton
              data-testid="date-range-picker-clear"
              style={{ ...btnGhostStyle, marginTop: "0.75rem", width: "100%" }}
            >
              Effacer
            </DateRangePicker.ClearButton>
          </DateRangePicker.Content>
          <DateRangePicker.HiddenInputs startName="start" endName="end" />
        </DateRangePicker.Root>
      </div>
      {range && (
        <p
          data-testid="date-range-picker-value"
          style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}
        >
          Plage : {range}
        </p>
      )}
    </div>
  );
}

/* ── Section wrapper ────────────────────────────────────────────────────────── */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>{title}</h2>
      <p style={sectionDescStyle}>{description}</p>
      {children}
    </section>
  );
}

/* ── Toggle ─────────────────────────────────────────────────────────────────── */

function toggleStyle(pressed: boolean, extra?: React.CSSProperties): React.CSSProperties {
  return {
    padding: "0.5rem 1rem",
    border: `1px solid ${pressed ? "#1e293b" : "#cbd5e1"}`,
    borderRadius: "6px",
    cursor: "pointer",
    background: pressed ? "#1e293b" : "transparent",
    color: pressed ? "#fff" : "inherit",
    transition: "background 120ms, border-color 120ms, color 120ms",
    ...extra,
  };
}

function ToggleDemo() {
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(true);
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
      <Toggle
        data-testid="toggle-bold"
        pressed={bold}
        onPressedChange={setBold}
        aria-label="Gras"
        style={toggleStyle(bold, { fontWeight: "bold" })}
      >
        <VisuallyHidden>Activer le</VisuallyHidden>B
      </Toggle>

      <Toggle
        data-testid="toggle-italic"
        pressed={italic}
        onPressedChange={setItalic}
        aria-label="Italique"
        style={toggleStyle(italic, { fontStyle: "italic" })}
      >
        I
      </Toggle>

      <Toggle
        data-testid="toggle-disabled"
        disabled
        aria-label="Souligné (désactivé)"
        style={{
          ...toggleStyle(false),
          border: "1px solid #e2e8f0",
          cursor: "not-allowed",
          opacity: 0.4,
          textDecoration: "underline",
        }}
      >
        U
      </Toggle>
    </div>
  );
}

/* ── ToggleGroup ─────────────────────────────────────────────────────────────── */

function toggleGroupItemStyle(active: boolean, extra?: React.CSSProperties): React.CSSProperties {
  return {
    padding: "0.5rem 0.75rem",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: active ? "#1e293b" : "transparent",
    color: active ? "#fff" : "inherit",
    transition: "background 120ms, color 120ms",
    ...extra,
  };
}

function ToggleGroupDemo() {
  const [align, setAlign] = useState<string[]>([]);
  const [formats, setFormats] = useState<string[]>([]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ToggleGroup.Root
        data-testid="toggle-group-text-align"
        type="single"
        value={align}
        onValueChange={setAlign}
        aria-label="Alignement du texte"
        style={{
          display: "inline-flex",
          gap: "0.25rem",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "0.25rem",
        }}
      >
        <ToggleGroup.Item
          value="left"
          aria-label="Aligner à gauche"
          style={toggleGroupItemStyle(align.includes("left"))}
        >
          ←
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="center"
          aria-label="Centrer"
          style={toggleGroupItemStyle(align.includes("center"))}
        >
          ↔
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="right"
          aria-label="Aligner à droite"
          style={toggleGroupItemStyle(align.includes("right"))}
        >
          →
        </ToggleGroup.Item>
      </ToggleGroup.Root>

      <ToggleGroup.Root
        data-testid="toggle-group-formatting"
        type="multiple"
        value={formats}
        onValueChange={(v) => setFormats(v)}
        aria-label="Formatage du texte"
        style={{
          display: "inline-flex",
          gap: "0.25rem",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "0.25rem",
        }}
      >
        <ToggleGroup.Item
          value="bold"
          aria-label="Gras"
          style={toggleGroupItemStyle(formats.includes("bold"), { fontWeight: "bold" })}
        >
          B
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="italic"
          aria-label="Italique"
          style={toggleGroupItemStyle(formats.includes("italic"), { fontStyle: "italic" })}
        >
          I
        </ToggleGroup.Item>
        <ToggleGroup.Item
          value="underline"
          aria-label="Souligné"
          style={toggleGroupItemStyle(formats.includes("underline"), {
            textDecoration: "underline",
          })}
        >
          U
        </ToggleGroup.Item>
      </ToggleGroup.Root>
    </div>
  );
}

/* ── Separator ───────────────────────────────────────────────────────────────── */

function SeparatorDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "400px" }}>
      <p style={{ margin: 0 }}>Contenu au-dessus</p>

      <Separator
        data-testid="separator-semantic"
        style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: 0 }}
      />

      <p style={{ margin: 0 }}>Séparateur sémantique (role=separator)</p>

      <Separator
        data-testid="separator-decorative"
        decorative
        style={{ border: "none", borderTop: "1px dashed #e2e8f0", margin: 0 }}
      />

      <p style={{ margin: 0 }}>Séparateur décoratif (role=none, aria-hidden)</p>
    </div>
  );
}

/* ── VisuallyHidden ──────────────────────────────────────────────────────────── */

function VisuallyHiddenDemo() {
  return (
    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
      <button
        data-testid="icon-button-with-visually-hidden"
        style={btnStyle}
        aria-label={undefined}
      >
        ✕ <VisuallyHidden>Fermer la fenêtre</VisuallyHidden>
      </button>
      <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
        Le bouton ci-dessus a un label SR "Fermer la fenêtre" invisible visuellement.
      </span>
    </div>
  );
}

/* ── Menu (DropdownMenu) ─────────────────────────────────────────────────────── */

function MenuDemo() {
  const [lastSelect, setLastSelect] = useState<string | null>(null);
  const [theme, setTheme] = useState("system");
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(true);
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <Menu.Root onSelect={setLastSelect}>
        <Menu.Trigger style={btnStyle}>Actions ▾</Menu.Trigger>
        <Menu.Portal>
          <Menu.Content style={menuContentStyle}>
            <Menu.Label style={menuGroupLabelStyle}>Fichier</Menu.Label>
            {/* navigate prop — simule une navigation router */}
            <Menu.Item
              value="new"
              label="Nouveau"
              style={menuItemStyle}
              navigate={() => console.log("[navigate] /new")}
            >
              Nouveau fichier
            </Menu.Item>
            <Menu.Item value="open" label="Ouvrir" style={menuItemStyle}>
              Ouvrir…
            </Menu.Item>
            <Menu.Separator style={menuSepStyle} />
            <Menu.Group id="edit-group">
              <Menu.GroupLabel groupId="edit-group" style={menuGroupLabelStyle}>
                Edition
              </Menu.GroupLabel>
              <Menu.Item value="cut" label="Couper" style={menuItemStyle}>
                Couper
              </Menu.Item>
              <Menu.Item value="copy" label="Copier" style={menuItemStyle}>
                Copier
              </Menu.Item>
              <Menu.Item
                value="paste"
                label="Coller"
                disabled
                style={{ ...menuItemStyle, opacity: 0.45 }}
              >
                Coller
              </Menu.Item>
            </Menu.Group>
            <Menu.Separator style={menuSepStyle} />
            <Menu.Label style={menuGroupLabelStyle}>Theme</Menu.Label>
            <Menu.RadioGroup groupId="theme" value={theme} onValueChange={setTheme}>
              {(["light", "dark", "system"] as const).map((t) => (
                <Menu.RadioItem key={t} value={t} style={menuItemStyle} closeOnSelect={false}>
                  <Menu.ItemIndicator>
                    <span style={{ marginRight: 6 }}>✓</span>
                  </Menu.ItemIndicator>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Menu.RadioItem>
              ))}
            </Menu.RadioGroup>
            <Menu.Separator style={menuSepStyle} />
            <Menu.Label style={menuGroupLabelStyle}>Vue</Menu.Label>
            <Menu.CheckboxItem
              value="grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
              style={menuItemStyle}
            >
              <Menu.ItemIndicator>
                <span style={{ marginRight: 6 }}>✓</span>
              </Menu.ItemIndicator>
              Grille
            </Menu.CheckboxItem>
            <Menu.CheckboxItem
              value="ruler"
              checked={showRuler}
              onCheckedChange={setShowRuler}
              style={menuItemStyle}
            >
              <Menu.ItemIndicator>
                <span style={{ marginRight: 6 }}>✓</span>
              </Menu.ItemIndicator>
              Regle
            </Menu.CheckboxItem>
            <Menu.Separator style={menuSepStyle} />
            {/* Sub 2 niveaux */}
            <Menu.Sub>
              <Menu.SubTrigger value="share" label="Partager" style={menuItemStyle}>
                Partager ▶
              </Menu.SubTrigger>
              <Menu.SubContent style={menuContentStyle}>
                <Menu.Item value="share-link" label="Lien" style={menuItemStyle}>
                  Lien
                </Menu.Item>
                <Menu.Item value="share-email" label="Email" style={menuItemStyle}>
                  Email
                </Menu.Item>
                <Menu.Separator style={menuSepStyle} />
                <Menu.Sub>
                  <Menu.SubTrigger value="social" label="Social" style={menuItemStyle}>
                    Reseaux ▶
                  </Menu.SubTrigger>
                  <Menu.SubContent style={menuContentStyle}>
                    <Menu.Item value="twitter" style={menuItemStyle}>
                      Twitter
                    </Menu.Item>
                    <Menu.Item value="linkedin" style={menuItemStyle}>
                      LinkedIn
                    </Menu.Item>
                  </Menu.SubContent>
                </Menu.Sub>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
        {lastSelect && <div>Selection : {lastSelect}</div>}
        <div>Theme : {theme}</div>
        <div>
          Grille : {showGrid ? "oui" : "non"} | Regle : {showRuler ? "oui" : "non"}
        </div>
      </div>
    </div>
  );
}

/* ── Menu — Sub click-only ────────────────────────────────────────────────────── */

function MenuClickOnlySubDemo() {
  const [lastSelect, setLastSelect] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <Menu.Root onSelect={setLastSelect}>
        <Menu.Trigger style={btnStyle}>Options ▾</Menu.Trigger>
        <Menu.Portal>
          <Menu.Content style={menuContentStyle}>
            <Menu.Item value="action-a" style={menuItemStyle}>
              Action A
            </Menu.Item>
            <Menu.Item value="action-b" style={menuItemStyle}>
              Action B
            </Menu.Item>
            <Menu.Separator style={menuSepStyle} />
            {/* openOnHover={false} — only click opens the sub-menu */}
            <Menu.Sub>
              <Menu.SubTrigger value="more" label="Plus" style={menuItemStyle} openOnHover={false}>
                Plus (clic) ▶
              </Menu.SubTrigger>
              <Menu.SubContent style={menuContentStyle}>
                <Menu.Item value="advanced-a" style={menuItemStyle}>
                  Avance A
                </Menu.Item>
                <Menu.Item value="advanced-b" style={menuItemStyle}>
                  Avance B
                </Menu.Item>
              </Menu.SubContent>
            </Menu.Sub>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
        {lastSelect && <div>Selection : {lastSelect}</div>}
        <div style={{ color: "#94a3b8" }}>Hover ne suffit pas — clic requis</div>
      </div>
    </div>
  );
}

/* ── Menu — Anchor ───────────────────────────────────────────────────────────── */

function MenuAnchorDemo() {
  const [open, setOpen] = useState(false);
  const [lastSelect, setLastSelect] = useState<string | null>(null);
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <Menu.Root open={open} onOpenChange={setOpen} onSelect={setLastSelect}>
        {/* Anchor — the positioner will float relative to this element */}
        <Menu.Anchor>
          <div
            style={{
              width: "200px",
              padding: "0.5rem",
              background: "#f1f5f9",
              border: "2px dashed #94a3b8",
              borderRadius: "8px",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "#64748b",
            }}
          >
            Ancre (reference)
          </div>
        </Menu.Anchor>
        <Menu.Trigger style={{ ...btnStyle, marginTop: "0.5rem" }}>
          {open ? "Fermer" : "Ouvrir (ancre)"}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Content style={menuContentStyle}>
            <Menu.Item value="profile" style={menuItemStyle}>
              Profil
            </Menu.Item>
            <Menu.Item value="settings" style={menuItemStyle}>
              Parametres
            </Menu.Item>
            <Menu.Separator style={menuSepStyle} />
            <Menu.Item value="logout" style={menuItemStyle}>
              Deconnexion
            </Menu.Item>
          </Menu.Content>
        </Menu.Portal>
      </Menu.Root>
      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
        {lastSelect && <div>Selection : {lastSelect}</div>}
        <div style={{ color: "#94a3b8" }}>
          Le menu se positionne par rapport a l'ancre (cadre tirete)
        </div>
      </div>
    </div>
  );
}

/* ── ContextMenu ──────────────────────────────────────────────────────────────── */

function ContextMenuDemo() {
  const [lastSelect, setLastSelect] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
      <ContextMenu.Root onSelect={setLastSelect}>
        <ContextMenu.Trigger>
          <div
            style={{
              width: "200px",
              height: "80px",
              background: "#1e40af",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "0.8rem",
              userSelect: "none",
            }}
          >
            Clic-droit ici
          </div>
        </ContextMenu.Trigger>
        <ContextMenu.Portal>
          <ContextMenu.Content style={menuContentStyle}>
            <ContextMenu.Item value="inspect" style={menuItemStyle}>
              Inspecter
            </ContextMenu.Item>
            <ContextMenu.Item value="reload" style={menuItemStyle}>
              Recharger
            </ContextMenu.Item>
            <ContextMenu.Separator style={menuSepStyle} />
            <ContextMenu.CheckboxItem
              value="bookmark"
              checked={bookmarked}
              onCheckedChange={setBookmarked}
              style={menuItemStyle}
            >
              <ContextMenu.ItemIndicator>
                <span style={{ marginRight: 6 }}>★</span>
              </ContextMenu.ItemIndicator>
              Marquer comme favori
            </ContextMenu.CheckboxItem>
            <ContextMenu.Separator style={menuSepStyle} />
            {/* ContextMenu.Sub — nested sub-menu */}
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger value="share" label="Partager" style={menuItemStyle}>
                Partager ▶
              </ContextMenu.SubTrigger>
              <ContextMenu.SubContent style={menuContentStyle}>
                <ContextMenu.Item value="share-link" style={menuItemStyle}>
                  Lien
                </ContextMenu.Item>
                <ContextMenu.Item value="share-email" style={menuItemStyle}>
                  Email
                </ContextMenu.Item>
                <ContextMenu.Separator style={menuSepStyle} />
                <ContextMenu.Sub>
                  <ContextMenu.SubTrigger value="social" label="Social" style={menuItemStyle}>
                    Reseaux ▶
                  </ContextMenu.SubTrigger>
                  <ContextMenu.SubContent style={menuContentStyle}>
                    <ContextMenu.Item value="twitter" style={menuItemStyle}>
                      Twitter
                    </ContextMenu.Item>
                    <ContextMenu.Item value="linkedin" style={menuItemStyle}>
                      LinkedIn
                    </ContextMenu.Item>
                  </ContextMenu.SubContent>
                </ContextMenu.Sub>
              </ContextMenu.SubContent>
            </ContextMenu.Sub>
            <ContextMenu.Separator style={menuSepStyle} />
            <ContextMenu.Item value="copy-link" style={menuItemStyle}>
              Copier le lien
            </ContextMenu.Item>
          </ContextMenu.Content>
        </ContextMenu.Portal>
      </ContextMenu.Root>
      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
        {lastSelect && <div>Selection : {lastSelect}</div>}
        <div>Favori : {bookmarked ? "★" : "☆"}</div>
      </div>
    </div>
  );
}

/* ── Avatar ──────────────────────────────────────────────────────────────────── */

function AvatarDemo() {
  return (
    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center", flexWrap: "wrap" }}>
      {/* Broken image → immediate fallback */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
      >
        <Avatar.Root style={avatarRootStyle}>
          <Avatar.Image src="https://invalid.domain/broken.jpg" alt="Bob" style={avatarImgStyle} />
          <Avatar.Fallback style={avatarFallbackStyle}>BO</Avatar.Fallback>
        </Avatar.Root>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Image cassée</span>
      </div>

      {/* No src → immediate fallback */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
      >
        <Avatar.Root style={avatarRootStyle}>
          <Avatar.Image alt="Carol" style={avatarImgStyle} />
          <Avatar.Fallback style={avatarFallbackStyle}>CA</Avatar.Fallback>
        </Avatar.Root>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Sans image</span>
      </div>

      {/* delayMs on Fallback (not Root) — prevents flash-of-fallback */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
      >
        <Avatar.Root style={avatarRootStyle}>
          <Avatar.Image src="https://invalid.domain/slow.jpg" alt="Dave" style={avatarImgStyle} />
          <Avatar.Fallback delayMs={600} style={avatarFallbackStyle}>
            DA
          </Avatar.Fallback>
        </Avatar.Root>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>delayMs=600 (Fallback)</span>
      </div>

      {/* Auto-initials via compound component pattern + useAvatarContext */}
      <AutoInitialsAvatar name="John Doe" />

      {/* asChild: Fallback rendered as a <div> */}
      <div
        style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
      >
        <Avatar.Root style={avatarRootStyle}>
          <Avatar.Image alt="Eve" style={avatarImgStyle} />
          <Avatar.Fallback asChild style={avatarFallbackStyle}>
            <div>EV</div>
          </Avatar.Fallback>
        </Avatar.Root>
        <span style={{ fontSize: "0.75rem", color: "#64748b" }}>asChild (div)</span>
      </div>
    </div>
  );
}

// Reads initials directly from the Avatar compound component context — no
// standalone hook needed, no duplicate machine. Pattern recommended for apps.
function InitialsFallback({ style }: { style?: React.CSSProperties }) {
  const { initials } = useAvatarContext();
  return <Avatar.Fallback style={style}>{initials}</Avatar.Fallback>;
}

function AutoInitialsAvatar({ name }: { name: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
      <Avatar.Root name={name} style={avatarRootStyle}>
        <Avatar.Image alt={name} style={avatarImgStyle} />
        <InitialsFallback style={avatarFallbackStyle} />
      </Avatar.Root>
      <span style={{ fontSize: "0.75rem", color: "#64748b" }}>initials (context)</span>
    </div>
  );
}

const avatarRootStyle: React.CSSProperties = {
  display: "inline-flex",
  position: "relative",
  width: "48px",
  height: "48px",
  borderRadius: "50%",
  overflow: "hidden",
  background: "#e2e8f0",
};

const avatarImgStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarFallbackStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.875rem",
  fontWeight: 600,
  color: "#475569",
  background: "#e2e8f0",
};

const menuContentStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "4px",
  boxShadow: "0 4px 16px rgb(0 0 0 / 0.12)",
  minWidth: "160px",
  outline: "none",
};

const menuItemStyle: React.CSSProperties = {
  padding: "6px 12px",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.875rem",
  outline: "none",
  userSelect: "none",
};

const menuGroupLabelStyle: React.CSSProperties = {
  padding: "4px 12px 2px",
  fontSize: "0.7rem",
  color: "#94a3b8",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const menuSepStyle: React.CSSProperties = {
  height: "1px",
  background: "#e2e8f0",
  margin: "4px 0",
};

/* ── Styles ─────────────────────────────────────────────────────────────────── */

const mainStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0",
  padding: "2rem",
  maxWidth: "680px",
  margin: "0 auto",
  fontFamily: "system-ui, sans-serif",
};

const sectionStyle: React.CSSProperties = {
  padding: "1.5rem 0",
  borderBottom: "1px solid #e2e8f0",
};

const sectionTitleStyle: React.CSSProperties = {
  margin: "0 0 0.25rem",
  fontSize: "1rem",
  fontWeight: 600,
};

const sectionDescStyle: React.CSSProperties = {
  margin: "0 0 1rem",
  color: "#64748b",
  fontSize: "0.8rem",
};

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
};

const btnGhostStyle: React.CSSProperties = {
  ...btnStyle,
  background: "transparent",
  color: "#1e293b",
  border: "1px solid #cbd5e1",
};

const btnDangerStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#dc2626",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgb(0 0 0 / 0.45)",
};

const contentStyle: React.CSSProperties = {
  position: "fixed",
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

const popoverStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "1rem",
  minWidth: "220px",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
};

const titleStyle: React.CSSProperties = {
  margin: "0 0 0.5rem",
  fontSize: "1.05rem",
  fontWeight: 600,
};

const descStyle: React.CSSProperties = {
  color: "#64748b",
  marginBottom: "1.5rem",
  fontSize: "0.875rem",
  lineHeight: 1.5,
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "0.5rem",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.8rem",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "0.35rem",
};

const selectTriggerStyle: React.CSSProperties = {
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
};

const selectContentStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "0.25rem",
  boxShadow: "0 8px 30px rgb(0 0 0 / 0.12)",
  listStyle: "none",
  margin: 0,
};

const selectItemStyle: React.CSSProperties = {
  padding: "0.45rem 0.75rem",
  borderRadius: "4px",
  fontSize: "0.875rem",
  cursor: "pointer",
  color: "#1e293b",
};

const separatorStyle: React.CSSProperties = {
  height: "1px",
  background: "#e2e8f0",
  margin: "0.25rem 0",
  listStyle: "none",
};

const groupLabelStyle: React.CSSProperties = {
  padding: "0.35rem 0.75rem 0.15rem",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  listStyle: "none",
};

const checkboxControlStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  border: "2px solid #cbd5e1",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  flexShrink: 0,
};

const checkboxIndicatorStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#1e293b",
  lineHeight: 1,
};

const checkboxLabelStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#1e293b",
  cursor: "pointer",
};

function switchControlStyle(on: boolean): React.CSSProperties {
  return {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    background: on ? "#1e293b" : "#cbd5e1",
    border: "none",
    cursor: "pointer",
    padding: "2px",
    display: "flex",
    alignItems: "center",
    transition: "background 0.15s",
    flexShrink: 0,
  };
}

function switchThumbStyle(on: boolean): React.CSSProperties {
  return {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 3px rgb(0 0 0 / 0.2)",
    transform: on ? "translateX(20px)" : "translateX(0)",
    transition: "transform 0.15s",
  };
}
