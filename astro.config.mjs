// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import tailwind from "@astrojs/tailwind";
import AutoImport from "astro-auto-import";

// https://astro.build/config
export default defineConfig({
  site: "https://lakshmanshankar.github.io/custom-cms-demo",
  integrations: [
    AutoImport({
      imports: [
        "./src/components/mdx/Callout.astro",
        "./src/components/mdx/Image.astro",
        "./src/components/mdx/Code.astro",
        "./src/components/mdx/Spacer.astro",
      ],
    }),
    mdx(),
    tailwind(),
  ],
  experimental: {
    responsiveImages: true,
    svg: true,
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    },
  },
});
