import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, defineComponent, nextTick } from "vue";
import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  injectAvatarContext,
} from "../src/components/avatar/Avatar.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

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
  return defineComponent({
    components: { AvatarRoot, AvatarImage, AvatarFallback },
    setup: () => ({ src, alt, name, delayMs, forceMount, onStatusChange }),
    template: `
      <AvatarRoot :alt="alt" :name="name" :on-status-change="onStatusChange" data-testid="root">
        <AvatarImage :src="src" :alt="alt" data-testid="image" />
        <AvatarFallback :delay-ms="delayMs" :force-mount="forceMount" data-testid="fallback">
          FB
        </AvatarFallback>
      </AvatarRoot>
    `,
  });
}

function getImg() {
  return screen.getByTestId("image") as HTMLImageElement;
}

// ---------------------------------------------------------------------------
// Idle (no src)
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — idle (no src)", () => {
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
// Loading
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — loading", () => {
  it("fallback visible while loading (delayMs=0 default)", () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });

  it("root has data-status=loading", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    // onMounted fires after initial render; waitFor polls until DOM reflects loading.
    await waitFor(() =>
      expect(screen.getByTestId("root")).toHaveAttribute("data-status", "loading"),
    );
  });

  it("image has data-state=loading", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    await waitFor(() => expect(getImg()).toHaveAttribute("data-state", "loading"));
  });

  it("fallback NOT visible immediately when delayMs > 0", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600 }));
    // Wait for machine to reach loading state (onMounted + setSrc), then the
    // delayMs gate keeps showDelayed=false → fallback unmounts.
    await waitFor(() => expect(screen.queryByTestId("fallback")).toBeNull());
  });

  it("fallback appears after delayMs has elapsed", async () => {
    vi.useFakeTimers();
    render(makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600 }));
    // Reach loading state first (fake timers don't affect Promise/microtask scheduling).
    await waitFor(() => expect(screen.queryByTestId("fallback")).toBeNull());
    // Now advance past the delay.
    vi.advanceTimersByTime(600);
    await nextTick();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// Image loaded
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — image loaded", () => {
  it("fallback removed from DOM after image loads (no forceMount)", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    fireEvent.load(getImg());
    await nextTick();
    expect(screen.queryByTestId("fallback")).toBeNull();
  });

  it("root has data-status=loaded after image loads", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    fireEvent.load(getImg());
    await nextTick();
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "loaded");
  });

  it("image has data-state=loaded", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    fireEvent.load(getImg());
    await nextTick();
    expect(getImg()).toHaveAttribute("data-state", "loaded");
  });
});

// ---------------------------------------------------------------------------
// Image error
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — image error", () => {
  it("fallback visible after image errors", async () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireEvent.error(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });

  it("fallback has no aria-hidden after image errors", async () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireEvent.error(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).not.toHaveAttribute("aria-hidden");
  });

  it("root has data-status=error", async () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireEvent.error(getImg());
    await nextTick();
    expect(screen.getByTestId("root")).toHaveAttribute("data-status", "error");
  });
});

// ---------------------------------------------------------------------------
// forceMount
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — forceMount", () => {
  it("stays in DOM when image loads (data-state=hidden)", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireEvent.load(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "hidden");
  });

  it("aria-hidden=true when image loaded and forceMount is set", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireEvent.load(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).toHaveAttribute("aria-hidden", "true");
  });

  it("forceMount + delayMs: in DOM but CSS-hidden during delay window", async () => {
    vi.useFakeTimers();
    render(
      makeFixture({ src: "https://example.com/photo.jpg", delayMs: 600, forceMount: true }),
    );
    // Wait for machine → loading (onMounted); delayMs gate → data-state=hidden, forceMount keeps in DOM.
    await waitFor(() =>
      expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "hidden"),
    );
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    // After delay: visible.
    vi.advanceTimersByTime(600);
    await nextTick();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    vi.useRealTimers();
  });
});

// ---------------------------------------------------------------------------
// injectAvatarContext
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — injectAvatarContext", () => {
  it("reads initials from the nearest Root", async () => {
    const InitialsFallback = defineComponent({
      components: { AvatarFallback },
      setup() {
        const { initials } = injectAvatarContext();
        const text = computed(() => initials.value);
        return { text };
      },
      template: `<AvatarFallback data-testid="fallback">{{ text }}</AvatarFallback>`,
    });

    render(
      defineComponent({
        components: { AvatarRoot, AvatarImage, InitialsFallback },
        template: `
          <AvatarRoot name="John Doe" data-testid="root">
            <AvatarImage alt="John Doe" data-testid="image" />
            <InitialsFallback />
          </AvatarRoot>
        `,
      }),
    );

    expect(screen.getByTestId("fallback")).toHaveTextContent("JD");
  });

  it("throws when used outside AvatarRoot", () => {
    const BadConsumer = defineComponent({
      setup() {
        injectAvatarContext();
        return () => null;
      },
    });
    expect(() => render(BadConsumer)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// onStatusChange callbacks
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — onStatusChange", () => {
  it("fires with 'loading' on initial render with src", () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/photo.jpg", onStatusChange: spy }));
    expect(spy).toHaveBeenCalledWith("loading");
  });

  it("fires with 'loaded' when image loads", async () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/photo.jpg", onStatusChange: spy }));
    fireEvent.load(getImg());
    await nextTick();
    expect(spy).toHaveBeenCalledWith("loaded");
  });

  it("fires with 'error' when image errors", async () => {
    const spy = vi.fn();
    render(makeFixture({ src: "https://example.com/broken.jpg", onStatusChange: spy }));
    fireEvent.error(getImg());
    await nextTick();
    expect(spy).toHaveBeenCalledWith("error");
  });
});

// ---------------------------------------------------------------------------
// ARIA / a11y
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — ARIA", () => {
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

  it("fallback: aria-hidden=true only when forceMount + image loaded", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg", forceMount: true }));
    fireEvent.load(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).toHaveAttribute("aria-hidden", "true");
  });
});

// ---------------------------------------------------------------------------
// CSS contract
// ---------------------------------------------------------------------------

describe("Avatar (Vue) — CSS contract", () => {
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

  it("fallback cycles: visible → (image loads) → removed from DOM", async () => {
    render(makeFixture({ src: "https://example.com/photo.jpg" }));
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
    fireEvent.load(getImg());
    await waitFor(() => expect(screen.queryByTestId("fallback")).toBeNull());
  });

  it("fallback data-state=visible after image error", async () => {
    render(makeFixture({ src: "https://example.com/broken.jpg" }));
    fireEvent.error(getImg());
    await nextTick();
    expect(screen.getByTestId("fallback")).toHaveAttribute("data-state", "visible");
  });
});
