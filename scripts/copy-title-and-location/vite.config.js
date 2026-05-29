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
        fileName: "CopyTitleAndLocation.user.js",
        metaFileName: "CopyTitleAndLocation.meta.js",
        autoGrant: false,
      },
    }),
  ],
});
