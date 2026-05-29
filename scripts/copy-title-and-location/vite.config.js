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
        fileName: "copy-title-and-location.user.js",
        metaFileName: "copy-title-and-location.meta.js",
        autoGrant: false,
      },
    }),
  ],
});
