import type { CheckboxChecked } from "@forge-ui/react";
import { AlertDialog, Checkbox, Combobox, Dialog, DialogPortal, Field, HoverCard, Popover, Select, Switch, Tooltip, useDialog } from "@forge-ui/react";
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

      <Section
        title="Dialog contrôlé"
        description="open + onOpenChange — état géré à l'extérieur."
      >
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

      <Section title="Select" description="WAI-ARIA 1.2 Select-Only Combobox. Keyboard + typeahead.">
        <SelectDemo />
      </Section>

      <Section title="Select multiple" description="Multi-sélection — reste ouvert après chaque choix.">
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
            Le CSS <code>data-state</code> fait le travail — aucune prop <code>forceMount</code> nécessaire.
            Le système <code>watchPresence</code> lit <code>animationDuration</code> et maintient le composant
            monté jusqu'à <code>animationend</code>.
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
            Cette action est irréversible. Toutes vos données seront supprimées.
            Escape et click en dehors ne ferment <strong>pas</strong> ce dialog.
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
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Placement: top
        </p>
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
                  <path d="M0,6 L6,0 L12,6 Z" fill="#fff" stroke="#e2e8f0" strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </Popover.Arrow>
              <Popover.Description style={{ ...descStyle, marginBottom: 0 }}>
                La flèche est centrée par Floating UI. Utilisez <code>data-side</code> pour la rotation CSS.
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
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Select simple
        </p>
        <Select.Root onValueChange={setValue}>
          <Select.Label style={labelStyle}>Framework</Select.Label>
          <Select.Trigger style={selectTriggerStyle}>
            <Select.Value>
              {/* Select.Placeholder : visible seulement quand aucune valeur n'est sélectionnée */}
              <Select.Placeholder style={{ color: "#94a3b8" }}>Choisir un framework…</Select.Placeholder>
            </Select.Value>
            <span style={{ marginLeft: "auto", opacity: 0.5 }}>▾</span>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content style={selectContentStyle}>
              <Select.Item value="react" style={selectItemStyle}>React</Select.Item>
              <Select.Item value="vue" style={selectItemStyle}>Vue</Select.Item>
              <Select.Item value="angular" style={selectItemStyle}>Angular</Select.Item>
              <Select.Separator style={separatorStyle} />
              <Select.Item value="svelte" style={selectItemStyle}>Svelte</Select.Item>
              <Select.Item value="solid" style={selectItemStyle}>Solid</Select.Item>
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
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Avec groupes
        </p>
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
                <Select.Item value="ts" style={selectItemStyle}>TypeScript</Select.Item>
                <Select.Item value="js" style={selectItemStyle}>JavaScript</Select.Item>
              </Select.Group>
              <Select.Separator style={separatorStyle} />
              <Select.Group>
                <Select.GroupLabel style={groupLabelStyle}>Backend</Select.GroupLabel>
                <Select.Item value="go" style={selectItemStyle}>Go</Select.Item>
                <Select.Item value="rust" style={selectItemStyle}>Rust</Select.Item>
                <Select.Item value="python" style={selectItemStyle}>Python</Select.Item>
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
            <Select.Item value="design" style={selectItemStyle}>Design</Select.Item>
            <Select.Item value="dev" style={selectItemStyle}>Développement</Select.Item>
            <Select.Item value="ux" style={selectItemStyle}>UX Research</Select.Item>
            <Select.Item value="perf" style={selectItemStyle}>Performance</Select.Item>
            <Select.Item value="a11y" style={selectItemStyle}>Accessibilité</Select.Item>
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
          <Checkbox.Label style={checkboxLabelStyle}>Accepter les CGU (uncontrolled)</Checkbox.Label>
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
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
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
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingLeft: "1.25rem" }}>
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
          <Switch.Control style={{ ...switchControlStyle(false), borderColor: "#dc2626", outline: "1px solid #dc2626" }}>
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
              <p style={{ margin: 0, marginBottom: "0.25rem", fontSize: "0.8rem" }}>Cliquez le lien ↓</p>
              {/* biome-ignore lint/a11y/useValidAnchor: demo interactive */}
              <a href="#" style={{ color: "#38bdf8", fontSize: "0.8rem" }}>Lien dans le tooltip</a>
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
            <span style={{ display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b", marginLeft: "0.5rem", verticalAlign: "middle" }} />
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
            style={{ color: "#6366f1", fontWeight: 500, fontSize: "0.9rem", textDecoration: "underline" }}
            onClick={(e) => e.preventDefault()}
          >
            @forge-ui
          </a>
        </HoverCard.Trigger>
        <HoverCard.Portal>
          <HoverCard.Content style={hoverCardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <div style={avatarStyle}>F</div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "0.9rem" }}>forge-ui</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>@forge-ui · headless UI</p>
              </div>
            </div>
            <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#374151", lineHeight: 1.5 }}>
              Bibliothèque de primitives UI headless. Architecture 3 niveaux : machine → connect → bindings.
            </p>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "#64748b" }}>
              <span><strong style={{ color: "#1e293b" }}>142</strong> Following</span>
              <span><strong style={{ color: "#1e293b" }}>2.4k</strong> Followers</span>
            </div>
          </HoverCard.Content>
        </HoverCard.Portal>
      </HoverCard.Root>

      <HoverCard.Root positioning={{ placement: "bottom" }}>
        {/* biome-ignore lint/a11y/useValidAnchor: demo */}
        <HoverCard.Trigger asChild>
          <a
            href="#"
            style={{ color: "#6366f1", fontWeight: 500, fontSize: "0.9rem", textDecoration: "underline" }}
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
            style={{ padding: "0.5rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", width: "220px" }}
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
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Single-select (filtre client-side)</p>
        <Combobox.Root onValueChange={setSelected}>
          <Combobox.Label style={labelStyle}>Langage préféré</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{ padding: "0.45rem 0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", width: "200px" }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>▾</Combobox.Trigger>
            <Combobox.ClearTrigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>✕</Combobox.ClearTrigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item key={l.value} value={l.value} label={l.label} style={comboboxItemStyle}>
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
        {selected.length > 0 && <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>Sélectionné : {selected.join(", ")}</p>}
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>Multi-select</p>
        <Combobox.Root multiple>
          <Combobox.Label style={labelStyle}>Langages maîtrisés</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{ padding: "0.45rem 0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", width: "200px" }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>▾</Combobox.Trigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item key={l.value} value={l.value} label={l.label} style={comboboxItemStyle}>
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
            </Combobox.Content>
          </Combobox.Portal>
        </Combobox.Root>
      </div>

      <div>
        <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#64748b" }}>
          Avec groupes
        </p>
        <Combobox.Root>
          <Combobox.Label style={labelStyle}>Langage</Combobox.Label>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            <Combobox.Input
              style={{ padding: "0.45rem 0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", width: "200px" }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>▾</Combobox.Trigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              <Combobox.Group>
                <Combobox.GroupLabel style={groupLabelStyle}>Frontend</Combobox.GroupLabel>
                {[{ value: "ts", label: "TypeScript" }, { value: "js", label: "JavaScript" }].map((l) => (
                  <Combobox.Item key={l.value} value={l.value} label={l.label} style={comboboxItemStyle}>
                    <Combobox.ItemText>{l.label}</Combobox.ItemText>
                  </Combobox.Item>
                ))}
              </Combobox.Group>
              <Combobox.Group>
                <Combobox.GroupLabel style={groupLabelStyle}>Backend</Combobox.GroupLabel>
                {[{ value: "py", label: "Python" }, { value: "rs", label: "Rust" }, { value: "go", label: "Go" }].map((l) => (
                  <Combobox.Item key={l.value} value={l.value} label={l.label} style={comboboxItemStyle}>
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
              style={{ padding: "0.45rem 0.6rem", border: "1px solid #cbd5e1", borderRadius: "6px", fontSize: "0.875rem", width: "200px" }}
            />
            <Combobox.Trigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>▾</Combobox.Trigger>
            <Combobox.ClearTrigger style={{ ...btnGhostStyle, padding: "0.45rem 0.6rem" }}>✕</Combobox.ClearTrigger>
          </div>
          <Combobox.Portal>
            <Combobox.Content style={comboboxContentStyle}>
              {languages.map((l) => (
                <Combobox.Item key={l.value} value={l.value} label={l.label} style={comboboxItemStyle}>
                  <Combobox.ItemIndicator value={l.value}>✓ </Combobox.ItemIndicator>
                  <Combobox.ItemText>{l.label}</Combobox.ItemText>
                </Combobox.Item>
              ))}
              <Combobox.CreateOption style={{ ...comboboxItemStyle, fontStyle: "italic", color: "#6366f1" }} />
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
