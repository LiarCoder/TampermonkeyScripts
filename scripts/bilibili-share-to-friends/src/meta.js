export const userscript = {
  name: "B站视频分享给好友",
  namespace: "http://tampermonkey.net/",
  version: "0.2.0",
  description:
    "在 Bilibili 视频播放页的原分享面板中新增“B站好友”入口，将当前视频以私信分享卡片发送给最近私信联系人",
  author: "LiarCoder",
  icon: "https://www.bilibili.com/favicon.ico",
  match: ["https://www.bilibili.com/video/*"],
  grant: ["GM_addStyle", "GM_xmlhttpRequest"],
  connect: ["api.bilibili.com", "api.vc.bilibili.com"],
  "run-at": "document-end",
  license: "MIT",
};
