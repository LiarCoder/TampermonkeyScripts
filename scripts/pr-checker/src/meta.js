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
  updateURL: rawScriptUrl,
  downloadURL: rawScriptUrl,
  match: ["https://code.fineres.com/*/pull-requests?create*"],
  icon: "https://code.fineres.com/projects/FX/avatar.png?s=64&v=1452596397000",
  grant: ["GM_addStyle", "unsafeWindow"],
  "run-at": "document-end",
  license: "MIT",
};
