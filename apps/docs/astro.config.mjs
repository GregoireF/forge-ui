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
            { label: "Animations", link: "/getting-started/animations" },
          ],
        },
        {
          label: "Primitives",
          items: [
            { label: "Accordion", link: "/primitives/accordion" },
            { label: "Alert Dialog", link: "/primitives/alert-dialog" },
            { label: "Checkbox", link: "/primitives/checkbox" },
            { label: "Collapsible", link: "/primitives/collapsible" },
            { label: "Combobox", link: "/primitives/combobox" },
            { label: "Dialog", link: "/primitives/dialog" },
            { label: "Field", link: "/primitives/field" },
            { label: "Hover Card", link: "/primitives/hover-card" },
            { label: "Popover", link: "/primitives/popover" },
            { label: "Progress", link: "/primitives/progress" },
            { label: "Radio Group", link: "/primitives/radio-group" },
            { label: "Select", link: "/primitives/select" },
            { label: "Number Input", link: "/primitives/number-input" },
            { label: "Slider", link: "/primitives/slider" },
            { label: "Switch", link: "/primitives/switch" },
            { label: "Tabs", link: "/primitives/tabs" },
            { label: "Tags Input", link: "/primitives/tags-input" },
            { label: "Tooltip", link: "/primitives/tooltip" },
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
        "@forge-ui/accordion": src("primitives/accordion"),
        "@forge-ui/collapsible": src("primitives/collapsible"),
        "@forge-ui/alert-dialog": src("primitives/alert-dialog"),
        "@forge-ui/checkbox": src("primitives/checkbox"),
        "@forge-ui/combobox": src("primitives/combobox"),
        "@forge-ui/dialog": src("primitives/dialog"),
        "@forge-ui/field": src("primitives/field"),
        "@forge-ui/hover-card": src("primitives/hover-card"),
        "@forge-ui/popover": src("primitives/popover"),
        "@forge-ui/progress": src("primitives/progress"),
        "@forge-ui/radio-group": src("primitives/radio-group"),
        "@forge-ui/select": src("primitives/select"),
        "@forge-ui/slider": src("primitives/slider"),
        "@forge-ui/switch": src("primitives/switch"),
        "@forge-ui/tabs": src("primitives/tabs"),
        "@forge-ui/number-input": src("primitives/number-input"),
        "@forge-ui/tags-input": src("primitives/tags-input"),
        "@forge-ui/tooltip": src("primitives/tooltip"),
      },
    },
  },
});
