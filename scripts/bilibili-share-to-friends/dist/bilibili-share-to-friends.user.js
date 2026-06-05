// ==UserScript==
// @name         B站视频分享给好友
// @namespace    http://tampermonkey.net/
// @version      0.4.6
// @author       LiarCoder
// @description  在 Bilibili 视频播放页的原分享面板中新增“B站好友”入口，将当前视频以文本链接私信发送给最近聊天、关注或粉丝用户
// @license      MIT
// @icon         https://www.bilibili.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/bilibili-share-to-friends/dist/bilibili-share-to-friends.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/bilibili-share-to-friends/dist/bilibili-share-to-friends.user.js
// @match        https://www.bilibili.com/video/*
// @connect      api.bilibili.com
// @connect      api.vc.bilibili.com
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @run-at       document-end
// ==/UserScript==

(n=>{if(typeof GM_addStyle=="function"){GM_addStyle(n);return}const r=document.createElement("style");r.textContent=n,document.head.append(r)})(` .bili-share-to-friends-body {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.bili-share-to-friends-tab-panel {
  display: none;
  flex: 1 1 auto;
  min-height: 0;
}

.bili-share-to-friends-tab-panel-active {
  display: block;
}

.bili-share-to-friends-panel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.bili-share-to-friends-relation-filter {\r
  display: flex;\r
  gap: 18px;\r
  flex: 0 0 auto;\r
  padding: 7px 14px 1px;\r
  color: #18191c;\r
}\r
\r
.bili-share-to-friends-relation-option {\r
  display: inline-flex;\r
  align-items: center;\r
  gap: 6px;\r
  font-size: 13px;\r
  cursor: pointer;\r
}\r
\r
.bili-share-to-friends-relation-option input {\r
  appearance: none;\r
  box-sizing: border-box;\r
  width: 15px;\r
  height: 15px;\r
  margin: 0;\r
  border: 1px solid #c9ccd0;\r
  border-radius: 50%;\r
  background: #fff;\r
  cursor: pointer;\r
}\r
\r
.bili-share-to-friends-relation-option input:checked {\r
  border-color: #00aeec;\r
  background: radial-gradient(circle at center, #00aeec 0 43%, transparent 45%);\r
}\r
\r
.bili-share-to-friends-relation-option input:focus-visible {\r
  outline: 2px solid rgba(0, 174, 236, 0.2);\r
  outline-offset: 2px;\r
}\r
.bili-share-to-friends-search {
  flex: 0 0 auto;
  padding: 6px 14px 3px;
}

.bili-share-to-friends-search-input {
  box-sizing: border-box;
  width: 100%;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d7d9dc;
  border-radius: 4px;
  outline: none;
  color: #18191c;
  background: #fff;
  font-size: 13px;
}

.bili-share-to-friends-search-input:focus {
  border-color: #00aeec;
}

.bili-share-to-friends-search-notice {
  margin-top: 4px;
  color: #9499a0;
  font-size: 12px;
  line-height: 18px;
}
.bili-share-to-friends-state {
  padding: 28px 16px;
  color: #61666d;
  text-align: center;
}

.bili-share-to-friends-state-error {
  color: #d03050;
}
.bili-share-to-friends-person {\r
  display: grid;\r
  grid-template-columns: 36px 1fr auto;\r
  align-items: center;\r
  gap: 9px;\r
  box-sizing: border-box;\r
  width: 100%;\r
  padding: 8px 14px;\r
  border: 0;\r
  background: #fff;\r
  color: inherit;\r
  text-align: left;\r
  cursor: pointer;\r
}\r
\r
.bili-share-to-friends-person:hover,\r
.bili-share-to-friends-person[data-selected="true"] {\r
  background: #f6fbff;\r
}\r
\r
.bili-share-to-friends-avatar {\r
  width: 36px;\r
  height: 36px;\r
  border-radius: 50%;\r
  object-fit: cover;\r
  background: #e3e5e7;\r
}\r
\r
.bili-share-to-friends-person-main {\r
  min-width: 0;\r
}\r
\r
.bili-share-to-friends-name {\r
  display: inline-block;\r
  min-width: 0;\r
  max-width: 100%;\r
  font-size: 14px;\r
  color: #18191c;\r
  text-decoration: none;\r
  vertical-align: top;\r
  overflow: hidden;\r
  white-space: nowrap;\r
  text-overflow: ellipsis;\r
}\r
\r
.bili-share-to-friends-name:hover,\r
.bili-share-to-friends-name:focus-visible {\r
  color: #00aeec;\r
}\r
\r
.bili-share-to-friends-meta {\r
  min-width: 0;\r
  margin-top: 1px;\r
  color: #9499a0;\r
  font-size: 12px;\r
  overflow: hidden;\r
  white-space: nowrap;\r
  text-overflow: ellipsis;\r
}\r
\r
.bili-share-to-friends-check {\r
  width: 18px;\r
  height: 18px;\r
  border: 1px solid #c9ccd0;\r
  border-radius: 50%;\r
}\r
\r
.bili-share-to-friends-person[data-selected="true"] .bili-share-to-friends-check {\r
  border-color: #00aeec;\r
  background: radial-gradient(circle at center, #00aeec 0 45%, transparent 47%);\r
}\r
.bili-share-to-friends-list-scroll {\r
  flex: 1;\r
  min-height: 0;\r
  overflow-x: hidden;\r
  overflow-y: auto;\r
}\r
\r
.bili-share-to-friends-list {\r
  margin: 0;\r
  padding: 5px 0;\r
  list-style: none;\r
}\r
\r
.bili-share-to-friends-list-footer {\r
  min-height: 24px;\r
  padding: 0 14px 6px;\r
  color: #9499a0;\r
  font-size: 12px;\r
  line-height: 24px;\r
  text-align: center;\r
}\r
\r
.bili-share-to-friends-list-retry {\r
  border: 0;\r
  background: transparent;\r
  color: #00aeec;\r
  cursor: pointer;\r
}\r
\r
.bili-share-to-friends-list-sentinel {\r
  height: 1px;\r
}\r
.bili-share-to-friends-dialog::backdrop {\r
  background: rgba(0, 0, 0, 0.38);\r
}\r
\r
.bili-share-to-friends-dialog:not([open]) {\r
  display: none !important;\r
  pointer-events: none !important;\r
}\r
\r
.bili-share-to-friends-dialog {\r
  display: flex;\r
  flex-direction: column;\r
  width: min(420px, calc(100vw - 32px));\r
  height: min(620px, calc(100vh - 48px));\r
  max-height: calc(100vh - 48px);\r
  padding: 0;\r
  border: 0;\r
  border-radius: 8px;\r
  background: #fff;\r
  color: #18191c;\r
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18);\r
  overflow: hidden;\r
  font:\r
    14px/1.5 -apple-system,\r
    BlinkMacSystemFont,\r
    "Segoe UI",\r
    "Microsoft YaHei",\r
    sans-serif;\r
}\r
\r
.bili-share-to-friends-dialog-content {\r
  display: flex;\r
  flex: 1 1 auto;\r
  flex-direction: column;\r
  min-height: 0;\r
}\r
.bili-share-to-friends-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex: 0 0 auto;
  padding: 9px 14px;
  border-top: 1px solid #e3e5e7;
}

.bili-share-to-friends-btn {
  min-width: 76px;
  height: 30px;
  padding: 0 14px;
  border: 1px solid #c9ccd0;
  border-radius: 4px;
  background: #fff;
  color: #18191c;
  cursor: pointer;
}

.bili-share-to-friends-btn:hover {
  border-color: #00aeec;
  color: #00aeec;
}

.bili-share-to-friends-btn-primary {
  color: #fff;
  border-color: #00aeec;
  background: #00aeec;
}

.bili-share-to-friends-btn-primary:hover {
  color: #fff;
  border-color: #40c5f1;
  background: #40c5f1;
}

.bili-share-to-friends-btn:disabled {
  border-color: #e3e5e7;
  background: #f6f7f8;
  color: #c9ccd0;
  cursor: not-allowed;
}
.bili-share-to-friends-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 0 0 auto;
  padding: 8px 14px;
  border-bottom: 1px solid #e3e5e7;
}

.bili-share-to-friends-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.bili-share-to-friends-close {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #61666d;
  font-size: 0;
  line-height: 0;
  cursor: pointer;
}

.bili-share-to-friends-close::before,
.bili-share-to-friends-close::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 2px;
  border-radius: 1px;
  background: currentColor;
  content: "";
}

.bili-share-to-friends-close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.bili-share-to-friends-close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.bili-share-to-friends-close:hover {
  background: #f1f2f3;
}
.bili-share-to-friends-entry {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 60px;
  min-width: 60px;
  height: 60px;
  margin: 0 0px;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: #18191c;
  background: transparent;
  font-size: 12px;
  line-height: 21px;
  cursor: pointer;
  user-select: none;
  vertical-align: top;
  transition:
    color 0.2s,
    transform 0.2s;
}

.bili-share-to-friends-entry:hover {
  color: #00aeec;
  transform: translateY(-1px);
}

.bili-share-to-friends-entry-text {
  color: #18191c;
  white-space: nowrap;
}

.bili-share-to-friends-entry:hover .bili-share-to-friends-entry-text {
  color: #00aeec;
}

.bili-share-to-friends-entry-icon {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: #fff;
  background: #00aeec;
}

.bili-share-to-friends-entry-icon svg {
  width: 22px;
  height: 22px;
}
.bili-share-to-friends-tabs {\r
  display: flex;\r
  gap: 8px;\r
  flex: 0 0 auto;\r
  padding: 7px 14px 8px;\r
  background: #fff;\r
}\r
\r
.bili-share-to-friends-tab {\r
  height: 28px;\r
  padding: 0 10px;\r
  border: 1px solid transparent;\r
  border-radius: 4px;\r
  background: transparent;\r
  color: #61666d;\r
  font-size: 13px;\r
  cursor: pointer;\r
}\r
\r
.bili-share-to-friends-tab:hover {\r
  color: #00aeec;\r
}\r
\r
.bili-share-to-friends-tab[aria-selected="true"] {\r
  color: #00aeec;\r
  border-color: #b8e8f8;\r
  background: #f6fbff;\r
  font-weight: 600;\r
}\r
.bili-share-to-friends-video {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 9px;
  flex: 0 0 auto;
  padding: 9px 14px;
  border-bottom: 1px solid #e3e5e7;
  background: #f6f7f8;
}

.bili-share-to-friends-cover {
  width: 80px;
  aspect-ratio: 16 / 10;
  border-radius: 4px;
  background: #e3e5e7;
}

.bili-share-to-friends-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9499a0;
  font-size: 12px;
}

.bili-share-to-friends-cover-img {
  object-fit: cover;
}

.bili-share-to-friends-video-title {
  margin: 0;
  color: #18191c;
  font-size: 13px;
  line-height: 17px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bili-share-to-friends-video-author {
  margin-top: 4px;
  color: #9499a0;
  font-size: 12px;
} `);

