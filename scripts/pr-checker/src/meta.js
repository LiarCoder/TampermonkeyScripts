const rawBaseUrl =
  "https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/pr-checker/dist";

export const userscript = {
  name: "PR三思器",
  namespace: "http://tampermonkey.net/",
  version: "V1.3.0",
  description: "创建PR前，提醒一下有没有一些遗漏的东西需要检查",
  author: "liaw",
  updateURL: `${rawBaseUrl}/pr-checker.user.js`,
  downloadURL: `${rawBaseUrl}/pr-checker.user.js`,
  match: ["https://code.fineres.com/*/pull-requests?create*"],
  icon: "https://code.fineres.com/projects/FX/avatar.png?s=64&v=1452596397000",
  grant: ["GM_addStyle", "unsafeWindow"],
  "run-at": "document-end",
  license: "MIT",
};
