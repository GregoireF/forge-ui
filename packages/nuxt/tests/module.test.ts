import { addComponent, addImports } from "@nuxt/kit";
import { beforeEach, describe, expect, it, vi } from "vitest";
import mod from "../src/module.js";

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (def: unknown) => def,
  addComponent: vi.fn(),
  addImports: vi.fn(),
}));

type ModuleDef = {
  meta: { name: string; configKey: string; compatibility: { nuxt: string } };
  setup: () => void;
};

// Cast: at runtime, defineNuxtModule is mocked to return its argument directly.
const module = mod as unknown as ModuleDef;

const FROM = "@forge-ui/vue";

describe("@forge-ui/nuxt", () => {
  beforeEach(() => {
    vi.mocked(addComponent).mockClear();
    vi.mocked(addImports).mockClear();
  });

  // ---------------------------------------------------------------------------
  // Meta
  // ---------------------------------------------------------------------------
  describe("meta", () => {
    it("has correct name", () => {
      expect(module.meta.name).toBe("@forge-ui/nuxt");
    });

    it("has correct configKey", () => {
      expect(module.meta.configKey).toBe("forgeUi");
    });

    it("requires Nuxt >=4", () => {
      expect(module.meta.compatibility.nuxt).toBe(">=4.0.0");
    });
  });

  // ---------------------------------------------------------------------------
  // Composable auto-imports
  // ---------------------------------------------------------------------------
  describe("setup — composables", () => {
    it("registers useDialog and useMachine as a batch", () => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith(
        expect.arrayContaining([
          { name: "useDialog", from: FROM },
          { name: "useMachine", from: FROM },
        ]),
      );
    });

    it("registers the Dialog namespace object", () => {
      module.setup();
      expect(vi.mocked(addImports)).toHaveBeenCalledWith({
        name: "Dialog",
        from: FROM,
      });
    });
  });

  // ---------------------------------------------------------------------------
  // Component auto-registration
  // ---------------------------------------------------------------------------
  describe("setup — components", () => {
    const COMPONENTS = [
      "DialogRoot",
      "DialogTrigger",
      "DialogOverlay",
      "DialogContent",
      "DialogTitle",
      "DialogDescription",
      "DialogClose",
      "DialogPortal",
    ] as const;

    it.each(COMPONENTS)("registers %s", (name) => {
      module.setup();
      expect(vi.mocked(addComponent)).toHaveBeenCalledWith({
        name,
        export: name,
        filePath: FROM,
      });
    });
  });
});
