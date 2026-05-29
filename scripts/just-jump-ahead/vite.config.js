import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

import { userscript } from "./src/meta.js";

export default defineConfig({
  build: {
    minify: false,
    cssMinify: false,
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
  },
  plugins: [
    monkey({
      entry: "src/main.js",
      userscript,
      server: {
        prefix: "dev:",
      },
      build: {
        fileName: "just-jump-ahead.user.js",
        metaFileName: "just-jump-ahead.meta.js",
        autoGrant: false,
      },
    }),
  ],
});
