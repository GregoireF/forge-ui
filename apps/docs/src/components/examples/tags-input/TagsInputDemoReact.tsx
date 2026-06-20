import { useTagsInput } from "@forge-ui/react";

export function TagsInputDemoReact() {
  const api = useTagsInput({ defaultValue: ["design", "react"] });

  return (
    <div className="forge-demo">
      <div {...api.getRootProps()}>
        {api.value.map((tag) => (
          <span key={tag} {...api.getTagProps(tag)}>
            {tag}
            <button {...api.getTagDeleteProps(tag)}>×</button>
          </span>
        ))}
        <input
          {...api.getInputProps()}
          placeholder="Add a tag…"
          onChange={(e) => api.send({ type: "INPUT_CHANGE", value: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              api.send({ type: "ADD_TAG" });
            } else if (e.key === "Backspace" && e.currentTarget.value === "") {
              api.send({ type: "REMOVE_LAST_TAG" });
            }
          }}
        />
        <input {...api.getHiddenInputProps()} />
      </div>
    </div>
  );
}
