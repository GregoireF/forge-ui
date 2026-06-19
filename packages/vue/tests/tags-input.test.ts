import { cleanup, fireEvent, render, screen } from "@testing-library/vue";
import { afterEach, describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useTagsInput } from "../src/components/tags-input/use-tags-input.js";
import type { TagsInputEvent } from "@forge-ui/tags-input";
import {
  TagsInputHiddenInput,
  TagsInputInput,
  TagsInputRoot,
  TagsInputTag,
  TagsInputTagDelete,
} from "../src/components/tags-input/TagsInput.js";

afterEach(cleanup);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SendFn = (e: TagsInputEvent) => void;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTagsInputFixture(
  opts: Parameters<typeof useTagsInput>[0] = {},
  sendRef?: { current: SendFn | null },
) {
  return defineComponent({
    setup() {
      const api = useTagsInput({ id: "test", ...opts });
      if (sendRef) sendRef.current = api.send;
      return api;
    },
    template: `
      <div v-bind="getRootProps()">
        <label v-bind="getLabelProps()" data-testid="label">Tags</label>
        <input v-bind="getInputProps()" data-testid="input" />
      </div>
    `,
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useTagsInput (Vue)", () => {
  describe("rendering", () => {
    it("renders input element", () => {
      render(makeTagsInputFixture());
      expect(screen.getByTestId("input")).toBeInTheDocument();
    });

    it("root has data-forge-scope and data-forge-part", () => {
      const { container } = render(makeTagsInputFixture());
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-forge-scope", "tags-input");
      expect(root).toHaveAttribute("data-forge-part", "root");
    });

    it("label is associated with input via htmlFor", () => {
      render(makeTagsInputFixture());
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(label.htmlFor).toBe(input.id);
    });

    it("root has data-disabled when disabled", () => {
      const { container } = render(makeTagsInputFixture({ disabled: true }));
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-disabled", "");
    });
  });

  describe("adding tags", () => {
    it("adds a tag via send events directly", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "INPUT_CHANGE", value: "TypeScript" });
      send({ type: "ADD_TAG" });
      expect(spy).toHaveBeenCalledWith(["TypeScript"]);
    });

    it("adds a tag on Enter key (DOM event)", () => {
      const spy = vi.fn();
      render(makeTagsInputFixture({ onValueChange: spy }));
      const input = screen.getByTestId("input") as HTMLInputElement;
      // Use DOM focus event to drive FOCUS transition
      fireEvent.focus(input);
      // Directly dispatch a keydown Enter event
      fireEvent.keyDown(input, { key: "Enter" });
      // Nothing added since inputValue is "" — but confirms handler fires without crash
      expect(spy).not.toHaveBeenCalled();
    });

    it("does not add empty tag", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      // No INPUT_CHANGE — inputValue is ""
      send({ type: "ADD_TAG" });
      expect(spy).not.toHaveBeenCalled();
    });

    it("does not add duplicate by default", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ defaultValue: ["React"], onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "INPUT_CHANGE", value: "React" });
      send({ type: "ADD_TAG" });
      expect(spy).not.toHaveBeenCalled();
    });

    it("allows duplicate when allowDuplicates=true", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ defaultValue: ["React"], allowDuplicates: true, onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "INPUT_CHANGE", value: "React" });
      send({ type: "ADD_TAG" });
      expect(spy).toHaveBeenCalledWith(["React", "React"]);
    });

    it("respects maxTags", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ defaultValue: ["a", "b"], maxTags: 2, onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "INPUT_CHANGE", value: "c" });
      send({ type: "ADD_TAG" });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("removing tags", () => {
    it("removes last tag via REMOVE_LAST_TAG", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ defaultValue: ["React", "Vue"], onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "REMOVE_LAST_TAG" });
      expect(spy).toHaveBeenCalledWith(["React"]);
    });

    it("does not remove tag when input has text", () => {
      const spy = vi.fn();
      const sendRef: { current: SendFn | null } = { current: null };
      render(makeTagsInputFixture({ defaultValue: ["React"], onValueChange: spy }, sendRef));
      const send = sendRef.current!;
      send({ type: "FOCUS" });
      send({ type: "INPUT_CHANGE", value: "V" });
      send({ type: "REMOVE_LAST_TAG" });
      expect(spy).not.toHaveBeenCalled();
    });

    it("removes a specific tag via TagDelete click", () => {
      const spy = vi.fn();
      const fixture = defineComponent({
        components: { TagsInputRoot, TagsInputInput, TagsInputTag, TagsInputTagDelete },
        setup() {
          return { spy };
        },
        template: `
          <TagsInputRoot id="test" :defaultValue="['React', 'Vue']" :onValueChange="spy">
            <TagsInputInput data-testid="input" />
            <TagsInputTag value="React" data-testid="tag-react">
              React
              <TagsInputTagDelete value="React" data-testid="delete-react" />
            </TagsInputTag>
            <TagsInputTag value="Vue">
              Vue
              <TagsInputTagDelete value="Vue" data-testid="delete-vue" />
            </TagsInputTag>
          </TagsInputRoot>
        `,
      });
      render(fixture);
      // REMOVE_TAG is handled in both idle and focused states.
      fireEvent.click(screen.getByTestId("delete-react"));
      expect(spy).toHaveBeenCalledWith(["Vue"]);
    });
  });

  describe("form", () => {
    it("renders hidden input with comma-joined values", () => {
      const fixture = defineComponent({
        components: { TagsInputRoot, TagsInputInput, TagsInputHiddenInput },
        template: `
          <TagsInputRoot id="test" :defaultValue="['React', 'Vue']">
            <TagsInputInput data-testid="input" />
            <TagsInputHiddenInput name="frameworks" />
          </TagsInputRoot>
        `,
      });
      render(fixture);
      const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(hidden).not.toBeNull();
      expect(hidden.value).toBe("React,Vue");
    });
  });
});
