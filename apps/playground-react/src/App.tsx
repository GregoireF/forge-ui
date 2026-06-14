import { Dialog, DialogPortal, useDialog } from "@forge-ui/react";

export default function App() {
  return (
    <main style={{ display: "flex", flexDirection: "column", gap: "3rem", padding: "2rem" }}>
      <h1 style={{ margin: 0 }}>forge-ui — React Playground</h1>

      {/* Primary demo — E2E tests target this section */}
      <section>
        <h2 style={{ marginBottom: "0.25rem" }}>
          Compound API <code>Dialog.*</code>
        </h2>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Radix-style components. Supports <code>asChild</code>, <code>forceMount</code>, and
          portal.
        </p>
        <CompoundDemo />
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />

      <section>
        <h2 style={{ marginBottom: "0.25rem" }}>
          Hook API <code>useDialog</code>
        </h2>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Full control — spread props manually onto any element.
        </p>
        <HookDemo />
      </section>

      <hr style={{ border: "none", borderTop: "1px solid #e2e8f0" }} />

      <section>
        <h2 style={{ marginBottom: "0.25rem" }}>asChild demo</h2>
        <p style={{ color: "#64748b", marginBottom: "1rem", fontSize: "0.875rem" }}>
          Forge merges aria/data props onto your element — no wrapper button.
        </p>
        <AsChildDemo />
      </section>
    </main>
  );
}

/* ── Hook API demo ─────────────────────────────────────────────────────────── */

function HookDemo() {
  const dialog = useDialog({
    onOpen: () => console.log("[forge-ui] hook dialog opened"),
    onClose: () => console.log("[forge-ui] hook dialog closed"),
  });

  return (
    <>
      <button {...dialog.getTriggerProps()} style={btnStyle}>
        Open (hook)
      </button>

      {dialog.isOpen && (
        <DialogPortal>
          <div {...dialog.getBackdropProps()} style={backdropStyle} />
          <div {...dialog.getContentProps()} style={contentStyle}>
            <h2 {...dialog.getTitleProps()} style={{ marginBottom: "0.5rem" }}>
              Hook dialog
            </h2>
            <p {...dialog.getDescriptionProps()} style={descStyle}>
              Opened via <code>useDialog()</code>. Every aria and data attribute is provided by
              forge.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button {...dialog.getCloseProps()} style={btnStyle}>
                Close
              </button>
            </div>
          </div>
        </DialogPortal>
      )}
    </>
  );
}

/* ── Compound API demo ─────────────────────────────────────────────────────── */

function CompoundDemo() {
  return (
    <Dialog.Root onOpen={() => console.log("[forge-ui] compound dialog opened")}>
      <Dialog.Trigger style={btnStyle}>Open dialog</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay style={backdropStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={{ marginBottom: "0.5rem" }}>Compound dialog</Dialog.Title>
          <Dialog.Description style={descStyle}>
            Opened via <code>{"<Dialog.Root>"}</code>. Context is shared automatically.
          </Dialog.Description>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Dialog.Close style={btnStyle}>Close</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── asChild demo ──────────────────────────────────────────────────────────── */

function AsChildDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {/* forge merges aria-expanded, aria-controls, data-state, onClick onto this <a> */}
        {/* biome-ignore lint/a11y/useValidAnchor: playground demo of asChild pattern */}
        <a href="#" style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}>
          Open via &lt;a&gt; (asChild)
        </a>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay style={backdropStyle} />
        <Dialog.Content style={contentStyle}>
          <Dialog.Title style={{ marginBottom: "0.5rem" }}>asChild dialog</Dialog.Title>
          <Dialog.Description style={descStyle}>
            The trigger is an <code>&lt;a&gt;</code> tag — forge merged its props onto it with no
            wrapper button.
          </Dialog.Description>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Dialog.Close asChild>
              {/* biome-ignore lint/a11y/useValidAnchor: playground demo of asChild pattern */}
              <a href="#" style={{ ...btnStyle, display: "inline-block", textDecoration: "none" }}>
                Close via &lt;a&gt;
              </a>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Shared styles (inline — zero deps) ───────────────────────────────────── */

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  cursor: "pointer",
  background: "#1e293b",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  fontSize: "0.875rem",
};

const backdropStyle: React.CSSProperties = {
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
  boxShadow: "0 24px 64px rgb(0 0 0 / 0.18)",
};

const descStyle: React.CSSProperties = {
  color: "#64748b",
  marginBottom: "1.5rem",
  fontSize: "0.9rem",
};