(function () {
  'use strict';

  var _GM_xmlhttpRequest = /* @__PURE__ */ (() => typeof GM_xmlhttpRequest != "undefined" ? GM_xmlhttpRequest : void 0)();
  const getCookie = (name) => {
    const cookie = document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
  };
  const md5 = (input) => {
    const rotateLeft = (value, shift) => value << shift | value >>> 32 - shift;
    const addUnsigned = (x2, y2) => {
      const x4 = x2 & 1073741824;
      const y4 = y2 & 1073741824;
      const x8 = x2 & 2147483648;
      const y8 = y2 & 2147483648;
      const result = (x2 & 1073741823) + (y2 & 1073741823);
      if (x4 & y4) {
        return result ^ 2147483648 ^ x8 ^ y8;
      }
      if (x4 | y4) {
        if (result & 1073741824) {
          return result ^ 3221225472 ^ x8 ^ y8;
        }
        return result ^ 1073741824 ^ x8 ^ y8;
      }
      return result ^ x8 ^ y8;
    };
    const f2 = (x2, y2, z2) => x2 & y2 | ~x2 & z2;
    const g2 = (x2, y2, z2) => x2 & z2 | y2 & ~z2;
    const h2 = (x2, y2, z2) => x2 ^ y2 ^ z2;
    const i2 = (x2, y2, z2) => y2 ^ (x2 | ~z2);
    const round = (fn, a3, b3, c3, d3, x2, s2, ac) => addUnsigned(rotateLeft(addUnsigned(addUnsigned(a3, fn(b3, c3, d3)), addUnsigned(x2, ac)), s2), b3);
    const utf8 = unescape(encodeURIComponent(input));
    const words = [];
    const length = utf8.length;
    for (let index = 0; index < length; index++) {
      words[index >> 2] |= utf8.charCodeAt(index) << index % 4 * 8;
    }
    words[length >> 2] |= 128 << length % 4 * 8;
    words[((length + 8 >> 6) + 1) * 16 - 2] = length * 8;
    let a2 = 1732584193;
    let b2 = 4023233417;
    let c2 = 2562383102;
    let d2 = 271733878;
    for (let k2 = 0; k2 < words.length; k2 += 16) {
      const aa = a2;
      const bb = b2;
      const cc = c2;
      const dd = d2;
      a2 = round(f2, a2, b2, c2, d2, words[k2 + 0], 7, 3614090360);
      d2 = round(f2, d2, a2, b2, c2, words[k2 + 1], 12, 3905402710);
      c2 = round(f2, c2, d2, a2, b2, words[k2 + 2], 17, 606105819);
      b2 = round(f2, b2, c2, d2, a2, words[k2 + 3], 22, 3250441966);
      a2 = round(f2, a2, b2, c2, d2, words[k2 + 4], 7, 4118548399);
      d2 = round(f2, d2, a2, b2, c2, words[k2 + 5], 12, 1200080426);
      c2 = round(f2, c2, d2, a2, b2, words[k2 + 6], 17, 2821735955);
      b2 = round(f2, b2, c2, d2, a2, words[k2 + 7], 22, 4249261313);
      a2 = round(f2, a2, b2, c2, d2, words[k2 + 8], 7, 1770035416);
      d2 = round(f2, d2, a2, b2, c2, words[k2 + 9], 12, 2336552879);
      c2 = round(f2, c2, d2, a2, b2, words[k2 + 10], 17, 4294925233);
      b2 = round(f2, b2, c2, d2, a2, words[k2 + 11], 22, 2304563134);
      a2 = round(f2, a2, b2, c2, d2, words[k2 + 12], 7, 1804603682);
      d2 = round(f2, d2, a2, b2, c2, words[k2 + 13], 12, 4254626195);
      c2 = round(f2, c2, d2, a2, b2, words[k2 + 14], 17, 2792965006);
      b2 = round(f2, b2, c2, d2, a2, words[k2 + 15], 22, 1236535329);
      a2 = round(g2, a2, b2, c2, d2, words[k2 + 1], 5, 4129170786);
      d2 = round(g2, d2, a2, b2, c2, words[k2 + 6], 9, 3225465664);
      c2 = round(g2, c2, d2, a2, b2, words[k2 + 11], 14, 643717713);
      b2 = round(g2, b2, c2, d2, a2, words[k2 + 0], 20, 3921069994);
      a2 = round(g2, a2, b2, c2, d2, words[k2 + 5], 5, 3593408605);
      d2 = round(g2, d2, a2, b2, c2, words[k2 + 10], 9, 38016083);
      c2 = round(g2, c2, d2, a2, b2, words[k2 + 15], 14, 3634488961);
      b2 = round(g2, b2, c2, d2, a2, words[k2 + 4], 20, 3889429448);
      a2 = round(g2, a2, b2, c2, d2, words[k2 + 9], 5, 568446438);
      d2 = round(g2, d2, a2, b2, c2, words[k2 + 14], 9, 3275163606);
      c2 = round(g2, c2, d2, a2, b2, words[k2 + 3], 14, 4107603335);
      b2 = round(g2, b2, c2, d2, a2, words[k2 + 8], 20, 1163531501);
      a2 = round(g2, a2, b2, c2, d2, words[k2 + 13], 5, 2850285829);
      d2 = round(g2, d2, a2, b2, c2, words[k2 + 2], 9, 4243563512);
      c2 = round(g2, c2, d2, a2, b2, words[k2 + 7], 14, 1735328473);
      b2 = round(g2, b2, c2, d2, a2, words[k2 + 12], 20, 2368359562);
      a2 = round(h2, a2, b2, c2, d2, words[k2 + 5], 4, 4294588738);
      d2 = round(h2, d2, a2, b2, c2, words[k2 + 8], 11, 2272392833);
      c2 = round(h2, c2, d2, a2, b2, words[k2 + 11], 16, 1839030562);
      b2 = round(h2, b2, c2, d2, a2, words[k2 + 14], 23, 4259657740);
      a2 = round(h2, a2, b2, c2, d2, words[k2 + 1], 4, 2763975236);
      d2 = round(h2, d2, a2, b2, c2, words[k2 + 4], 11, 1272893353);
      c2 = round(h2, c2, d2, a2, b2, words[k2 + 7], 16, 4139469664);
      b2 = round(h2, b2, c2, d2, a2, words[k2 + 10], 23, 3200236656);
      a2 = round(h2, a2, b2, c2, d2, words[k2 + 13], 4, 681279174);
      d2 = round(h2, d2, a2, b2, c2, words[k2 + 0], 11, 3936430074);
      c2 = round(h2, c2, d2, a2, b2, words[k2 + 3], 16, 3572445317);
      b2 = round(h2, b2, c2, d2, a2, words[k2 + 6], 23, 76029189);
      a2 = round(h2, a2, b2, c2, d2, words[k2 + 9], 4, 3654602809);
      d2 = round(h2, d2, a2, b2, c2, words[k2 + 12], 11, 3873151461);
      c2 = round(h2, c2, d2, a2, b2, words[k2 + 15], 16, 530742520);
      b2 = round(h2, b2, c2, d2, a2, words[k2 + 2], 23, 3299628645);
      a2 = round(i2, a2, b2, c2, d2, words[k2 + 0], 6, 4096336452);
      d2 = round(i2, d2, a2, b2, c2, words[k2 + 7], 10, 1126891415);
      c2 = round(i2, c2, d2, a2, b2, words[k2 + 14], 15, 2878612391);
      b2 = round(i2, b2, c2, d2, a2, words[k2 + 5], 21, 4237533241);
      a2 = round(i2, a2, b2, c2, d2, words[k2 + 12], 6, 1700485571);
      d2 = round(i2, d2, a2, b2, c2, words[k2 + 3], 10, 2399980690);
      c2 = round(i2, c2, d2, a2, b2, words[k2 + 10], 15, 4293915773);
      b2 = round(i2, b2, c2, d2, a2, words[k2 + 1], 21, 2240044497);
      a2 = round(i2, a2, b2, c2, d2, words[k2 + 8], 6, 1873313359);
      d2 = round(i2, d2, a2, b2, c2, words[k2 + 15], 10, 4264355552);
      c2 = round(i2, c2, d2, a2, b2, words[k2 + 6], 15, 2734768916);
      b2 = round(i2, b2, c2, d2, a2, words[k2 + 13], 21, 1309151649);
      a2 = round(i2, a2, b2, c2, d2, words[k2 + 4], 6, 4149444226);
      d2 = round(i2, d2, a2, b2, c2, words[k2 + 11], 10, 3174756917);
      c2 = round(i2, c2, d2, a2, b2, words[k2 + 2], 15, 718787259);
      b2 = round(i2, b2, c2, d2, a2, words[k2 + 9], 21, 3951481745);
      a2 = addUnsigned(a2, aa);
      b2 = addUnsigned(b2, bb);
      c2 = addUnsigned(c2, cc);
      d2 = addUnsigned(d2, dd);
    }
    const wordToHex = (value) => {
      let output = "";
      for (let count = 0; count <= 3; count++) {
        output += `0${(value >>> count * 8 & 255).toString(16)}`.slice(-2);
      }
      return output;
    };
    return `${wordToHex(a2)}${wordToHex(b2)}${wordToHex(c2)}${wordToHex(d2)}`;
  };
  const httpRequest$1 = ({
    method = "GET",
    url,
    data = null,
    headers = {},
    request = globalThis.GM_xmlhttpRequest
  }) => {
    return new Promise((resolve, reject) => {
      request({
        method,
        url,
        data,
        headers,
        withCredentials: true,
        timeout: 15e3,
        onload: (response) => {
          try {
            const result = JSON.parse(response.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error(`响应解析失败：${error.message}`));
          }
        },
        onerror: () => reject(new Error("网络请求失败")),
        ontimeout: () => reject(new Error("网络请求超时"))
      });
    });
  };
  const buildQuery = (params) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== void 0 && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    return query.toString();
  };
  const debounce = (callback, delay) => {
    let timer = null;
    const debounced = (...args) => {
      globalThis.clearTimeout(timer);
      timer = globalThis.setTimeout(() => callback(...args), delay);
    };
    debounced.cancel = () => globalThis.clearTimeout(timer);
    return debounced;
  };
  const normalizeImageUrl = (url) => {
    if (!url) {
      return "";
    }
    if (url.startsWith("//")) {
      return `https:${url}`;
    }
    if (url.startsWith("http://")) {
      return `https://${url.slice("http://".length)}`;
    }
    return url;
  };
  const SCRIPT_ID = "bili-share-to-friends";
  const DEFAULT_AVATAR_URL = "https://static.hdslb.com/images/member/noface.gif";
  const DEV_ID_KEY = `${SCRIPT_ID}.dev_id`;
  const SESSION_CACHE_KEY = `${SCRIPT_ID}.recent_sessions.v2`;
  const SESSION_CACHE_TTL = 5 * 60 * 1e3;
  const SESSION_LIMIT = 20;
  const RELATION_PAGE_SIZE = 20;
  const SHARE_BUTTONS_SELECTOR = ".video-share-dropdown .dropdown-bottom > .share-btns";
  const LIST_SCROLL_SELECTOR = "[data-bili-share-to-friends-list-scroll]";
  const MIXIN_KEY_ENC_TAB = [
    46,
    47,
    18,
    2,
    53,
    8,
    23,
    32,
    15,
    50,
    10,
    31,
    58,
    3,
    45,
    35,
    27,
    43,
    5,
    49,
    33,
    9,
    42,
    19,
    29,
    28,
    14,
    39,
    12,
    38,
    41,
    13,
    37,
    48,
    7,
    16,
    24,
    55,
    40,
    61,
    26,
    17,
    0,
    1,
    60,
    51,
    30,
    4,
    22,
    25,
    54,
    21,
    56,
    59,
    6,
    63,
    57,
    62,
    11,
    36,
    20,
    34,
    44,
    52
  ];
  let navCache = null;
  const httpRequest = (options) => httpRequest$1({
    ...options,
    request: _GM_xmlhttpRequest
  });
  const getBvidFromLocation = () => {
    const match = location.href.match(/\/video\/(BV[0-9A-Za-z]+)/);
    return match ? match[1] : "";
  };
  const assertSuccess = (result, action) => {
    if (!result || result.code !== 0) {
      const message = (result == null ? void 0 : result.message) || (result == null ? void 0 : result.msg) || "未知错误";
      throw new Error(`${action}失败：${message}（code: ${(result == null ? void 0 : result.code) ?? "-"}）`);
    }
    return result.data;
  };
  const createSendMessageForm = ({
    nav,
    csrf,
    receiver,
    msgType,
    content,
    devId,
    timestamp,
    fromFirework = "0"
  }) => new URLSearchParams({
    "msg[sender_uid]": String(nav.mid),
    "msg[receiver_id]": String(receiver.mid),
    "msg[receiver_type]": "1",
    "msg[msg_type]": String(msgType),
    "msg[msg_status]": "0",
    "msg[dev_id]": devId,
    "msg[timestamp]": String(timestamp),
    "msg[new_face_version]": "0",
    "msg[canal_token]": "",
    "msg[content]": JSON.stringify(content),
    from_firework: fromFirework,
    build: "0",
    mobi_app: "web",
    csrf,
    csrf_token: csrf
  });
  const postPrivateMessage = async ({ nav, form, receiver, devId, action }) => {
    const query = signWbi(
      {
        w_sender_uid: nav.mid,
        w_receiver_id: receiver.mid,
        w_dev_id: devId
      },
      nav.wbi_img
    );
    const result = await httpRequest({
      method: "POST",
      url: `https://api.vc.bilibili.com/web_im/v1/web_im/send_msg?${buildQuery(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json, text/plain, */*",
        Origin: "https://message.bilibili.com",
        Referer: "https://message.bilibili.com/"
      },
      data: form.toString()
    });
    return assertSuccess(result, action);
  };
  const getMixinKey = (imgKey, subKey) => MIXIN_KEY_ENC_TAB.map((index) => `${imgKey}${subKey}`[index]).join("").slice(0, 32);
  const signWbi = (params, wbiImg) => {
    if (!(wbiImg == null ? void 0 : wbiImg.img_url) || !(wbiImg == null ? void 0 : wbiImg.sub_url)) {
      return params;
    }
    const imgKey = wbiImg.img_url.split("/").pop().split(".")[0];
    const subKey = wbiImg.sub_url.split("/").pop().split(".")[0];
    const mixinKey = getMixinKey(imgKey, subKey);
    const signedParams = {
      ...params,
      wts: Math.round(Date.now() / 1e3)
    };
    const query = Object.keys(signedParams).sort().map((key) => {
      const value = String(signedParams[key]).replace(/[!'()*]/g, "");
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    }).join("&");
    return {
      ...signedParams,
      w_rid: md5(query + mixinKey)
    };
  };
  const getNav = async () => {
    if (navCache) {
      return navCache;
    }
    const result = await httpRequest({
      url: "https://api.bilibili.com/x/web-interface/nav"
    });
    const data = assertSuccess(result, "获取登录信息");
    navCache = data;
    return data;
  };
  const assertLogin = async () => {
    const nav = await getNav();
    const csrf = getCookie("bili_jct");
    if (!nav.isLogin) {
      throw new Error("当前未登录 B 站，请登录后再分享。");
    }
    if (!csrf) {
      throw new Error("未读取到 bili_jct，无法完成私信发送。");
    }
    return { nav, csrf };
  };
  const getVideoInfo = async () => {
    var _a, _b;
    const bvid = getBvidFromLocation();
    if (!bvid) {
      throw new Error("没有识别到当前视频的 BV 号。");
    }
    const result = await httpRequest({
      url: `https://api.bilibili.com/x/web-interface/view?${buildQuery({ bvid })}`
    });
    const data = assertSuccess(result, "获取视频信息");
    return {
      aid: data.aid,
      bvid: data.bvid || bvid,
      title: data.title,
      pic: normalizeImageUrl(data.pic),
      ownerName: ((_a = data.owner) == null ? void 0 : _a.name) || "UP主",
      ownerMid: ((_b = data.owner) == null ? void 0 : _b.mid) || 0
    };
  };
  const readSessionCache = () => {
    try {
      const cache = JSON.parse(localStorage.getItem(SESSION_CACHE_KEY) || "null");
      if (cache && Date.now() - cache.createdAt < SESSION_CACHE_TTL) {
        return cache.sessions;
      }
    } catch (error) {
      console.warn(`[${SCRIPT_ID}] recent sessions cache ignored`, error);
    }
    return null;
  };
  const writeSessionCache = (sessions) => {
    localStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({
        createdAt: Date.now(),
        sessions
      })
    );
  };
  const normalizeRelationUser = (user) => {
    const mid = Number(user.mid);
    if (!mid) {
      return null;
    }
    return {
      mid,
      name: user.uname || user.name || `UID ${mid}`,
      avatar: normalizeImageUrl(user.face),
      meta: `UID ${mid}`
    };
  };
  const getRecentTalkerIds = (sessions) => {
    const seen = /* @__PURE__ */ new Set();
    const talkerIds = [];
    for (const session of sessions) {
      const talkerId = Number(session.talker_id);
      if (Number(session.session_type) !== 1 || !talkerId || seen.has(talkerId)) {
        continue;
      }
      seen.add(talkerId);
      talkerIds.push(talkerId);
      if (talkerIds.length >= SESSION_LIMIT) {
        break;
      }
    }
    return talkerIds;
  };
  const getUserCards = async (uids) => {
    if (uids.length === 0) {
      return [];
    }
    const result = await httpRequest({
      url: `https://api.vc.bilibili.com/account/v1/user/cards?${buildQuery({
      uids: uids.join(",")
    })}`
    });
    const data = assertSuccess(result, "获取最近私信联系人资料");
    const userMap = new Map(
      (data || []).map((user) => [
        Number(user.mid),
        {
          mid: Number(user.mid),
          name: user.name,
          avatar: normalizeImageUrl(user.face)
        }
      ])
    );
    return uids.map((uid) => userMap.get(uid)).filter(Boolean);
  };
  const getRecentSessions = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedSessions = readSessionCache();
      if (cachedSessions) {
        return cachedSessions;
      }
    }
    const result = await httpRequest({
      url: `https://api.vc.bilibili.com/session_svr/v1/session_svr/get_sessions?${buildQuery({
      session_type: 1,
      sort_rule: 2,
      size: SESSION_LIMIT
    })}`
    });
    const data = assertSuccess(result, "获取最近私信联系人");
    const sessions = await getUserCards(getRecentTalkerIds(data.session_list || []));
    writeSessionCache(sessions);
    return sessions;
  };
  const getRelationUsers = async ({ action, url, mid, page, pageSize, extraParams = {} }) => {
    const result = await httpRequest({
      url: `${url}?${buildQuery({
      vmid: mid,
      pn: page,
      ps: pageSize,
      order: "desc",
      order_type: "attention",
      ...extraParams
    })}`
    });
    const data = assertSuccess(result, action);
    const users = (data.list || []).map(normalizeRelationUser).filter(Boolean);
    const total = Number(data.total || 0);
    return {
      users,
      total,
      hasMore: total ? page * pageSize < total : users.length >= pageSize
    };
  };
  const getFollowings = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) => getRelationUsers({
    action: "获取我的关注",
    url: "https://api.bilibili.com/x/relation/followings",
    mid,
    page,
    pageSize
  });
  const searchFollowings = ({ mid, keyword, page = 1, pageSize = RELATION_PAGE_SIZE }) => getRelationUsers({
    action: "搜索我的关注",
    url: "https://api.bilibili.com/x/relation/followings/search",
    mid,
    page,
    pageSize,
    extraParams: {
      name: keyword
    }
  });
  const getFollowers = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) => getRelationUsers({
    action: "获取我的粉丝",
    url: "https://api.bilibili.com/x/relation/followers",
    mid,
    page,
    pageSize
  });
  const getDevId = () => {
    const cachedDevId = localStorage.getItem(DEV_ID_KEY);
    if (cachedDevId) {
      return cachedDevId;
    }
    const devId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (name) => {
      const randomInt = Math.random() * 16 | 0;
      return (name === "x" ? randomInt : randomInt & 3 | 8).toString(16).toUpperCase();
    });
    localStorage.setItem(DEV_ID_KEY, devId);
    return devId;
  };
  const sendVideoText = async ({ nav, csrf, video, receiver }) => {
    const devId = getDevId();
    const timestamp = Math.round(Date.now() / 1e3);
    const content = {
      content: `分享视频：【UP主：${video.ownerName}】${video.title}
https://www.bilibili.com/video/${video.bvid}`
    };
    const form = createSendMessageForm({
      nav,
      csrf,
      receiver,
      msgType: 1,
      content,
      devId,
      timestamp,
      fromFirework: "0"
    });
    return postPrivateMessage({
      nav,
      form,
      receiver,
      devId,
      action: "发送视频链接私信"
    });
  };
  var n, l$1, u$2, i$1, r$1, o$1, e$1, f$2, c$1, a$1, s$1, h$1, p$1, v$1, d$1 = {}, w$1 = [], _$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, g = Array.isArray;
  function m$1(n2, l2) {
    for (var u2 in l2) n2[u2] = l2[u2];
    return n2;
  }
  function b(n2) {
    n2 && n2.parentNode && n2.parentNode.removeChild(n2);
  }
  function k$1(l2, u2, t2) {
    var i2, r2, o2, e2 = {};
    for (o2 in u2) "key" == o2 ? i2 = u2[o2] : "ref" == o2 ? r2 = u2[o2] : e2[o2] = u2[o2];
    if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (o2 in l2.defaultProps) void 0 === e2[o2] && (e2[o2] = l2.defaultProps[o2]);
    return x(l2, e2, i2, r2, null);
  }
  function x(n2, t2, i2, r2, o2) {
    var e2 = { type: n2, props: t2, key: i2, ref: r2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == o2 ? ++u$2 : o2, __i: -1, __u: 0 };
    return null == o2 && null != l$1.vnode && l$1.vnode(e2), e2;
  }
  function S(n2) {
    return n2.children;
  }
  function C$1(n2, l2) {
    this.props = n2, this.context = l2;
  }
  function $(n2, l2) {
    if (null == l2) return n2.__ ? $(n2.__, n2.__i + 1) : null;
    for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
    return "function" == typeof n2.type ? $(n2) : null;
  }
  function I(n2) {
    if (n2.__P && n2.__d) {
      var u2 = n2.__v, t2 = u2.__e, i2 = [], r2 = [], o2 = m$1({}, u2);
      o2.__v = u2.__v + 1, l$1.vnode && l$1.vnode(o2), q$1(n2.__P, o2, u2, n2.__n, n2.__P.namespaceURI, 32 & u2.__u ? [t2] : null, i2, null == t2 ? $(u2) : t2, !!(32 & u2.__u), r2), o2.__v = u2.__v, o2.__.__k[o2.__i] = o2, D$1(i2, o2, r2), u2.__e = u2.__ = null, o2.__e != t2 && P(o2);
    }
  }
  function P(n2) {
    if (null != (n2 = n2.__) && null != n2.__c) return n2.__e = n2.__c.base = null, n2.__k.some(function(l2) {
      if (null != l2 && null != l2.__e) return n2.__e = n2.__c.base = l2.__e;
    }), P(n2);
  }
  function A$1(n2) {
    (!n2.__d && (n2.__d = true) && i$1.push(n2) && !H.__r++ || r$1 != l$1.debounceRendering) && ((r$1 = l$1.debounceRendering) || o$1)(H);
  }
  function H() {
    try {
      for (var n2, l2 = 1; i$1.length; ) i$1.length > l2 && i$1.sort(e$1), n2 = i$1.shift(), l2 = i$1.length, I(n2);
    } finally {
      i$1.length = H.__r = 0;
    }
  }
  function L(n2, l2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, _2, g2, m2 = t2 && t2.__k || w$1, b2 = l2.length;
    for (f2 = T$1(u2, l2, m2, f2, b2), s2 = 0; s2 < b2; s2++) null != (p2 = u2.__k[s2]) && (h2 = -1 != p2.__i && m2[p2.__i] || d$1, p2.__i = s2, _2 = q$1(n2, p2, h2, i2, r2, o2, e2, f2, c2, a2), v2 = p2.__e, p2.ref && h2.ref != p2.ref && (h2.ref && J(h2.ref, null, p2), a2.push(p2.ref, p2.__c || v2, p2)), null == y2 && null != v2 && (y2 = v2), (g2 = !!(4 & p2.__u)) || h2.__k === p2.__k ? (f2 = j$1(p2, f2, n2, g2), g2 && h2.__e && (h2.__e = null)) : "function" == typeof p2.type && void 0 !== _2 ? f2 = _2 : v2 && (f2 = v2.nextSibling), p2.__u &= -7);
    return u2.__e = y2, f2;
  }
  function T$1(n2, l2, u2, t2, i2) {
    var r2, o2, e2, f2, c2, a2 = u2.length, s2 = a2, h2 = 0;
    for (n2.__k = new Array(i2), r2 = 0; r2 < i2; r2++) null != (o2 = l2[r2]) && "boolean" != typeof o2 && "function" != typeof o2 ? ("string" == typeof o2 || "number" == typeof o2 || "bigint" == typeof o2 || o2.constructor == String ? o2 = n2.__k[r2] = x(null, o2, null, null, null) : g(o2) ? o2 = n2.__k[r2] = x(S, { children: o2 }, null, null, null) : void 0 === o2.constructor && o2.__b > 0 ? o2 = n2.__k[r2] = x(o2.type, o2.props, o2.key, o2.ref ? o2.ref : null, o2.__v) : n2.__k[r2] = o2, f2 = r2 + h2, o2.__ = n2, o2.__b = n2.__b + 1, e2 = null, -1 != (c2 = o2.__i = O(o2, u2, f2, s2)) && (s2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > a2 ? h2-- : i2 < a2 && h2++), "function" != typeof o2.type && (o2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, o2.__u |= 4))) : n2.__k[r2] = null;
    if (s2) for (r2 = 0; r2 < a2; r2++) null != (e2 = u2[r2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = $(e2)), K(e2, e2));
    return t2;
  }
  function j$1(n2, l2, u2, t2) {
    var i2, r2;
    if ("function" == typeof n2.type) {
      for (i2 = n2.__k, r2 = 0; i2 && r2 < i2.length; r2++) i2[r2] && (i2[r2].__ = n2, l2 = j$1(i2[r2], l2, u2, t2));
      return l2;
    }
    n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = $(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
    do {
      l2 = l2 && l2.nextSibling;
    } while (null != l2 && 8 == l2.nodeType);
    return l2;
  }
  function O(n2, l2, u2, t2) {
    var i2, r2, o2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], a2 = null != c2 && 0 == (2 & c2.__u);
    if (null === c2 && null == e2 || a2 && e2 == c2.key && f2 == c2.type) return u2;
    if (t2 > (a2 ? 1 : 0)) {
      for (i2 = u2 - 1, r2 = u2 + 1; i2 >= 0 || r2 < l2.length; ) if (null != (c2 = l2[o2 = i2 >= 0 ? i2-- : r2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return o2;
    }
    return -1;
  }
  function z$1(n2, l2, u2) {
    "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || _$1.test(l2) ? u2 : u2 + "px";
  }
  function N(n2, l2, u2, t2, i2) {
    var r2, o2;
    n: if ("style" == l2) if ("string" == typeof u2) n2.style.cssText = u2;
    else {
      if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || z$1(n2.style, l2, "");
      if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || z$1(n2.style, l2, u2[l2]);
    }
    else if ("o" == l2[0] && "n" == l2[1]) r2 = l2 != (l2 = l2.replace(s$1, "$1")), o2 = l2.toLowerCase(), l2 = o2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? o2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + r2] = u2, u2 ? t2 ? u2[a$1] = t2[a$1] : (u2[a$1] = h$1, n2.addEventListener(l2, r2 ? v$1 : p$1, r2)) : n2.removeEventListener(l2, r2 ? v$1 : p$1, r2);
    else {
      if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
        n2[l2] = null == u2 ? "" : u2;
        break n;
      } catch (n3) {
      }
      "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
    }
  }
  function V(n2) {
    return function(u2) {
      if (this.l) {
        var t2 = this.l[u2.type + n2];
        if (null == u2[c$1]) u2[c$1] = h$1++;
        else if (u2[c$1] < t2[a$1]) return;
        return t2(l$1.event ? l$1.event(u2) : u2);
      }
    };
  }
  function q$1(n2, u2, t2, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, d2, _2, k2, x2, M, $2, I2, P2, A2, H2, T2 = u2.type;
    if (void 0 !== u2.constructor) return null;
    128 & t2.__u && (c2 = !!(32 & t2.__u), o2 = [f2 = u2.__e = t2.__e]), (s2 = l$1.__b) && s2(u2);
    n: if ("function" == typeof T2) try {
      if (k2 = u2.props, x2 = T2.prototype && T2.prototype.render, M = (s2 = T2.contextType) && i2[s2.__c], $2 = s2 ? M ? M.props.value : s2.__ : i2, t2.__c ? _2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (x2 ? u2.__c = h2 = new T2(k2, $2) : (u2.__c = h2 = new C$1(k2, $2), h2.constructor = T2, h2.render = Q), M && M.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), x2 && null == h2.__s && (h2.__s = h2.state), x2 && null != T2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = m$1({}, h2.__s)), m$1(h2.__s, T2.getDerivedStateFromProps(k2, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) x2 && null == T2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), x2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
      else {
        if (x2 && null == T2.getDerivedStateFromProps && k2 !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(k2, $2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(k2, h2.__s, $2)) {
          u2.__v != t2.__v && (h2.props = k2, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
            n3 && (n3.__ = u2);
          }), w$1.push.apply(h2.__h, h2._sb), h2._sb = [], h2.__h.length && e2.push(h2);
          break n;
        }
        null != h2.componentWillUpdate && h2.componentWillUpdate(k2, h2.__s, $2), x2 && null != h2.componentDidUpdate && h2.__h.push(function() {
          h2.componentDidUpdate(v2, y2, d2);
        });
      }
      if (h2.context = $2, h2.props = k2, h2.__P = n2, h2.__e = false, I2 = l$1.__r, P2 = 0, x2) h2.state = h2.__s, h2.__d = false, I2 && I2(u2), s2 = h2.render(h2.props, h2.state, h2.context), w$1.push.apply(h2.__h, h2._sb), h2._sb = [];
      else do {
        h2.__d = false, I2 && I2(u2), s2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
      } while (h2.__d && ++P2 < 25);
      h2.state = h2.__s, null != h2.getChildContext && (i2 = m$1(m$1({}, i2), h2.getChildContext())), x2 && !p2 && null != h2.getSnapshotBeforeUpdate && (d2 = h2.getSnapshotBeforeUpdate(v2, y2)), A2 = null != s2 && s2.type === S && null == s2.key ? E(s2.props.children) : s2, f2 = L(n2, g(A2) ? A2 : [A2], u2, t2, i2, r2, o2, e2, f2, c2, a2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), _2 && (h2.__E = h2.__ = null);
    } catch (n3) {
      if (u2.__v = null, c2 || null != o2) if (n3.then) {
        for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
        o2[o2.indexOf(f2)] = null, u2.__e = f2;
      } else {
        for (H2 = o2.length; H2--; ) b(o2[H2]);
        B$1(u2);
      }
      else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || B$1(u2);
      l$1.__e(n3, u2, t2);
    }
    else null == o2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = G(t2.__e, u2, t2, i2, r2, o2, e2, c2, a2);
    return (s2 = l$1.diffed) && s2(u2), 128 & u2.__u ? void 0 : f2;
  }
  function B$1(n2) {
    n2 && (n2.__c && (n2.__c.__e = true), n2.__k && n2.__k.some(B$1));
  }
  function D$1(n2, u2, t2) {
    for (var i2 = 0; i2 < t2.length; i2++) J(t2[i2], t2[++i2], t2[++i2]);
    l$1.__c && l$1.__c(u2, n2), n2.some(function(u3) {
      try {
        n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
          n3.call(u3);
        });
      } catch (n3) {
        l$1.__e(n3, u3.__v);
      }
    });
  }
  function E(n2) {
    return "object" != typeof n2 || null == n2 || n2.__b > 0 ? n2 : g(n2) ? n2.map(E) : void 0 !== n2.constructor ? null : m$1({}, n2);
  }
  function G(u2, t2, i2, r2, o2, e2, f2, c2, a2) {
    var s2, h2, p2, v2, y2, w2, _2, m2 = i2.props || d$1, k2 = t2.props, x2 = t2.type;
    if ("svg" == x2 ? o2 = "http://www.w3.org/2000/svg" : "math" == x2 ? o2 = "http://www.w3.org/1998/Math/MathML" : o2 || (o2 = "http://www.w3.org/1999/xhtml"), null != e2) {
      for (s2 = 0; s2 < e2.length; s2++) if ((y2 = e2[s2]) && "setAttribute" in y2 == !!x2 && (x2 ? y2.localName == x2 : 3 == y2.nodeType)) {
        u2 = y2, e2[s2] = null;
        break;
      }
    }
    if (null == u2) {
      if (null == x2) return document.createTextNode(k2);
      u2 = document.createElementNS(o2, x2, k2.is && k2), c2 && (l$1.__m && l$1.__m(t2, e2), c2 = false), e2 = null;
    }
    if (null == x2) m2 === k2 || c2 && u2.data == k2 || (u2.data = k2);
    else {
      if (e2 = "textarea" == x2 && null != k2.defaultValue ? null : e2 && n.call(u2.childNodes), !c2 && null != e2) for (m2 = {}, s2 = 0; s2 < u2.attributes.length; s2++) m2[(y2 = u2.attributes[s2]).name] = y2.value;
      for (s2 in m2) y2 = m2[s2], "dangerouslySetInnerHTML" == s2 ? p2 = y2 : "children" == s2 || s2 in k2 || "value" == s2 && "defaultValue" in k2 || "checked" == s2 && "defaultChecked" in k2 || N(u2, s2, null, y2, o2);
      for (s2 in k2) y2 = k2[s2], "children" == s2 ? v2 = y2 : "dangerouslySetInnerHTML" == s2 ? h2 = y2 : "value" == s2 ? w2 = y2 : "checked" == s2 ? _2 = y2 : c2 && "function" != typeof y2 || m2[s2] === y2 || N(u2, s2, y2, m2[s2], o2);
      if (h2) c2 || p2 && (h2.__html == p2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
      else if (p2 && (u2.innerHTML = ""), L("template" == t2.type ? u2.content : u2, g(v2) ? v2 : [v2], t2, i2, r2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : o2, e2, f2, e2 ? e2[0] : i2.__k && $(i2, 0), c2, a2), null != e2) for (s2 = e2.length; s2--; ) b(e2[s2]);
      c2 && "textarea" != x2 || (s2 = "value", "progress" == x2 && null == w2 ? u2.removeAttribute("value") : null != w2 && (w2 !== u2[s2] || "progress" == x2 && !w2 || "option" == x2 && w2 != m2[s2]) && N(u2, s2, w2, m2[s2], o2), s2 = "checked", null != _2 && _2 != u2[s2] && N(u2, s2, _2, m2[s2], o2));
    }
    return u2;
  }
  function J(n2, u2, t2) {
    try {
      if ("function" == typeof n2) {
        var i2 = "function" == typeof n2.__u;
        i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
      } else n2.current = u2;
    } catch (n3) {
      l$1.__e(n3, t2);
    }
  }
  function K(n2, u2, t2) {
    var i2, r2;
    if (l$1.unmount && l$1.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || J(i2, null, u2)), null != (i2 = n2.__c)) {
      if (i2.componentWillUnmount) try {
        i2.componentWillUnmount();
      } catch (n3) {
        l$1.__e(n3, u2);
      }
      i2.base = i2.__P = null;
    }
    if (i2 = n2.__k) for (r2 = 0; r2 < i2.length; r2++) i2[r2] && K(i2[r2], u2, t2 || "function" != typeof n2.type);
    t2 || b(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
  }
  function Q(n2, l2, u2) {
    return this.constructor(n2, u2);
  }
  function R(u2, t2, i2) {
    var r2, o2, e2, f2;
    t2 == document && (t2 = document.documentElement), l$1.__ && l$1.__(u2, t2), o2 = (r2 = false) ? null : t2.__k, e2 = [], f2 = [], q$1(t2, u2 = t2.__k = k$1(S, null, [u2]), o2 || d$1, d$1, t2.namespaceURI, o2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, o2 ? o2.__e : t2.firstChild, r2, f2), D$1(e2, u2, f2);
  }
  n = w$1.slice, l$1 = { __e: function(n2, l2, u2, t2) {
    for (var i2, r2, o2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
      if ((r2 = i2.constructor) && null != r2.getDerivedStateFromError && (i2.setState(r2.getDerivedStateFromError(n2)), o2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), o2 = i2.__d), o2) return i2.__E = i2;
    } catch (l3) {
      n2 = l3;
    }
    throw n2;
  } }, u$2 = 0, C$1.prototype.setState = function(n2, l2) {
    var u2;
    u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = m$1({}, this.state), "function" == typeof n2 && (n2 = n2(m$1({}, u2), this.props)), n2 && m$1(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), A$1(this));
  }, C$1.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), A$1(this));
  }, C$1.prototype.render = S, i$1 = [], o$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
    return n2.__v.__b - l2.__v.__b;
  }, H.__r = 0, f$2 = Math.random().toString(8), c$1 = "__d" + f$2, a$1 = "__a" + f$2, s$1 = /(PointerCapture)$|Capture$/i, h$1 = 0, p$1 = V(false), v$1 = V(true);
  var f$1 = 0;
  function u$1(e2, t2, n2, o2, i2, u2) {
    t2 || (t2 = {});
    var a2, c2, p2 = t2;
    if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
    var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f$1, __i: -1, __u: 0, __source: i2, __self: u2 };
    if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
    return l$1.vnode && l$1.vnode(l2), l2;
  }
  var t, r, u, i, o = 0, f = [], c = l$1, e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, s = c.__;
  function p(n2, t2) {
    c.__h && c.__h(r, n2, o || t2), o = 0;
    var u2 = r.__H || (r.__H = { __: [], __h: [] });
    return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
  }
  function d(n2) {
    return o = 1, h(D, n2);
  }
  function h(n2, u2, i2) {
    var o2 = p(t++, 2);
    if (o2.t = n2, !o2.__c && (o2.__ = [D(void 0, u2), function(n3) {
      var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
      t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
    }], o2.__c = r, !r.__f)) {
      var f2 = function(n3, t2, r2) {
        if (!o2.__c.__H) return true;
        var u3 = o2.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u3.every(function(n4) {
          return !n4.__N;
        })) return !c2 || c2.call(this, n3, t2, r2);
        var i3 = o2.__c.props !== n3;
        return u3.some(function(n4) {
          if (n4.__N) {
            var t3 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
          }
        }), c2 && c2.call(this, n3, t2, r2) || i3;
      };
      r.__f = true;
      var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
      r.componentWillUpdate = function(n3, t2, r2) {
        if (this.__e) {
          var u3 = c2;
          c2 = void 0, f2(n3, t2, r2), c2 = u3;
        }
        e2 && e2.call(this, n3, t2, r2);
      }, r.shouldComponentUpdate = f2;
    }
    return o2.__N || o2.__;
  }
  function y(n2, u2) {
    var i2 = p(t++, 3);
    !c.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__H.__h.push(i2));
  }
  function _(n2, u2) {
    var i2 = p(t++, 4);
    !c.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__h.push(i2));
  }
  function A(n2) {
    return o = 5, T(function() {
      return { current: n2 };
    }, []);
  }
  function T(n2, r2) {
    var u2 = p(t++, 7);
    return C(u2.__H, r2) && (u2.__ = n2(), u2.__H = r2, u2.__h = n2), u2.__;
  }
  function q(n2, t2) {
    return o = 8, T(function() {
      return n2;
    }, t2);
  }
  function j() {
    for (var n2; n2 = f.shift(); ) {
      var t2 = n2.__H;
      if (n2.__P && t2) try {
        t2.__h.some(z), t2.__h.some(B), t2.__h = [];
      } catch (r2) {
        t2.__h = [], c.__e(r2, n2.__v);
      }
    }
  }
  c.__b = function(n2) {
    r = null, e && e(n2);
  }, c.__ = function(n2, t2) {
    n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s && s(n2, t2);
  }, c.__r = function(n2) {
    a && a(n2), t = 0;
    var i2 = (r = n2.__c).__H;
    i2 && (u === r ? (i2.__h = [], r.__h = [], i2.__.some(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
    })) : (i2.__h.some(z), i2.__h.some(B), i2.__h = [], t = 0)), u = r;
  }, c.diffed = function(n2) {
    v && v(n2);
    var t2 = n2.__c;
    t2 && t2.__H && (t2.__H.__h.length && (1 !== f.push(t2) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t2.__H.__.some(function(n3) {
      n3.u && (n3.__H = n3.u), n3.u = void 0;
    })), u = r = null;
  }, c.__c = function(n2, t2) {
    t2.some(function(n3) {
      try {
        n3.__h.some(z), n3.__h = n3.__h.filter(function(n4) {
          return !n4.__ || B(n4);
        });
      } catch (r2) {
        t2.some(function(n4) {
          n4.__h && (n4.__h = []);
        }), t2 = [], c.__e(r2, n3.__v);
      }
    }), l && l(n2, t2);
  }, c.unmount = function(n2) {
    m && m(n2);
    var t2, r2 = n2.__c;
    r2 && r2.__H && (r2.__H.__.some(function(n3) {
      try {
        z(n3);
      } catch (n4) {
        t2 = n4;
      }
    }), r2.__H = void 0, t2 && c.__e(t2, r2.__v));
  };
  var k = "function" == typeof requestAnimationFrame;
  function w(n2) {
    var t2, r2 = function() {
      clearTimeout(u2), k && cancelAnimationFrame(t2), setTimeout(n2);
    }, u2 = setTimeout(r2, 35);
    k && (t2 = requestAnimationFrame(r2));
  }
  function z(n2) {
    var t2 = r, u2 = n2.__c;
    "function" == typeof u2 && (n2.__c = void 0, u2()), r = t2;
  }
  function B(n2) {
    var t2 = r;
    n2.__c = n2.__(), r = t2;
  }
  function C(n2, t2) {
    return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
      return t3 !== n2[r2];
    });
  }
  function D(n2, t2) {
    return "function" == typeof t2 ? t2(n2) : t2;
  }
  const relationOptions = [
    { value: "following", label: "我的关注" },
    { value: "followers", label: "我的粉丝" }
  ];
  const RelationFilter = ({ activeRelation, onChange }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-relation-filter`, children: relationOptions.map((option) => /* @__PURE__ */ u$1("label", { className: `${SCRIPT_ID}-relation-option`, children: [
    /* @__PURE__ */ u$1(
      "input",
      {
        type: "radio",
        name: `${SCRIPT_ID}-relation`,
        value: option.value,
        checked: activeRelation === option.value,
        onChange: () => onChange(option.value)
      }
    ),
    /* @__PURE__ */ u$1("span", { children: option.label })
  ] }, option.value)) });
  const SearchBox = ({
    value,
    placeholder = "搜索用户昵称",
    notice = "",
    onCompositionStart = () => {
    },
    onInput
  }) => {
    const inputRef = A(null);
    const composingRef = A(false);
    const lastCommittedValueRef = A(value ?? "");
    const latestCallbacksRef = A({ onCompositionStart, onInput });
    latestCallbacksRef.current = { onCompositionStart, onInput };
    _(() => {
      if (composingRef.current) {
        return;
      }
      const nextValue = value ?? "";
      if (inputRef.current && inputRef.current.value !== nextValue) {
        inputRef.current.value = nextValue;
        lastCommittedValueRef.current = nextValue;
      }
    }, [value]);
    y(() => {
      const input = inputRef.current;
      if (!input) {
        return () => {
        };
      }
      let compositionCommitTimer = null;
      const clearCompositionCommit = () => {
        window.clearTimeout(compositionCommitTimer);
        compositionCommitTimer = null;
      };
      const commitValue = (nextValue, options) => {
        if (lastCommittedValueRef.current === nextValue) {
          return;
        }
        lastCommittedValueRef.current = nextValue;
        latestCallbacksRef.current.onInput(nextValue, options);
      };
      const commitCurrentValue = (options) => {
        clearCompositionCommit();
        commitValue(input.value, options);
      };
      const scheduleCompositionCommit = () => {
        clearCompositionCommit();
        compositionCommitTimer = window.setTimeout(() => {
          commitCurrentValue({ immediate: true });
        }, 0);
      };
      const handleCompositionStart = () => {
        clearCompositionCommit();
        composingRef.current = true;
        latestCallbacksRef.current.onCompositionStart();
      };
      const handleCompositionEnd = () => {
        composingRef.current = false;
        scheduleCompositionCommit();
      };
      const handleInput = (event) => {
        if (composingRef.current || event.isComposing) {
          return;
        }
        if (compositionCommitTimer) {
          return;
        }
        commitCurrentValue();
      };
      const handleChange = () => {
        if (!composingRef.current) {
          commitCurrentValue();
        }
      };
      const handleKeyUp = (event) => {
        if (!composingRef.current && !event.isComposing) {
          commitCurrentValue({ immediate: true });
        }
      };
      input.addEventListener("compositionstart", handleCompositionStart);
      input.addEventListener("compositionend", handleCompositionEnd);
      input.addEventListener("input", handleInput);
      input.addEventListener("change", handleChange);
      input.addEventListener("keyup", handleKeyUp);
      return () => {
        clearCompositionCommit();
        input.removeEventListener("compositionstart", handleCompositionStart);
        input.removeEventListener("compositionend", handleCompositionEnd);
        input.removeEventListener("input", handleInput);
        input.removeEventListener("change", handleChange);
        input.removeEventListener("keyup", handleKeyUp);
      };
    }, []);
    return /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-search`, children: [
      /* @__PURE__ */ u$1(
        "input",
        {
          ref: inputRef,
          className: `${SCRIPT_ID}-search-input`,
          type: "search",
          defaultValue: value,
          placeholder
        }
      ),
      notice ? /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-search-notice`, children: notice }) : null
    ] });
  };
  const StateView = ({ text, isError = false }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`, children: text });
  const UserListItem = ({ user, selected = false, onSelect }) => {
    return /* @__PURE__ */ u$1(
      "div",
      {
        className: `${SCRIPT_ID}-person`,
        "data-selected": String(selected),
        onClick: () => onSelect(user),
        children: [
          /* @__PURE__ */ u$1(
            "img",
            {
              className: `${SCRIPT_ID}-avatar`,
              src: user.avatar,
              alt: "",
              referrerPolicy: "no-referrer",
              onError: (event) => {
                if (event.currentTarget.dataset.fallbackApplied === "true") {
                  return;
                }
                event.currentTarget.dataset.fallbackApplied = "true";
                event.currentTarget.src = DEFAULT_AVATAR_URL;
              }
            }
          ),
          /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-person-main`, children: [
            /* @__PURE__ */ u$1(
              "a",
              {
                className: `${SCRIPT_ID}-name`,
                href: `https://space.bilibili.com/${user.mid}`,
                target: "_blank",
                rel: "noopener noreferrer",
                onClick: (event) => event.stopPropagation(),
                children: user.name
              }
            ),
            /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-meta`, children: user.meta || `UID ${user.mid}` })
          ] }),
          /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-check` })
        ]
      }
    );
  };
  const UserListFooter = ({ loadingMore, hasMore, moreError, footerText, onRetry }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-list-footer`, children: moreError ? /* @__PURE__ */ u$1("button", { className: `${SCRIPT_ID}-list-retry`, type: "button", onClick: onRetry, children: [
    moreError,
    "，点击重试"
  ] }) : /* @__PURE__ */ u$1("div", { children: footerText || (loadingMore ? "正在加载更多..." : hasMore ? "" : "没有更多了") }) });
  const UserList = ({
    users,
    selectedMid = null,
    loadingMore = false,
    hasMore = false,
    moreError = "",
    footerText = "",
    showFooter = false,
    onRetry = () => {
    },
    onSelect
  }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-list-scroll`, "data-bili-share-to-friends-list-scroll": "true", children: [
    /* @__PURE__ */ u$1("ul", { className: `${SCRIPT_ID}-list`, children: users.map((user) => /* @__PURE__ */ u$1("li", { children: /* @__PURE__ */ u$1(UserListItem, { user, selected: user.mid === selectedMid, onSelect }) }, user.mid)) }),
    showFooter || footerText ? /* @__PURE__ */ u$1(
      UserListFooter,
      {
        loadingMore,
        hasMore,
        moreError,
        footerText,
        onRetry
      }
    ) : null,
    showFooter && hasMore && !moreError ? /* @__PURE__ */ u$1(
      "div",
      {
        className: `${SCRIPT_ID}-list-sentinel`,
        "data-bili-share-to-friends-list-sentinel": "true"
      }
    ) : null
  ] });
  const createPageState = () => ({
    users: [],
    page: 0,
    hasMore: true,
    loadingPage: 0,
    moreError: "",
    error: "",
    loaded: false
  });
  const createRelationsState = () => ({
    following: createPageState(),
    followers: createPageState()
  });
  const getPageLoadingState = (state) => ({
    loading: state.loadingPage > 0 && (state.loadingPage === 1 || !state.loaded),
    loadingMore: state.loadingPage > 0 && state.loaded && state.loadingPage > 1
  });
  const AllFriendsPanel = ({
    active,
    mid,
    selectedMid = null,
    onSelect,
    onSelectionReset = () => {
    }
  }) => {
    const panelRef = A(null);
    const stateRef = A(null);
    const loadMoreObserverRef = A(null);
    const loadingKeysRef = A(/* @__PURE__ */ new Set());
    const pendingScrollTopRef = A(null);
    const scrollTopMapRef = A({
      following: 0,
      followers: 0,
      followingSearch: 0
    });
    const [activeRelation, setActiveRelation] = d("following");
    const [searchTerm, setSearchTerm] = d("");
    const [relations, setRelations] = d(createRelationsState);
    const [followingSearch, setFollowingSearch] = d(createPageState);
    const keyword = searchTerm.trim();
    const normalizedKeyword = keyword.toLowerCase();
    const displaySource = activeRelation === "following" && keyword ? "followingSearch" : activeRelation;
    const relationState = relations[activeRelation];
    const displayState = T(() => {
      if (displaySource === "followingSearch") {
        return followingSearch;
      }
      return relationState;
    }, [displaySource, followingSearch, relationState]);
    const displayLoading = T(() => getPageLoadingState(displayState), [displayState]);
    const displayUsers = T(() => {
      if (!normalizedKeyword) {
        return relationState.users;
      }
      if (activeRelation === "following") {
        return followingSearch.users;
      }
      return relationState.users.filter(
        (user) => user.name.toLowerCase().includes(normalizedKeyword)
      );
    }, [activeRelation, followingSearch.users, normalizedKeyword, relationState]);
    stateRef.current = {
      activeRelation,
      searchTerm,
      relations,
      followingSearch,
      mid
    };
    y(() => {
      setActiveRelation("following");
      setSearchTerm("");
      setRelations(createRelationsState());
      setFollowingSearch(createPageState());
      scrollTopMapRef.current = {
        following: 0,
        followers: 0,
        followingSearch: 0
      };
      onSelectionReset();
    }, [mid, onSelectionReset]);
    _(() => {
      var _a;
      const scrollTop = pendingScrollTopRef.current;
      if (scrollTop === null) {
        return;
      }
      pendingScrollTopRef.current = null;
      const scrollRoot = (_a = panelRef.current) == null ? void 0 : _a.querySelector(LIST_SCROLL_SELECTOR);
      if (scrollRoot) {
        scrollRoot.scrollTop = scrollTop;
      }
    }, [relations]);
    const getListScrollTop = q(
      () => {
        var _a, _b;
        return ((_b = (_a = panelRef.current) == null ? void 0 : _a.querySelector(LIST_SCROLL_SELECTOR)) == null ? void 0 : _b.scrollTop) ?? 0;
      },
      []
    );
    const saveCurrentScrollTop = q(() => {
      scrollTopMapRef.current[displaySource] = getListScrollTop();
    }, [displaySource, getListScrollTop]);
    const setPageState = q((source, updater) => {
      if (source === "followingSearch") {
        setFollowingSearch(updater);
        return;
      }
      setRelations((currentRelations) => ({
        ...currentRelations,
        [source]: updater(currentRelations[source])
      }));
    }, []);
    const loadRelationUsers = q(
      async (relation, { reset = false, keywordOverride = null } = {}) => {
        const current = stateRef.current;
        const keyword2 = (keywordOverride ?? current.searchTerm).trim();
        const useSearch = relation === "following" && Boolean(keyword2);
        const source = useSearch ? "followingSearch" : relation;
        const relationState2 = current.relations[relation];
        const displayState2 = useSearch ? current.followingSearch : relationState2;
        const loadingState = getPageLoadingState(displayState2);
        const loadingKey = `${relation}:${useSearch ? keyword2 : "list"}`;
        if (!current.mid || loadingKeysRef.current.has(loadingKey) || loadingState.loading || loadingState.loadingMore || !reset && displayState2.loaded && !displayState2.hasMore) {
          return;
        }
        const nextPage = reset ? 1 : displayState2.page + 1;
        const listScrollTop = !reset && displayState2.loaded ? getListScrollTop() : null;
        pendingScrollTopRef.current = listScrollTop;
        loadingKeysRef.current.add(loadingKey);
        setPageState(source, (state) => ({
          ...state,
          loadingPage: nextPage,
          error: "",
          moreError: ""
        }));
        try {
          const loader = useSearch ? searchFollowings : relation === "following" ? getFollowings : getFollowers;
          const nextResult = await loader({
            mid: current.mid,
            keyword: keyword2,
            page: nextPage
          });
          setPageState(source, (state) => ({
            ...state,
            users: nextPage === 1 ? nextResult.users : [...state.users, ...nextResult.users],
            page: nextPage,
            hasMore: nextResult.hasMore,
            loaded: true
          }));
        } catch (loadError) {
          setPageState(source, (state) => {
            if (useSearch && nextPage === 1) {
              return {
                ...state,
                users: relationState2.users.filter(
                  (user) => user.name.toLowerCase().includes(keyword2.toLowerCase())
                ),
                hasMore: false,
                loaded: true
              };
            }
            if (nextPage === 1) {
              return {
                ...state,
                error: loadError.message
              };
            }
            return {
              ...state,
              moreError: loadError.message
            };
          });
        } finally {
          loadingKeysRef.current.delete(loadingKey);
          setPageState(source, (state) => ({
            ...state,
            loadingPage: 0
          }));
        }
      },
      [getListScrollTop, setPageState]
    );
    const debouncedSearch = T(
      () => debounce((nextKeyword) => {
        const current = stateRef.current;
        if (current.activeRelation === "following" && nextKeyword) {
          loadRelationUsers("following", { reset: true, keywordOverride: nextKeyword });
        }
      }, 300),
      [loadRelationUsers]
    );
    y(() => {
      return () => {
        var _a;
        return (_a = loadMoreObserverRef.current) == null ? void 0 : _a.disconnect();
      };
    }, []);
    y(() => {
      return () => debouncedSearch.cancel();
    }, [debouncedSearch]);
    y(() => {
      if (active && !displayState.loaded && !displayState.error && !displayLoading.loading) {
        loadRelationUsers(activeRelation);
      }
    }, [
      active,
      activeRelation,
      displayLoading.loading,
      displayState.error,
      displayState.loaded,
      loadRelationUsers
    ]);
    y(() => {
      var _a, _b;
      (_a = loadMoreObserverRef.current) == null ? void 0 : _a.disconnect();
      loadMoreObserverRef.current = null;
      if (!active || !displayState.loaded || !displayState.hasMore || displayState.moreError || displayLoading.loading || displayLoading.loadingMore) {
        return;
      }
      const scrollRoot = (_b = panelRef.current) == null ? void 0 : _b.querySelector(LIST_SCROLL_SELECTOR);
      const sentinel = scrollRoot == null ? void 0 : scrollRoot.querySelector("[data-bili-share-to-friends-list-sentinel]");
      if (!scrollRoot || !sentinel) {
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            loadRelationUsers(activeRelation);
          }
        },
        { root: scrollRoot, threshold: 0.1 }
      );
      observer.observe(sentinel);
      loadMoreObserverRef.current = observer;
      return () => observer.disconnect();
    }, [
      active,
      activeRelation,
      displayLoading.loading,
      displayLoading.loadingMore,
      displayState.hasMore,
      displayState.loaded,
      displayState.moreError,
      loadRelationUsers
    ]);
    _(() => {
      var _a;
      if (!active) {
        return;
      }
      const scrollRoot = (_a = panelRef.current) == null ? void 0 : _a.querySelector(LIST_SCROLL_SELECTOR);
      if (scrollRoot) {
        scrollRoot.scrollTop = scrollTopMapRef.current[displaySource] ?? 0;
      }
    }, [active, displaySource]);
    const resetSelection = () => {
      onSelectionReset();
    };
    const scheduleSearch = (value, { immediate = false } = {}) => {
      const previousKeyword = searchTerm.trim();
      const nextKeyword = value.trim();
      saveCurrentScrollTop();
      setSearchTerm(value);
      if (previousKeyword === nextKeyword) {
        return;
      }
      if (previousKeyword || nextKeyword) {
        resetSelection();
      }
      if (immediate) {
        debouncedSearch.cancel();
        const current = stateRef.current;
        if (current.activeRelation === "following" && nextKeyword) {
          loadRelationUsers("following", { reset: true, keywordOverride: nextKeyword });
        }
        return;
      }
      debouncedSearch(nextKeyword);
    };
    const emptyText = activeRelation === "following" ? "暂无关注用户。" : "暂无粉丝用户。";
    const renderListContent = () => {
      if (displayLoading.loading) {
        return /* @__PURE__ */ u$1(StateView, { text: "正在读取用户列表..." });
      }
      if (displayState.error) {
        return /* @__PURE__ */ u$1(StateView, { text: displayState.error, isError: true });
      }
      if (displayUsers.length === 0) {
        return /* @__PURE__ */ u$1(StateView, { text: emptyText });
      }
      return /* @__PURE__ */ u$1(
        UserList,
        {
          users: displayUsers,
          selectedMid,
          hasMore: displayState.hasMore,
          loadingMore: displayLoading.loadingMore,
          moreError: displayState.moreError,
          showFooter: true,
          onRetry: () => loadRelationUsers(activeRelation),
          onSelect
        }
      );
    };
    return /* @__PURE__ */ u$1(
      "div",
      {
        className: `${SCRIPT_ID}-tab-panel${active ? ` ${SCRIPT_ID}-tab-panel-active` : ""}`,
        "aria-hidden": !active,
        children: /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-panel`, ref: panelRef, children: [
          /* @__PURE__ */ u$1(
            RelationFilter,
            {
              activeRelation,
              onChange: (relation) => {
                if (activeRelation === relation) {
                  return;
                }
                resetSelection();
                saveCurrentScrollTop();
                setActiveRelation(relation);
              }
            }
          ),
          /* @__PURE__ */ u$1(
            SearchBox,
            {
              value: searchTerm,
              notice: activeRelation === "followers" && keyword ? "粉丝搜索仅筛选已加载的用户，继续向下滚动可扩大搜索范围。" : "",
              onCompositionStart: () => debouncedSearch.cancel(),
              onInput: scheduleSearch
            }
          ),
          renderListContent()
        ] })
      }
    );
  };
  const closeDialog = (dialog) => {
    if (!dialog) {
      return;
    }
    try {
      R(null, dialog);
      if (dialog.open) {
        dialog.close();
      }
    } finally {
      dialog.remove();
    }
  };
  const createDialog = () => {
    closeDialog(document.getElementById(`${SCRIPT_ID}-dialog`));
    const dialog = document.createElement("dialog");
    dialog.id = `${SCRIPT_ID}-dialog`;
    dialog.className = `${SCRIPT_ID}-dialog`;
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    document.body.appendChild(dialog);
    return dialog;
  };
  const DialogFooter = ({
    video,
    selectedUser,
    showCloseOnly = false,
    onClose,
    onSendingChange = () => {
    },
    onSendSuccess = () => {
    },
    onSendError = () => {
    }
  }) => {
    const [sending, setSending] = d(false);
    y(() => {
      onSendingChange(sending);
    }, [onSendingChange, sending]);
    const handleSend = async () => {
      if (!selectedUser || sending) {
        return;
      }
      setSending(true);
      onSendError("");
      try {
        const login = await assertLogin();
        await sendVideoText({
          nav: login.nav,
          csrf: login.csrf,
          video,
          receiver: selectedUser
        });
        onSendSuccess({
          message: `已将视频链接发送给 ${selectedUser.name}。`,
          isError: false
        });
      } catch (sendError) {
        onSendError(sendError.message);
      } finally {
        setSending(false);
      }
    };
    if (showCloseOnly) {
      return /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-footer`, children: /* @__PURE__ */ u$1(
        "button",
        {
          className: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
          type: "button",
          onClick: onClose,
          children: "关闭"
        }
      ) });
    }
    return /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-footer`, children: [
      /* @__PURE__ */ u$1("button", { className: `${SCRIPT_ID}-btn`, type: "button", disabled: sending, onClick: onClose, children: "取消" }),
      /* @__PURE__ */ u$1(
        "button",
        {
          className: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
          type: "button",
          disabled: sending || !selectedUser,
          onClick: handleSend,
          children: sending ? "发送中" : "发送"
        }
      )
    ] });
  };
  const DialogHeader = ({ title, onClose, disabled = false }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-header`, children: [
    /* @__PURE__ */ u$1("h3", { className: `${SCRIPT_ID}-title`, children: title }),
    /* @__PURE__ */ u$1(
      "button",
      {
        className: `${SCRIPT_ID}-close`,
        "aria-label": "关闭",
        title: "关闭",
        type: "button",
        disabled,
        onClick: onClose
      }
    )
  ] });
  const EntryButton = ({ onClick }) => /* @__PURE__ */ u$1(
    "button",
    {
      className: `${SCRIPT_ID}-entry`,
      type: "button",
      "data-bili-share-to-friends-entry": "true",
      title: "分享给 B站好友",
      onClick: (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      },
      children: [
        /* @__PURE__ */ u$1("span", { className: `${SCRIPT_ID}-entry-icon`, "aria-hidden": "true", children: /* @__PURE__ */ u$1("svg", { viewBox: "0 0 24 24", fill: "none", children: [
          /* @__PURE__ */ u$1(
            "path",
            {
              d: "M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H12l-4.2 4.2A1 1 0 0 1 6 18.5V15A3.5 3.5 0 0 1 4 11.8V5.5Z",
              stroke: "currentColor",
              strokeWidth: "1.8",
              strokeLinejoin: "round"
            }
          ),
          /* @__PURE__ */ u$1("path", { d: "M8 7.5h8M8 11h5", stroke: "currentColor", strokeWidth: "1.8", strokeLinecap: "round" })
        ] }) }),
        /* @__PURE__ */ u$1("span", { className: `${SCRIPT_ID}-entry-text`, children: "B站好友" })
      ]
    }
  );
  const createEntryButton$1 = ({ onClick }) => {
    const container = document.createElement("div");
    R(/* @__PURE__ */ u$1(EntryButton, { onClick }), container);
    return container.firstElementChild;
  };
  const RecentRecipientsPanel = ({ active, selectedMid = null, onSelect }) => {
    const [recent, setRecent] = d({
      users: [],
      error: "",
      loading: false,
      loaded: false
    });
    y(() => {
      if (!active || recent.loaded) {
        return;
      }
      let canceled = false;
      setRecent((state) => ({
        ...state,
        loading: true,
        error: ""
      }));
      getRecentSessions().then((users) => {
        if (canceled) {
          return;
        }
        setRecent({
          users,
          error: "",
          loading: false,
          loaded: true
        });
      }).catch((error) => {
        if (canceled) {
          return;
        }
        setRecent({
          users: [],
          error: error.message,
          loading: false,
          loaded: true
        });
      });
      return () => {
        canceled = true;
      };
    }, [active, recent.loaded]);
    const renderContent = () => {
      if (recent.loading) {
        return /* @__PURE__ */ u$1(StateView, { text: "正在读取最近私信联系人..." });
      }
      if (recent.error) {
        return /* @__PURE__ */ u$1(StateView, { text: recent.error, isError: true });
      }
      if (recent.users.length === 0) {
        return /* @__PURE__ */ u$1(StateView, { text: "暂无最近私信联系人。" });
      }
      return /* @__PURE__ */ u$1(
        UserList,
        {
          users: recent.users,
          selectedMid,
          footerText: `最近聊天列表只展示 ${SESSION_LIMIT} 个`,
          onSelect
        }
      );
    };
    return /* @__PURE__ */ u$1(
      "div",
      {
        className: `${SCRIPT_ID}-tab-panel${active ? ` ${SCRIPT_ID}-tab-panel-active` : ""}`,
        "aria-hidden": !active,
        children: /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-panel`, children: renderContent() })
      }
    );
  };
  const tabs = [
    { value: "recent", label: "最近聊天" },
    { value: "all", label: "全部好友" }
  ];
  const RecipientTabs = ({ activeTab, onChange }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-tabs`, children: tabs.map((tab) => /* @__PURE__ */ u$1(
    "button",
    {
      className: `${SCRIPT_ID}-tab`,
      type: "button",
      "aria-selected": String(activeTab === tab.value),
      onClick: () => onChange(tab.value),
      children: tab.label
    },
    tab.value
  )) });
  const VideoCover = ({ video }) => {
    const [loadFailed, setLoadFailed] = d(false);
    if (!(video == null ? void 0 : video.pic) || loadFailed) {
      return /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`, children: loadFailed ? "封面加载失败" : "读取中" });
    }
    return /* @__PURE__ */ u$1(
      "img",
      {
        className: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-img`,
        src: video.pic,
        alt: "",
        referrerPolicy: "no-referrer",
        onError: () => setLoadFailed(true)
      }
    );
  };
  const VideoPreview = ({ video }) => /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-video`, children: [
    /* @__PURE__ */ u$1(VideoCover, { video }),
    /* @__PURE__ */ u$1("div", { children: [
      /* @__PURE__ */ u$1("p", { className: `${SCRIPT_ID}-video-title`, children: (video == null ? void 0 : video.title) || "当前视频" }),
      /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-video-author`, children: (video == null ? void 0 : video.ownerName) ? `UP主：${video.ownerName}` : "" })
    ] })
  ] });
  const ShareDialog = ({ dialog, video, nav = null, status = "", error = "" }) => {
    const [activeTab, setActiveTab] = d("recent");
    const [selectedUser, setSelectedUser] = d(null);
    const [sending, setSending] = d(false);
    const [sendError, setSendError] = d("");
    const [sendResult, setSendResult] = d(null);
    y(() => {
      setSelectedUser(null);
      setSendError("");
      setSendResult(null);
    }, [video]);
    const handleClose = q(() => closeDialog(dialog), [dialog]);
    const resetSelection = q(() => {
      setSelectedUser(null);
      setSendError("");
    }, []);
    const handleTabChange = q(
      (tab) => {
        if (activeTab === tab) {
          return;
        }
        resetSelection();
        setActiveTab(tab);
      },
      [activeTab, resetSelection]
    );
    const handleUserSelect = q((user) => {
      setSendError("");
      setSelectedUser(user);
    }, []);
    const handleSendSuccess = q((nextResult) => {
      setSendError("");
      setSendResult(nextResult);
    }, []);
    const renderBody = () => {
      if (sendResult) {
        return /* @__PURE__ */ u$1(StateView, { text: sendResult.message, isError: sendResult.isError });
      }
      if (status) {
        return /* @__PURE__ */ u$1(StateView, { text: status });
      }
      if (error) {
        return /* @__PURE__ */ u$1(StateView, { text: error, isError: true });
      }
      return /* @__PURE__ */ u$1(S, { children: [
        sendError ? /* @__PURE__ */ u$1(StateView, { text: sendError, isError: true }) : null,
        /* @__PURE__ */ u$1(RecipientTabs, { activeTab, onChange: handleTabChange }),
        /* @__PURE__ */ u$1(
          RecentRecipientsPanel,
          {
            active: activeTab === "recent",
            selectedMid: selectedUser == null ? void 0 : selectedUser.mid,
            onSelect: handleUserSelect
          }
        ),
        /* @__PURE__ */ u$1(
          AllFriendsPanel,
          {
            active: activeTab === "all",
            mid: nav == null ? void 0 : nav.mid,
            selectedMid: selectedUser == null ? void 0 : selectedUser.mid,
            onSelectionReset: resetSelection,
            onSelect: handleUserSelect
          }
        )
      ] });
    };
    return /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-dialog-content`, children: [
      /* @__PURE__ */ u$1(DialogHeader, { title: "分享给 B站好友", disabled: sending, onClose: handleClose }),
      /* @__PURE__ */ u$1(VideoPreview, { video }),
      /* @__PURE__ */ u$1("div", { className: `${SCRIPT_ID}-body`, children: renderBody() }),
      /* @__PURE__ */ u$1(
        DialogFooter,
        {
          video,
          selectedUser,
          showCloseOnly: Boolean(sendResult),
          onClose: handleClose,
          onSendingChange: setSending,
          onSendSuccess: handleSendSuccess,
          onSendError: setSendError
        }
      )
    ] });
  };
  const renderDialog = ({ dialog, video, nav = null, status = "", error = "" }) => {
    R(
      /* @__PURE__ */ u$1(ShareDialog, { dialog, video, nav, status, error }),
      dialog
    );
  };
  const openShareDialog = async () => {
    const dialog = createDialog();
    const fallbackVideo = {
      title: document.title.replace("_哔哩哔哩_bilibili", ""),
      pic: "",
      ownerName: ""
    };
    renderDialog({
      dialog,
      video: fallbackVideo,
      status: "正在读取视频信息..."
    });
    if (!dialog.open) {
      dialog.showModal();
    }
    try {
      const { nav } = await assertLogin();
      const video = await getVideoInfo();
      if (!dialog.isConnected || !dialog.open) {
        return;
      }
      renderDialog({ dialog, video, nav });
    } catch (error) {
      if (!dialog.isConnected || !dialog.open) {
        return;
      }
      renderDialog({
        dialog,
        video: fallbackVideo,
        error: error.message
      });
    }
  };
  const createEntryButton = () => createEntryButton$1({ onClick: openShareDialog });
  let currentBvid = "";
  const findShareMethodContainer = () => {
    return document.querySelector(SHARE_BUTTONS_SELECTOR);
  };
  const injectEntry = () => {
    const container = findShareMethodContainer();
    if (!container) {
      return;
    }
    document.querySelectorAll("[data-bili-share-to-friends-entry]").forEach((entry2) => {
      if (!container.contains(entry2)) {
        entry2.remove();
      }
    });
    if (container.querySelector("[data-bili-share-to-friends-entry]")) {
      return;
    }
    const entry = createEntryButton();
    container.appendChild(entry);
  };
  const handleRouteChange = () => {
    const nextBvid = getBvidFromLocation();
    if (nextBvid && nextBvid !== currentBvid) {
      currentBvid = nextBvid;
      injectEntry();
    }
  };
  const observePage = () => {
    const observer = new MutationObserver(() => {
      injectEntry();
      handleRouteChange();
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
  };
  const init = () => {
    if (window.self !== window.top) {
      return;
    }
    currentBvid = getBvidFromLocation();
    injectEntry();
    observePage();
  };
  init();

})();