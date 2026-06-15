import { Dialog, DialogPortal, Popover, useDialog } from "@forge-ui/react";
import { useState } from "react";

export default function App() {
  return (
    <main style={mainStyle}>
      <h1 style={{ margin: 0, fontSize: "1.5rem" }}>forge-ui — React Playground</h1>

      <Section title="Dialog" description="Modal avec Escape + click outside pour fermer.">
        <DialogDemo />
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

      <Section title="Popover" description="Floating, non-modal. Ferme sur outside-click.">
        <PopoverDemo />
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
    </div>
  );
}

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
