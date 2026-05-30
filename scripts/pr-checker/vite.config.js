import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

import packageJson from "./package.json";
import { userscript } from "./src/meta.js";

const scriptName = packageJson.scriptName;

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
        prefix: `dev:${userscript.name}`,
      },
      build: {
        fileName: `${scriptName}.user.js`,
        metaFileName: `dev/${scriptName}.meta.js`,
        autoGrant: false,
      },
    }),
  ],
});
