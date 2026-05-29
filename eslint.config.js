import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "**/dist/**",
      "**/legacy/**",
      "**/*.user.js",
      "**/FunctionTests/**",
      "**/PreviousVersions/**"
    ]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        GM_addStyle: "readonly",
        GM_xmlhttpRequest: "readonly",
        unsafeWindow: "readonly"
      }
    },
    rules: {
      "no-console": "off"
    }
  }
];
