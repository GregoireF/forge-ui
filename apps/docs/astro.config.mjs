import react from "@astrojs/react";
import starlight from "@astrojs/starlight";
import vue from "@astrojs/vue";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";

function src(pkg) {
  return fileURLToPath(new URL(`../../packages/${pkg}/src/index.ts`, import.meta.url));
}

export default defineConfig({
  integrations: [
    starlight({
      title: "forge-ui",
      description:
        "Headless UI primitives for React and Vue — unstyled, accessible, CSS-contract driven.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/gregoiref/forge-ui",
        },
      ],
      customCss: ["./src/styles/forge-demos.css"],
      components: {
        SiteTitle: "./src/components/SiteTitle.astro",
      },
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", link: "/" },
            { label: "Installation", link: "/getting-started/installation" },
            { label: "CSS Contract", link: "/getting-started/css-contract" },
          ],
        },
        {
          label: "Primitives",
          items: [
            { label: "Dialog", link: "/primitives/dialog" },
            { label: "Alert Dialog", link: "/primitives/alert-dialog" },
            { label: "Popover", link: "/primitives/popover" },
            { label: "Tooltip", link: "/primitives/tooltip" },
            { label: "Hover Card", link: "/primitives/hover-card" },
            { label: "Select", link: "/primitives/select" },
            { label: "Combobox", link: "/primitives/combobox" },
            { label: "Checkbox", link: "/primitives/checkbox" },
            { label: "Switch", link: "/primitives/switch" },
            { label: "Field", link: "/primitives/field" },
            { label: "Tags Input", link: "/primitives/tags-input" },
          ],
        },
      ],
    }),
    react({ include: ["**/examples/**", "**/components/**"] }),
    vue({ include: ["**/*.vue"] }),
  ],
  vite: {
    resolve: {
      alias: {
        "@forge-ui/react": src("react"),
        "@forge-ui/vue": src("vue"),
        "@forge-ui/core": src("core"),
        "@forge-ui/floating": src("floating"),
        "@forge-ui/alert-dialog": src("primitives/alert-dialog"),
        "@forge-ui/checkbox": src("primitives/checkbox"),
        "@forge-ui/combobox": src("primitives/combobox"),
        "@forge-ui/dialog": src("primitives/dialog"),
        "@forge-ui/field": src("primitives/field"),
        "@forge-ui/hover-card": src("primitives/hover-card"),
        "@forge-ui/popover": src("primitives/popover"),
        "@forge-ui/select": src("primitives/select"),
        "@forge-ui/switch": src("primitives/switch"),
        "@forge-ui/tags-input": src("primitives/tags-input"),
        "@forge-ui/tooltip": src("primitives/tooltip"),
      },
    },
  },
});
