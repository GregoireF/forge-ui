import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TagsInput } from "../src/components/tags-input/TagsInput.js";

// ---------------------------------------------------------------------------
// TagsInput — React
// ---------------------------------------------------------------------------

function BasicTagsInput(props: { onValueChange?: (v: string[]) => void; defaultValue?: string[]; value?: string[]; maxTags?: number; allowDuplicates?: boolean; disabled?: boolean }) {
  return (
    <TagsInput.Root {...props}>
      <TagsInput.Label data-testid="label">Tags</TagsInput.Label>
      <TagsInput.Input data-testid="input" />
    </TagsInput.Root>
  );
}

describe("TagsInput (React)", () => {
  describe("rendering", () => {
    it("renders with empty tags by default", () => {
      render(<BasicTagsInput />);
      expect(screen.getByTestId("input")).toBeInTheDocument();
      expect(screen.getByTestId("input").tagName).toBe("INPUT");
    });

    it("renders with defaultValue tags", () => {
      render(
        <TagsInput.Root defaultValue={["React", "Vue"]}>
          <TagsInput.Input data-testid="input" />
          <TagsInput.Tag value="React" data-testid="tag-react">
            React
            <TagsInput.TagDelete value="React" data-testid="delete-react" />
          </TagsInput.Tag>
          <TagsInput.Tag value="Vue" data-testid="tag-vue">
            Vue
            <TagsInput.TagDelete value="Vue" data-testid="delete-vue" />
          </TagsInput.Tag>
        </TagsInput.Root>,
      );
      expect(screen.getByTestId("tag-react")).toHaveAttribute("data-value", "React");
      expect(screen.getByTestId("tag-vue")).toHaveAttribute("data-value", "Vue");
    });

    it("label is associated to input via htmlFor", () => {
      render(<BasicTagsInput />);
      const label = screen.getByTestId("label") as HTMLLabelElement;
      const input = screen.getByTestId("input") as HTMLInputElement;
      expect(label.htmlFor).toBe(input.id);
    });

    it("root has data-forge-scope and data-forge-part", () => {
      const { container } = render(<BasicTagsInput />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-forge-scope", "tags-input");
      expect(root).toHaveAttribute("data-forge-part", "root");
    });

    it("input has data-forge-part=input", () => {
      render(<BasicTagsInput />);
      expect(screen.getByTestId("input")).toHaveAttribute("data-forge-part", "input");
    });
  });

  describe("adding tags", () => {
    it("adds a tag on Enter key", () => {
      const spy = vi.fn();
      render(<BasicTagsInput onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "TypeScript" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).toHaveBeenCalledWith(["TypeScript"]);
    });

    it("clears input after adding tag", () => {
      render(<BasicTagsInput />);
      const input = screen.getByTestId("input") as HTMLInputElement;
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "TypeScript" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(input.value).toBe("");
    });

    it("does not add empty tag on Enter", () => {
      const spy = vi.fn();
      render(<BasicTagsInput onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).not.toHaveBeenCalled();
    });

    it("does not add duplicate by default", () => {
      const spy = vi.fn();
      render(<BasicTagsInput defaultValue={["React"]} onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "React" } });
      fireEvent.keyDown(input, { key: "Enter" });
      // onValueChange should not be called since React is duplicate
      expect(spy).not.toHaveBeenCalled();
    });

    it("allows duplicate when allowDuplicates=true", () => {
      const spy = vi.fn();
      render(<BasicTagsInput defaultValue={["React"]} allowDuplicates onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "React" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).toHaveBeenCalledWith(["React", "React"]);
    });

    it("respects maxTags", () => {
      const spy = vi.fn();
      render(<BasicTagsInput defaultValue={["a", "b"]} maxTags={2} onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "c" } });
      fireEvent.keyDown(input, { key: "Enter" });
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe("removing tags", () => {
    it("removes last tag on Backspace when input is empty", () => {
      const spy = vi.fn();
      render(<BasicTagsInput defaultValue={["React", "Vue"]} onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.keyDown(input, { key: "Backspace" });
      expect(spy).toHaveBeenCalledWith(["React"]);
    });

    it("does not remove tag on Backspace when input has text", () => {
      const spy = vi.fn();
      render(<BasicTagsInput defaultValue={["React"]} onValueChange={spy} />);
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "V" } });
      fireEvent.keyDown(input, { key: "Backspace" });
      expect(spy).not.toHaveBeenCalled();
    });

    it("removes a specific tag via TagDelete click", () => {
      const spy = vi.fn();
      render(
        <TagsInput.Root defaultValue={["React", "Vue"]} onValueChange={spy}>
          <TagsInput.Input data-testid="input" />
          <TagsInput.Tag value="React">
            React
            <TagsInput.TagDelete value="React" data-testid="delete-react" />
          </TagsInput.Tag>
          <TagsInput.Tag value="Vue">
            Vue
            <TagsInput.TagDelete value="Vue" data-testid="delete-vue" />
          </TagsInput.Tag>
        </TagsInput.Root>,
      );
      // REMOVE_TAG is handled in both idle and focused states.
      fireEvent.click(screen.getByTestId("delete-react"));
      expect(spy).toHaveBeenCalledWith(["Vue"]);
    });
  });

  describe("disabled", () => {
    it("input is disabled when disabled=true", () => {
      render(<BasicTagsInput disabled />);
      expect(screen.getByTestId("input")).toBeDisabled();
    });

    it("root has data-disabled when disabled", () => {
      const { container } = render(<BasicTagsInput disabled />);
      const root = container.firstChild as HTMLElement;
      expect(root).toHaveAttribute("data-disabled", "");
    });
  });

  describe("delimiter", () => {
    it("adds a tag on the configured delimiter key", () => {
      const spy = vi.fn();
      render(
        <TagsInput.Root delimiter="," onValueChange={spy}>
          <TagsInput.Input data-testid="input" />
        </TagsInput.Root>,
      );
      const input = screen.getByTestId("input");
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: "TypeScript" } });
      fireEvent.keyDown(input, { key: "," });
      expect(spy).toHaveBeenCalledWith(["TypeScript"]);
    });
  });

  describe("form", () => {
    it("renders hidden input with comma-joined values", () => {
      render(
        <TagsInput.Root defaultValue={["React", "Vue"]}>
          <TagsInput.Input data-testid="input" />
          <TagsInput.HiddenInput name="frameworks" />
        </TagsInput.Root>,
      );
      // Focus to get into focused state (needed to add tags, but defaultValue is already set)
      const hidden = document.querySelector('input[type="hidden"]') as HTMLInputElement;
      expect(hidden).not.toBeNull();
      expect(hidden.value).toBe("React,Vue");
    });
  });
});
