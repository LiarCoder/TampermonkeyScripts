import { buildRawScriptUrl } from "@tampermonkey-scripts/shared";

import packageJson from "../package.json";

const rawScriptUrl = buildRawScriptUrl(packageJson.scriptName);

export const userscript = {
  name: "B站视频分享给好友",
  namespace: "http://tampermonkey.net/",
  version: packageJson.version,
  description:
    "在 Bilibili 视频播放页的原分享面板中新增“B站好友”入口，将当前视频以文本链接私信发送给最近聊天、关注或粉丝用户",
  author: "LiarCoder",
  icon: "https://www.bilibili.com/favicon.ico",
  updateURL: rawScriptUrl,
  downloadURL: rawScriptUrl,
  match: ["https://www.bilibili.com/video/*"],
  grant: ["GM_addStyle", "GM_xmlhttpRequest"],
  connect: ["api.bilibili.com", "api.vc.bilibili.com"],
  "run-at": "document-end",
  license: "MIT",
};
