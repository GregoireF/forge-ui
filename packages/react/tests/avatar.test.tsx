import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, useAvatarContext } from "../src/index.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Render a standard Avatar tree. Omit `src` to start in idle state. */
function makeFixture({
  src,
  alt = "Test User",
  name,
  delayMs,
  forceMount,
  onStatusChange,
}: {
  src?: string;
  alt?: string;
  name?: string;
  delayMs?: number;
  forceMount?: boolean;
  onStatusChange?: (s: string) => void;
} = {}) {
  return (
    <Avatar.Root name={name} alt={alt} onStatusChange={onStatusChange} data-testid="root">
      <Avatar.Image src={src} alt={alt} data-testid="image" />
      <Avatar.Fallback delayMs={delayMs} forceMount={forceMount} data-testid="fallback">
        FB
      </Avatar.Fallback>
    </Avatar.Root>
  );
}

function getImg() {
  return screen.getByTestId("image") as HTMLImageElement;
}

function fireLoad() {
  fireEvent.load(getImg());
}

function fireError() {
  fireEvent.error(getImg());
}

// ---------------------------------------------------------------------------
// Rendering — idle / no src
// ---------------------------------------------------------------------------

describe("Avatar (React) — idle (no src)", () => {
  it("fallback is visible immediately", () => {
    render(makeFixture());
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });

  it("fallback has no aria-hidden when visible", () => {
    render(makeFixture());
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");
  });

  it("root has data-status=idle", () => {
    render(makeFixture());
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "idle");
  });
});

// ---------------------------------------------------------------------------
// Rendering — loading
// ---------------------------------------------------------------------------

describe("Avatar (React) — loading", () => {
  it("fallback visible while loading (delayMs=0 default)", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });

  it("root has data-status=loading", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "loading");
  });

  it("image has data-state=loading", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(getImg()).toHaveAttribute("data-state", "loading");
  });

  it("fallback NOT visible immediately when delayMs > 0", () => {
    vi.useFakeTimers();
    render(makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600 }));
    expect(screen.queryByTestId("fallback")).toBeNull();
    vi.useRealTimers();
  });

  it("fallback appears after delayMs has elapsed", () => {
    vi.useFakeTimers();
    render(makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600 }));
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Rendering — image load success
// ---------------------------------------------------------------------------

describe("Avatar (React) — image loaded", () => {
  it("fallback is removed from DOM after image loads (no forceMount)", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    fireLoad();
    expect(screen.queryByTestId("fallback")).toBeNull();
  });

  it("root has data-status=loaded after image loads", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    fireLoad();
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "loaded");
  });

  it("image has data-state=loaded after image loads", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    fireLoad();
    expect(getImg()).toHaveAttribute("data-state", "loaded");
  });
});

// ---------------------------------------------------------------------------
// Rendering — image error
// ---------------------------------------------------------------------------

describe("Avatar (React) — image error", () => {
  it("fallback is visible after image errors", () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireError();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });

  it("fallback has no aria-hidden after image errors", () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireError();
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");
  });

  it("root has data-status=error after image errors", () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireError();
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "error");
  });
});

// ---------------------------------------------------------------------------
// forceMount
// ---------------------------------------------------------------------------

describe("Avatar (React) — forceMount", () => {
  it("stays in DOM when image loads (data-state=hidden)", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireLoad();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "hidden");
  });

  it("has aria-hidden=true when image is loaded and forceMount is set", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireLoad();
    expect(screen.getByTestId("fallback")).toHaveAttribute("aria-hidden", "true");
  });

  it("forceMount + delayMs: in DOM immediately but CSS-hidden during delay", () => {
    vi.useFakeTimers();
    render(makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600, forceMount: true }));
    // In DOM (forceMount) but hidden (delay not elapsed yet)
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "hidden");
    // After delay: visible
    act(() => vi.advanceTimersByTime(600));
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Initials
// ---------------------------------------------------------------------------

describe("Avatar (React) — initials", () => {
  it("renders initials from name prop via useAvatarContext", () => {
    function InitialsFallback() {
      const { initials } = useAvatarContext();
      return <Avatar.Fallback data-testid="fallback">{initials}</Avatar.Fallback>;
    }
    render(
      <Avatar.Root name="John Doe" data-testid="root">
        <Avatar.Image alt="John Doe" data-testid="image" />
        <InitialsFallback />
      </Avatar.Root>,
    );
    expect(screen.getByTestId("fallback")).toHaveTextContent("JD");
  });

  it("useAvatarContext throws when used outside Avatar.Root", () => {
    function BadConsumer() {
      useAvatarContext();
      return null;
    }
    expect(() => render(<BadConsumer />)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Callbacks
// ---------------------------------------------------------------------------

describe("Avatar (React) — onStatusChange", () => {
  it("fires with 'loaded' when image loads", () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/photo.jpg", onStatusChange: spy }));
    fireLoad();
    expect(spy).toHaveBeenCalledWith("loaded");
  });

  it("fires with 'error' when image errors", () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/broken.jpg", onStatusChange: spy }));
    fireError();
    expect(spy).toHaveBeenCalledWith("error");
  });

  it("fires with 'loading' on initial render with src", () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/photo.jpg", onStatusChange: spy }));
    expect(spy).toHaveBeenCalledWith("loading");
  });
});

// ---------------------------------------------------------------------------
// ARIA / a11y
// ---------------------------------------------------------------------------

describe("Avatar (React) — ARIA", () => {
  it("image has the provided alt text", () => {
    render(makeFixture({ alt: "Alice Smith" }));
    expect(getImg()).toHaveAttribute("alt", "Alice Smith");
  });

  it("root has no ARIA role (presentational container)", () => {
    render(makeFixture());
    expect(screen.getByTestId("root")).not.toHaveAttribute("role");
  });

  it("fallback: no aria-hidden when visible (idle)", () => {
    render(makeFixture());
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");
  });

  it("fallback: aria-hidden=true only when forceMount + image loaded", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireLoad();
    expect(screen.getByTestId("fallback")).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// CSS contract
// ---------------------------------------------------------------------------

describe("Avatar (React) — CSS contract", () => {
  it("root has data-forge-scope=avatar and data-forge-part=root", () => {
    render(makeFixture());
    expect(screen.getByTestId("root")).toHaveAttribute("data-forge-scope", "avatar");
    expect(screen.getByTestId("root")).toHaveAttribute("data-forge-part", "root");
  });

  it("image has data-forge-scope=avatar and data-forge-part=image", () => {
    render(makeFixture());
    expect(getImg()).toHaveAttribute("data-forge-scope", "avatar");
    expect(getImg()).toHaveAttribute("data-forge-part", "image");
  });

  it("fallback has data-forge-scope=avatar and data-forge-part=fallback", () => {
    render(makeFixture());
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-forge-scope", "avatar");
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-forge-part", "fallback");
  });

  it("fallback data-state cycles: visible → (image loads) → removed", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    fireLoad();
    expect(screen.queryByTestId("fallback")).toBeNull();
  });

  it("fallback data-state=visible after image error", () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireError();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });
});
