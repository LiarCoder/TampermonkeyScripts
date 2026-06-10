import { buildRawScriptUrl } from "@tampermonkey-scripts/shared";

import packageJson from "../package.json";

const { author, description, displayName, scriptName, version } = packageJson;

const rawScriptUrl = buildRawScriptUrl(scriptName);

export const userscript = {
  name: displayName,
  namespace: "http://tampermonkey.net/",
  version,
  description,
  author,
  icon: "https://www.bilibili.com/favicon.ico",
  updateURL: rawScriptUrl,
  downloadURL: rawScriptUrl,
  match: ["https://www.bilibili.com/video/*", "https://www.bilibili.com/bangumi/play/*"],
  grant: ["GM_addStyle", "GM_xmlhttpRequest"],
  connect: ["api.bilibili.com", "api.vc.bilibili.com"],
  "run-at": "document-end",
  license: "MIT",
};
