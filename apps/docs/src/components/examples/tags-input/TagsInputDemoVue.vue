<template>
  <div class="forge-demo">
    <div v-bind="api.getRootProps()">
      <span v-for="tag in api.value.value" :key="tag" v-bind="api.getTagProps(tag)">
        {{ tag }}
        <button v-bind="api.getTagDeleteProps(tag)">×</button>
      </span>
      <input
        v-bind="api.getInputProps()"
        placeholder="Add a tag…"
        @change="(e) => api.send({ type: 'INPUT_CHANGE', value: (e.target as HTMLInputElement).value })"
        @keydown="onKeyDown"
      />
      <input v-bind="api.getHiddenInputProps()" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTagsInput } from "@forge-ui/vue";

const api = useTagsInput({ defaultValue: ["design", "react"] });

function onKeyDown(e: KeyboardEvent) {
  if (e.key === "Enter") {
    e.preventDefault();
    api.send({ type: "ADD_TAG" });
  } else if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "") {
    api.send({ type: "REMOVE_LAST_TAG" });
  }
}
</script>
