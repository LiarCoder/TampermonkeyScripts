// ==UserScript==
// @name         B站视频分享给好友
// @namespace    http://tampermonkey.net/
// @version      0.1.10
// @description  在 Bilibili 视频播放页的原分享面板中新增“B站好友”入口，将当前视频以私信分享卡片发送给最近私信联系人
// @author       LiarCoder
// @match        https://www.bilibili.com/video/*
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      api.bilibili.com
// @connect      api.vc.bilibili.com
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  const SCRIPT_ID = "bili-share-to-friends";
  const DEV_ID_KEY = `${SCRIPT_ID}.dev_id`;
  const SESSION_CACHE_KEY = `${SCRIPT_ID}.recent_sessions.v2`;
  const SESSION_CACHE_TTL = 5 * 60 * 1000;
  const SESSION_LIMIT = 20;

  const SHARE_METHOD_LABELS = [
    "动态",
    "微信",
    "QQ",
    "QQ空间",
    "微博",
    "贴吧",
    "嵌入代码",
  ];

  const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5,
    49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55,
    40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57,
    62, 11, 36, 20, 34, 44, 52,
  ];

  let navCache = null;
  let currentBvid = "";

  const createElement = ({
    tagName = "div",
    text = "",
    html = "",
    attributes = {},
    children = [],
    events = [],
  } = {}) => {
    const element = document.createElement(tagName);
    if (text) {
      element.innerText = text;
    }
    if (html) {
      element.innerHTML = html;
    }
    Object.keys(attributes).forEach((key) =>
      element.setAttribute(key, attributes[key])
    );
    children.forEach((child) => child && element.appendChild(child));
    events.forEach(({ name, handler }) => {
      element.addEventListener(name, handler);
    });
    return element;
  };

  const addStyles = () => {
    GM_addStyle(`
      .${SCRIPT_ID}-entry {
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
        transition: color .2s, transform .2s;
      }

      .${SCRIPT_ID}-entry:hover {
        color: #00aeec;
        transform: translateY(-1px);
      }

      .${SCRIPT_ID}-entry-text {
        color: #18191c;
        white-space: nowrap;
      }

      .${SCRIPT_ID}-entry:hover .${SCRIPT_ID}-entry-text {
        color: #00aeec;
      }

      .${SCRIPT_ID}-entry-icon {
        width: 36px;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        color: #fff;
        background: #00aeec;
      }

      .${SCRIPT_ID}-entry-icon svg {
        width: 22px;
        height: 22px;
      }

      .${SCRIPT_ID}-dialog::backdrop {
        background: rgba(0, 0, 0, .38);
      }

      .${SCRIPT_ID}-dialog:not([open]) {
        display: none !important;
        pointer-events: none !important;
      }

      .${SCRIPT_ID}-dialog {
        width: min(420px, calc(100vw - 32px));
        max-height: min(680px, calc(100vh - 48px));
        padding: 0;
        border: 0;
        border-radius: 8px;
        background: #fff;
        color: #18191c;
        box-shadow: 0 12px 40px rgba(0, 0, 0, .18);
        overflow: hidden;
        font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "Microsoft YaHei", sans-serif;
      }

      .${SCRIPT_ID}-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px;
        border-bottom: 1px solid #e3e5e7;
      }

      .${SCRIPT_ID}-title {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .${SCRIPT_ID}-close {
        width: 30px;
        height: 30px;
        border: 0;
        border-radius: 4px;
        background: transparent;
        color: #61666d;
        font-size: 22px;
        line-height: 28px;
        cursor: pointer;
      }

      .${SCRIPT_ID}-close:hover {
        background: #f1f2f3;
      }

      .${SCRIPT_ID}-video {
        display: grid;
        grid-template-columns: 88px 1fr;
        gap: 10px;
        padding: 12px 16px;
        border-bottom: 1px solid #e3e5e7;
        background: #f6f7f8;
      }

      .${SCRIPT_ID}-cover {
        width: 88px;
        aspect-ratio: 16 / 10;
        border-radius: 4px;
        background: #e3e5e7;
      }

      .${SCRIPT_ID}-cover-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #9499a0;
        font-size: 12px;
      }

      .${SCRIPT_ID}-cover-img {
        object-fit: cover;
      }

      .${SCRIPT_ID}-video-title {
        margin: 0;
        color: #18191c;
        font-size: 13px;
        line-height: 18px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .${SCRIPT_ID}-video-author {
        margin-top: 6px;
        color: #9499a0;
        font-size: 12px;
      }

      .${SCRIPT_ID}-body {
        min-height: 180px;
        max-height: 360px;
        overflow: auto;
      }

      .${SCRIPT_ID}-state {
        padding: 42px 18px;
        color: #61666d;
        text-align: center;
      }

      .${SCRIPT_ID}-state-error {
        color: #d03050;
      }

      .${SCRIPT_ID}-list {
        margin: 0;
        padding: 8px 0;
        list-style: none;
      }

      .${SCRIPT_ID}-person {
        display: grid;
        grid-template-columns: 40px 1fr auto;
        align-items: center;
        gap: 10px;
        width: 100%;
        padding: 10px 16px;
        border: 0;
        background: #fff;
        color: inherit;
        text-align: left;
        cursor: pointer;
      }

      .${SCRIPT_ID}-person:hover,
      .${SCRIPT_ID}-person[aria-selected="true"] {
        background: #f6fbff;
      }

      .${SCRIPT_ID}-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        background: #e3e5e7;
      }

      .${SCRIPT_ID}-name {
        min-width: 0;
        font-size: 14px;
        color: #18191c;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .${SCRIPT_ID}-meta {
        min-width: 0;
        margin-top: 2px;
        color: #9499a0;
        font-size: 12px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .${SCRIPT_ID}-check {
        width: 18px;
        height: 18px;
        border: 1px solid #c9ccd0;
        border-radius: 50%;
      }

      .${SCRIPT_ID}-person[aria-selected="true"] .${SCRIPT_ID}-check {
        border-color: #00aeec;
        background: radial-gradient(circle at center, #00aeec 0 45%, transparent 47%);
      }

      .${SCRIPT_ID}-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        padding: 12px 16px;
        border-top: 1px solid #e3e5e7;
      }

      .${SCRIPT_ID}-btn {
        min-width: 76px;
        height: 32px;
        padding: 0 14px;
        border: 1px solid #c9ccd0;
        border-radius: 4px;
        background: #fff;
        color: #18191c;
        cursor: pointer;
      }

      .${SCRIPT_ID}-btn:hover {
        border-color: #00aeec;
        color: #00aeec;
      }

      .${SCRIPT_ID}-btn-primary {
        color: #fff;
        border-color: #00aeec;
        background: #00aeec;
      }

      .${SCRIPT_ID}-btn-primary:hover {
        color: #fff;
        border-color: #40c5f1;
        background: #40c5f1;
      }

      .${SCRIPT_ID}-btn:disabled {
        border-color: #e3e5e7;
        background: #f6f7f8;
        color: #c9ccd0;
        cursor: not-allowed;
      }
    `);
  };

  const getCookie = (name) => {
    const cookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
  };

  const getBvidFromLocation = () => {
    const match = location.href.match(/\/video\/(BV[0-9A-Za-z]+)/);
    return match ? match[1] : "";
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

  const buildQuery = (params) => {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    return query.toString();
  };

  const httpRequest = ({ method = "GET", url, data = null, headers = {} }) => {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method,
        url,
        data,
        headers,
        withCredentials: true,
        timeout: 15000,
        onload: (response) => {
          try {
            const result = JSON.parse(response.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error(`响应解析失败：${error.message}`));
          }
        },
        onerror: () => reject(new Error("网络请求失败")),
        ontimeout: () => reject(new Error("网络请求超时")),
      });
    });
  };

  const assertSuccess = (result, action) => {
    if (!result || result.code !== 0) {
      const message = result?.message || result?.msg || "未知错误";
      throw new Error(`${action}失败：${message}（code: ${result?.code ?? "-"}）`);
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
    fromFirework = "0",
  }) =>
    new URLSearchParams({
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
      csrf_token: csrf,
    });

  const postPrivateMessage = async ({ nav, form, receiver, devId, action }) => {
    const query = signWbi(
      {
        w_sender_uid: nav.mid,
        w_receiver_id: receiver.mid,
        w_dev_id: devId,
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
        Referer: "https://message.bilibili.com/",
      },
      data: form.toString(),
    });
    return assertSuccess(result, action);
  };

  const md5 = (input) => {
    const rotateLeft = (value, shift) => (value << shift) | (value >>> (32 - shift));
    const addUnsigned = (x, y) => {
      const x4 = x & 0x40000000;
      const y4 = y & 0x40000000;
      const x8 = x & 0x80000000;
      const y8 = y & 0x80000000;
      const result = (x & 0x3fffffff) + (y & 0x3fffffff);
      if (x4 & y4) {
        return result ^ 0x80000000 ^ x8 ^ y8;
      }
      if (x4 | y4) {
        if (result & 0x40000000) {
          return result ^ 0xc0000000 ^ x8 ^ y8;
        }
        return result ^ 0x40000000 ^ x8 ^ y8;
      }
      return result ^ x8 ^ y8;
    };
    const f = (x, y, z) => (x & y) | (~x & z);
    const g = (x, y, z) => (x & z) | (y & ~z);
    const h = (x, y, z) => x ^ y ^ z;
    const i = (x, y, z) => y ^ (x | ~z);
    const round = (fn, a, b, c, d, x, s, ac) =>
      addUnsigned(rotateLeft(addUnsigned(addUnsigned(a, fn(b, c, d)), addUnsigned(x, ac)), s), b);
    const utf8 = unescape(encodeURIComponent(input));
    const words = [];
    const length = utf8.length;
    for (let index = 0; index < length; index++) {
      words[index >> 2] |= utf8.charCodeAt(index) << ((index % 4) * 8);
    }
    words[length >> 2] |= 0x80 << ((length % 4) * 8);
    words[(((length + 8) >> 6) + 1) * 16 - 2] = length * 8;

    let a = 0x67452301;
    let b = 0xefcdab89;
    let c = 0x98badcfe;
    let d = 0x10325476;

    for (let k = 0; k < words.length; k += 16) {
      const aa = a;
      const bb = b;
      const cc = c;
      const dd = d;

      a = round(f, a, b, c, d, words[k + 0], 7, 0xd76aa478);
      d = round(f, d, a, b, c, words[k + 1], 12, 0xe8c7b756);
      c = round(f, c, d, a, b, words[k + 2], 17, 0x242070db);
      b = round(f, b, c, d, a, words[k + 3], 22, 0xc1bdceee);
      a = round(f, a, b, c, d, words[k + 4], 7, 0xf57c0faf);
      d = round(f, d, a, b, c, words[k + 5], 12, 0x4787c62a);
      c = round(f, c, d, a, b, words[k + 6], 17, 0xa8304613);
      b = round(f, b, c, d, a, words[k + 7], 22, 0xfd469501);
      a = round(f, a, b, c, d, words[k + 8], 7, 0x698098d8);
      d = round(f, d, a, b, c, words[k + 9], 12, 0x8b44f7af);
      c = round(f, c, d, a, b, words[k + 10], 17, 0xffff5bb1);
      b = round(f, b, c, d, a, words[k + 11], 22, 0x895cd7be);
      a = round(f, a, b, c, d, words[k + 12], 7, 0x6b901122);
      d = round(f, d, a, b, c, words[k + 13], 12, 0xfd987193);
      c = round(f, c, d, a, b, words[k + 14], 17, 0xa679438e);
      b = round(f, b, c, d, a, words[k + 15], 22, 0x49b40821);

      a = round(g, a, b, c, d, words[k + 1], 5, 0xf61e2562);
      d = round(g, d, a, b, c, words[k + 6], 9, 0xc040b340);
      c = round(g, c, d, a, b, words[k + 11], 14, 0x265e5a51);
      b = round(g, b, c, d, a, words[k + 0], 20, 0xe9b6c7aa);
      a = round(g, a, b, c, d, words[k + 5], 5, 0xd62f105d);
      d = round(g, d, a, b, c, words[k + 10], 9, 0x2441453);
      c = round(g, c, d, a, b, words[k + 15], 14, 0xd8a1e681);
      b = round(g, b, c, d, a, words[k + 4], 20, 0xe7d3fbc8);
      a = round(g, a, b, c, d, words[k + 9], 5, 0x21e1cde6);
      d = round(g, d, a, b, c, words[k + 14], 9, 0xc33707d6);
      c = round(g, c, d, a, b, words[k + 3], 14, 0xf4d50d87);
      b = round(g, b, c, d, a, words[k + 8], 20, 0x455a14ed);
      a = round(g, a, b, c, d, words[k + 13], 5, 0xa9e3e905);
      d = round(g, d, a, b, c, words[k + 2], 9, 0xfcefa3f8);
      c = round(g, c, d, a, b, words[k + 7], 14, 0x676f02d9);
      b = round(g, b, c, d, a, words[k + 12], 20, 0x8d2a4c8a);

      a = round(h, a, b, c, d, words[k + 5], 4, 0xfffa3942);
      d = round(h, d, a, b, c, words[k + 8], 11, 0x8771f681);
      c = round(h, c, d, a, b, words[k + 11], 16, 0x6d9d6122);
      b = round(h, b, c, d, a, words[k + 14], 23, 0xfde5380c);
      a = round(h, a, b, c, d, words[k + 1], 4, 0xa4beea44);
      d = round(h, d, a, b, c, words[k + 4], 11, 0x4bdecfa9);
      c = round(h, c, d, a, b, words[k + 7], 16, 0xf6bb4b60);
      b = round(h, b, c, d, a, words[k + 10], 23, 0xbebfbc70);
      a = round(h, a, b, c, d, words[k + 13], 4, 0x289b7ec6);
      d = round(h, d, a, b, c, words[k + 0], 11, 0xeaa127fa);
      c = round(h, c, d, a, b, words[k + 3], 16, 0xd4ef3085);
      b = round(h, b, c, d, a, words[k + 6], 23, 0x4881d05);
      a = round(h, a, b, c, d, words[k + 9], 4, 0xd9d4d039);
      d = round(h, d, a, b, c, words[k + 12], 11, 0xe6db99e5);
      c = round(h, c, d, a, b, words[k + 15], 16, 0x1fa27cf8);
      b = round(h, b, c, d, a, words[k + 2], 23, 0xc4ac5665);

      a = round(i, a, b, c, d, words[k + 0], 6, 0xf4292244);
      d = round(i, d, a, b, c, words[k + 7], 10, 0x432aff97);
      c = round(i, c, d, a, b, words[k + 14], 15, 0xab9423a7);
      b = round(i, b, c, d, a, words[k + 5], 21, 0xfc93a039);
      a = round(i, a, b, c, d, words[k + 12], 6, 0x655b59c3);
      d = round(i, d, a, b, c, words[k + 3], 10, 0x8f0ccc92);
      c = round(i, c, d, a, b, words[k + 10], 15, 0xffeff47d);
      b = round(i, b, c, d, a, words[k + 1], 21, 0x85845dd1);
      a = round(i, a, b, c, d, words[k + 8], 6, 0x6fa87e4f);
      d = round(i, d, a, b, c, words[k + 15], 10, 0xfe2ce6e0);
      c = round(i, c, d, a, b, words[k + 6], 15, 0xa3014314);
      b = round(i, b, c, d, a, words[k + 13], 21, 0x4e0811a1);
      a = round(i, a, b, c, d, words[k + 4], 6, 0xf7537e82);
      d = round(i, d, a, b, c, words[k + 11], 10, 0xbd3af235);
      c = round(i, c, d, a, b, words[k + 2], 15, 0x2ad7d2bb);
      b = round(i, b, c, d, a, words[k + 9], 21, 0xeb86d391);

      a = addUnsigned(a, aa);
      b = addUnsigned(b, bb);
      c = addUnsigned(c, cc);
      d = addUnsigned(d, dd);
    }

    const wordToHex = (value) => {
      let output = "";
      for (let count = 0; count <= 3; count++) {
        output += (`0${((value >>> (count * 8)) & 255).toString(16)}`).slice(-2);
      }
      return output;
    };

    return `${wordToHex(a)}${wordToHex(b)}${wordToHex(c)}${wordToHex(d)}`;
  };

  const getMixinKey = (imgKey, subKey) =>
    mixinKeyEncTab
      .map((index) => `${imgKey}${subKey}`[index])
      .join("")
      .slice(0, 32);

  // 部分 B 站 Web API 需要 WBI 签名；私信补用户资料接口会用到。
  const signWbi = (params, wbiImg) => {
    if (!wbiImg?.img_url || !wbiImg?.sub_url) {
      return params;
    }
    const imgKey = wbiImg.img_url.split("/").pop().split(".")[0];
    const subKey = wbiImg.sub_url.split("/").pop().split(".")[0];
    const mixinKey = getMixinKey(imgKey, subKey);
    const signedParams = {
      ...params,
      wts: Math.round(Date.now() / 1000),
    };
    const query = Object.keys(signedParams)
      .sort()
      .map((key) => {
        const value = String(signedParams[key]).replace(/[!'()*]/g, "");
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join("&");
    return {
      ...signedParams,
      w_rid: md5(query + mixinKey),
    };
  };

  const getNav = async () => {
    if (navCache) {
      return navCache;
    }
    const result = await httpRequest({
      url: "https://api.bilibili.com/x/web-interface/nav",
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
    const bvid = getBvidFromLocation();
    if (!bvid) {
      throw new Error("没有识别到当前视频的 BV 号。");
    }
    const result = await httpRequest({
      url: `https://api.bilibili.com/x/web-interface/view?${buildQuery({ bvid })}`,
    });
    const data = assertSuccess(result, "获取视频信息");
    return {
      aid: data.aid,
      bvid: data.bvid || bvid,
      title: data.title,
      pic: normalizeImageUrl(data.pic),
      ownerName: data.owner?.name || "UP主",
      ownerMid: data.owner?.mid || 0,
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
        sessions,
      })
    );
  };

  const getSessionAccountInfo = (session, accountInfoMap = {}) => {
    const talkerId = String(session.talker_id || "");
    return (
      session.account_info ||
      accountInfoMap[talkerId] ||
      accountInfoMap[Number(talkerId)] ||
      {}
    );
  };

  const normalizeSession = (session, accountInfoMap = {}) => {
    const account = getSessionAccountInfo(session, accountInfoMap);
    const mid = Number(session.talker_id || account.mid);
    if (!mid || Number(session.session_type) !== 1) {
      return null;
    }
    return {
      mid,
      name: account.name || account.uname || `UID ${mid}`,
      avatar: normalizeImageUrl(account.pic || account.pic_url || account.face),
      lastMessage: session.last_msg?.content || "",
      unreadCount: Number(session.unread_count || 0),
    };
  };

  const getUserInfo = async (mid) => {
    const nav = await getNav();
    const signedParams = signWbi({ mid }, nav.wbi_img);
    const result = await httpRequest({
      url: `https://api.bilibili.com/x/space/wbi/acc/info?${buildQuery(signedParams)}`,
      headers: {
        Accept: "application/json, text/plain, */*",
        Referer: `https://space.bilibili.com/${mid}/`,
      },
    });
    const data = assertSuccess(result, `获取用户 ${mid} 信息`);
    return {
      mid: Number(data.mid || mid),
      name: data.name || data.uname || `UID ${mid}`,
      avatar: normalizeImageUrl(data.face),
    };
  };

  const enrichSessionsWithUserInfo = async (sessions) => {
    // 最近私信接口经常只返回 talker_id，这里按 UID 补齐昵称和头像。
    const sessionsNeedUserInfo = sessions.filter(
      (session) => !session.avatar || session.name === `UID ${session.mid}`
    );
    if (sessionsNeedUserInfo.length === 0) {
      return sessions;
    }
    const userInfoResults = [];
    // 分批请求，避免打开弹窗时瞬间打出过多用户资料请求。
    for (let index = 0; index < sessionsNeedUserInfo.length; index += 4) {
      const batch = sessionsNeedUserInfo.slice(index, index + 4);
      const batchResults = await Promise.allSettled(
        batch.map((session) => getUserInfo(session.mid))
      );
      userInfoResults.push(...batchResults);
    }
    const userInfoMap = new Map();
    userInfoResults.forEach((result) => {
      if (result.status === "fulfilled") {
        userInfoMap.set(result.value.mid, result.value);
      }
    });
    return sessions.map((session) => {
      const userInfo = userInfoMap.get(session.mid);
      if (!userInfo) {
        return session;
      }
      return {
        ...session,
        name: userInfo.name || session.name,
        avatar: userInfo.avatar || session.avatar,
      };
    });
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
        size: SESSION_LIMIT,
      })}`,
    });
    const data = assertSuccess(result, "获取最近私信联系人");
    const sessions = await enrichSessionsWithUserInfo(
      (data.session_list || [])
        .map((session) => normalizeSession(session, data.account_info || {}))
        .filter(Boolean)
        .slice(0, SESSION_LIMIT)
    );
    writeSessionCache(sessions);
    return sessions;
  };

  const getDevId = () => {
    const cachedDevId = localStorage.getItem(DEV_ID_KEY);
    if (cachedDevId) {
      return cachedDevId;
    }
    const devId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (name) => {
      const randomInt = (Math.random() * 16) | 0;
      return (name === "x" ? randomInt : (randomInt & 3) | 8)
        .toString(16)
        .toUpperCase();
    });
    localStorage.setItem(DEV_ID_KEY, devId);
    return devId;
  };

  const sendVideoCard = async ({ nav, csrf, video, receiver }) => {
    const devId = getDevId();
    const timestamp = Math.round(Date.now() / 1000);
    const content = {
      id: video.aid,
      title: video.title,
      source: 5,
      thumb: video.pic,
      author: video.ownerName,
      author_id: String(video.ownerMid),
    };
    const form = createSendMessageForm({
      nav,
      csrf,
      receiver,
      msgType: 7,
      content,
      devId,
      timestamp,
      fromFirework: "1",
    });
    return postPrivateMessage({
      nav,
      form,
      receiver,
      devId,
      action: "发送视频卡片私信",
    });
  };

  const sendVideoText = async ({ nav, csrf, video, receiver }) => {
    const devId = getDevId();
    const timestamp = Math.round(Date.now() / 1000);
    const content = {
      content: `分享视频：【UP主：${video.ownerName}】${video.title}\nhttps://www.bilibili.com/video/${video.bvid}`,
    };
    const form = createSendMessageForm({
      nav,
      csrf,
      receiver,
      msgType: 1,
      content,
      devId,
      timestamp,
      fromFirework: "0",
    });
    return postPrivateMessage({
      nav,
      form,
      receiver,
      devId,
      action: "发送视频链接私信",
    });
  };

  const shareVideoToFriend = async ({ nav, csrf, video, receiver }) => {
    try {
      await sendVideoCard({ nav, csrf, video, receiver });
      return { mode: "card" };
    } catch (cardError) {
      // PC Web 端视频卡片接口不稳定；卡片失败时保证文本链接能发出去。
      await sendVideoText({ nav, csrf, video, receiver });
      return { mode: "text", cardError };
    }
  };

  const closeDialog = (dialog) => {
    if (!dialog) {
      return;
    }
    try {
      if (dialog.open) {
        dialog.close();
      }
    } finally {
      // B 站页面有自己的浮层样式，关闭后直接移除节点可避免透明遮罩残留。
      dialog.remove();
    }
  };

  const createDialog = () => {
    closeDialog(document.getElementById(`${SCRIPT_ID}-dialog`));
    const dialog = createElement({
      tagName: "dialog",
      attributes: {
        id: `${SCRIPT_ID}-dialog`,
        class: `${SCRIPT_ID}-dialog`,
      },
      events: [
        {
          name: "cancel",
          handler: (event) => {
            event.preventDefault();
            closeDialog(dialog);
          },
        },
      ],
    });
    document.body.appendChild(dialog);
    return dialog;
  };

  const setDialogContent = (dialog, child) => {
    dialog.innerHTML = "";
    dialog.appendChild(child);
  };

  const createState = (text, isError = false) =>
    createElement({
      attributes: {
        class: `${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`,
      },
      text,
    });

  const createVideoCover = (video) => {
    if (!video?.pic) {
      return createElement({
        attributes: {
          class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`,
        },
        text: "读取中",
      });
    }
    return createElement({
      tagName: "img",
      attributes: {
        class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-img`,
        src: video.pic,
        alt: "",
        referrerpolicy: "no-referrer",
      },
      events: [
        {
          name: "error",
          handler: (event) => {
            const placeholder = createElement({
              attributes: {
                class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`,
              },
              text: "封面加载失败",
            });
            event.currentTarget.replaceWith(placeholder);
          },
        },
      ],
    });
  };

  const renderDialog = ({ dialog, video, sessions = [], status = "", error = "" }) => {
    let selectedSession = null;
    let sending = false;

    const closeBtn = createElement({
      tagName: "button",
      text: "×",
      attributes: {
        class: `${SCRIPT_ID}-close`,
        title: "关闭",
        type: "button",
      },
      events: [{ name: "click", handler: () => closeDialog(dialog) }],
    });
    const header = createElement({
      attributes: { class: `${SCRIPT_ID}-header` },
      children: [
        createElement({
          tagName: "h3",
          text: "分享给 B站好友",
          attributes: { class: `${SCRIPT_ID}-title` },
        }),
        closeBtn,
      ],
    });
    const videoPreview = createElement({
      attributes: { class: `${SCRIPT_ID}-video` },
      children: [
        createVideoCover(video),
        createElement({
          children: [
            createElement({
              tagName: "p",
              text: video?.title || "当前视频",
              attributes: { class: `${SCRIPT_ID}-video-title` },
            }),
            createElement({
              text: video?.ownerName ? `UP主：${video.ownerName}` : "",
              attributes: { class: `${SCRIPT_ID}-video-author` },
            }),
          ],
        }),
      ],
    });
    const body = createElement({
      attributes: { class: `${SCRIPT_ID}-body` },
    });
    const cancelBtn = createElement({
      tagName: "button",
      text: "取消",
      attributes: {
        class: `${SCRIPT_ID}-btn`,
        type: "button",
      },
      events: [{ name: "click", handler: () => closeDialog(dialog) }],
    });
    const sendBtn = createElement({
      tagName: "button",
      text: "发送",
      attributes: {
        class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
        type: "button",
        disabled: "disabled",
      },
    });
    const footer = createElement({
      attributes: { class: `${SCRIPT_ID}-footer` },
      children: [cancelBtn, sendBtn],
    });

    const clearErrorStates = () => {
      body
        .querySelectorAll(`.${SCRIPT_ID}-state-error`)
        .forEach((element) => element.remove());
    };

    const updateSelection = (button, session) => {
      clearErrorStates();
      selectedSession = session;
      body
        .querySelectorAll(`.${SCRIPT_ID}-person`)
        .forEach((item) => item.setAttribute("aria-selected", "false"));
      button.setAttribute("aria-selected", "true");
      sendBtn.removeAttribute("disabled");
    };

    const setSending = (nextSending) => {
      sending = nextSending;
      sendBtn.disabled = nextSending || !selectedSession;
      cancelBtn.disabled = nextSending;
      closeBtn.disabled = nextSending;
      sendBtn.innerText = nextSending ? "发送中" : "发送";
    };

    const showResult = (message, isError = false) => {
      body.innerHTML = "";
      body.appendChild(createState(message, isError));
      footer.innerHTML = "";
      footer.appendChild(
        createElement({
          tagName: "button",
          text: "关闭",
          attributes: {
            class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
            type: "button",
          },
          events: [{ name: "click", handler: () => closeDialog(dialog) }],
        })
      );
      closeBtn.disabled = false;
    };

    if (status) {
      body.appendChild(createState(status));
    } else if (error) {
      body.appendChild(createState(error, true));
    } else if (sessions.length === 0) {
      body.appendChild(createState("暂无最近私信联系人。"));
    } else {
      const list = createElement({
        tagName: "ul",
        attributes: { class: `${SCRIPT_ID}-list` },
      });
      sessions.forEach((session) => {
        const button = createElement({
          tagName: "button",
          attributes: {
            class: `${SCRIPT_ID}-person`,
            type: "button",
            "aria-selected": "false",
          },
          children: [
            createElement({
              tagName: "img",
              attributes: {
                class: `${SCRIPT_ID}-avatar`,
                src: session.avatar,
                alt: "",
                referrerpolicy: "no-referrer",
              },
              events: [
                {
                  name: "error",
                  handler: (event) => {
                    if (event.currentTarget.dataset.fallbackApplied === "true") {
                      return;
                    }
                    event.currentTarget.dataset.fallbackApplied = "true";
                    event.currentTarget.src =
                      "https://static.hdslb.com/images/member/noface.gif";
                  },
                },
              ],
            }),
            createElement({
              children: [
                createElement({
                  text: session.name,
                  attributes: { class: `${SCRIPT_ID}-name` },
                }),
                createElement({
                  text: session.unreadCount > 0 ? `${session.unreadCount} 条未读` : `UID ${session.mid}`,
                  attributes: { class: `${SCRIPT_ID}-meta` },
                }),
              ],
            }),
            createElement({
              attributes: { class: `${SCRIPT_ID}-check` },
            }),
          ],
        });
        button.addEventListener("click", () => updateSelection(button, session));
        list.appendChild(createElement({ tagName: "li", children: [button] }));
      });
      body.appendChild(list);
    }

    sendBtn.addEventListener("click", async () => {
      if (!selectedSession || sending) {
        return;
      }
      setSending(true);
      try {
        const { nav, csrf } = await assertLogin();
        const shareResult = await shareVideoToFriend({
          nav,
          csrf,
          video,
          receiver: selectedSession,
        });
        showResult(
          shareResult.mode === "card"
            ? `已发送给 ${selectedSession.name}。`
            : `视频卡片发送失败，已改用文本链接发送给 ${selectedSession.name}。`
        );
      } catch (sendError) {
        setSending(false);
        clearErrorStates();
        body.prepend(createState(sendError.message, true));
      }
    });

    setDialogContent(
      dialog,
      createElement({
        children: [header, videoPreview, body, footer],
      })
    );
  };

  const openShareDialog = async () => {
    const dialog = createDialog();
    const fallbackVideo = {
      title: document.title.replace("_哔哩哔哩_bilibili", ""),
      pic: "",
      ownerName: "",
    };
    renderDialog({
      dialog,
      video: fallbackVideo,
      status: "正在读取视频和最近私信联系人...",
    });
    if (!dialog.open) {
      dialog.showModal();
    }

    try {
      await assertLogin();
      const video = await getVideoInfo();
      const sessions = await getRecentSessions();
      if (!dialog.isConnected || !dialog.open) {
        return;
      }
      renderDialog({ dialog, video, sessions });
    } catch (error) {
      if (!dialog.isConnected || !dialog.open) {
        return;
      }
      renderDialog({
        dialog,
        video: fallbackVideo,
        error: error.message,
      });
    }
  };

  const createEntryButton = () =>
    createElement({
      tagName: "button",
      attributes: {
        class: `${SCRIPT_ID}-entry`,
        type: "button",
        "data-bili-share-to-friends-entry": "true",
        title: "分享给 B站好友",
      },
      html: `
        <span class="${SCRIPT_ID}-entry-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H12l-4.2 4.2A1 1 0 0 1 6 18.5V15A3.5 3.5 0 0 1 4 11.8V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="M8 7.5h8M8 11h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="${SCRIPT_ID}-entry-text">B站好友</span>
      `,
      events: [
        {
          name: "click",
          handler: (event) => {
            event.preventDefault();
            event.stopPropagation();
            openShareDialog();
          },
        },
      ],
    });

  const normalizeText = (text) => text.replace(/\s+/g, "");

  const getShareMethodCount = (element) => {
    const text = normalizeText(element.innerText || "");
    return SHARE_METHOD_LABELS.filter((label) => text.includes(label)).length;
  };

  const findShareMethodContainer = () => {
    // 以“嵌入代码”为锚点定位分享方式列表，避免误插到底部工具栏分享按钮附近。
    const embedLabel = Array.from(document.querySelectorAll("button, a, div, span"))
      .filter((element) => normalizeText(element.innerText || "") === "嵌入代码")
      .sort((a, b) => a.getBoundingClientRect().width - b.getBoundingClientRect().width)[0];

    if (!embedLabel) {
      return null;
    }

    for (
      let element = embedLabel.parentElement;
      element && element !== document.body;
      element = element.parentElement
    ) {
      const directShareMethodCount = Array.from(element.children).filter(
        (child) => getShareMethodCount(child) >= 1
      ).length;
      if (directShareMethodCount >= 5) {
        return element;
      }
    }

    return null;
  };

  const findDirectShareMethodItem = (container, label) => {
    return Array.from(container.children).find((child) =>
      normalizeText(child.innerText || "").includes(label)
    );
  };

  const injectEntry = () => {
    const container = findShareMethodContainer();
    if (!container) {
      return;
    }
    document
      .querySelectorAll("[data-bili-share-to-friends-entry]")
      .forEach((entry) => {
        if (!container.contains(entry)) {
          entry.remove();
        }
      });
    if (container.querySelector("[data-bili-share-to-friends-entry]")) {
      return;
    }
    const entry = createEntryButton();
    const embedItem = findDirectShareMethodItem(container, "嵌入代码");
    if (embedItem) {
      embedItem.insertAdjacentElement("afterend", entry);
    } else {
      container.appendChild(entry);
    }
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
      subtree: true,
    });
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);
  };

  const init = () => {
    if (window.self !== window.top) {
      return;
    }
    addStyles();
    currentBvid = getBvidFromLocation();
    injectEntry();
    observePage();
  };

  init();
})();
