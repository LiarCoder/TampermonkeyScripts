import { GM_xmlhttpRequest } from "$";

import {
  DEV_ID_KEY,
  SESSION_CACHE_KEY,
  SESSION_CACHE_TTL,
  SESSION_LIMIT,
  RELATION_PAGE_SIZE,
  SCRIPT_ID,
  mixinKeyEncTab,
} from "./constants.js";

let navCache = null;

const getCookie = (name) => {
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
};

export const getBvidFromLocation = () => {
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
      output += `0${((value >>> (count * 8)) & 255).toString(16)}`.slice(-2);
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

export const assertLogin = async () => {
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

export const getVideoInfo = async () => {
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
  return session.account_info || accountInfoMap[talkerId] || accountInfoMap[Number(talkerId)] || {};
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

const normalizeRelationUser = (user) => {
  const mid = Number(user.mid);
  if (!mid) {
    return null;
  }
  return {
    mid,
    name: user.uname || user.name || `UID ${mid}`,
    avatar: normalizeImageUrl(user.face),
    meta: `UID ${mid}`,
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
    const batchResults = await Promise.allSettled(batch.map((session) => getUserInfo(session.mid)));
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

export const getRecentSessions = async (forceRefresh = false) => {
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

const getRelationUsers = async ({ action, url, mid, page, pageSize, extraParams = {} }) => {
  const result = await httpRequest({
    url: `${url}?${buildQuery({
      vmid: mid,
      pn: page,
      ps: pageSize,
      order: "desc",
      order_type: "attention",
      ...extraParams,
    })}`,
  });
  const data = assertSuccess(result, action);
  const users = (data.list || []).map(normalizeRelationUser).filter(Boolean);
  const total = Number(data.total || 0);
  return {
    users,
    total,
    hasMore: total ? page * pageSize < total : users.length >= pageSize,
  };
};

export const getFollowings = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) =>
  getRelationUsers({
    action: "获取我的关注",
    url: "https://api.bilibili.com/x/relation/followings",
    mid,
    page,
    pageSize,
  });

export const searchFollowings = ({ mid, keyword, page = 1, pageSize = RELATION_PAGE_SIZE }) =>
  getRelationUsers({
    action: "搜索我的关注",
    url: "https://api.bilibili.com/x/relation/followings/search",
    mid,
    page,
    pageSize,
    extraParams: {
      name: keyword,
    },
  });

export const getFollowers = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) =>
  getRelationUsers({
    action: "获取我的粉丝",
    url: "https://api.bilibili.com/x/relation/followers",
    mid,
    page,
    pageSize,
  });

const getDevId = () => {
  const cachedDevId = localStorage.getItem(DEV_ID_KEY);
  if (cachedDevId) {
    return cachedDevId;
  }
  const devId = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (name) => {
    const randomInt = (Math.random() * 16) | 0;
    return (name === "x" ? randomInt : (randomInt & 3) | 8).toString(16).toUpperCase();
  });
  localStorage.setItem(DEV_ID_KEY, devId);
  return devId;
};

export const sendVideoText = async ({ nav, csrf, video, receiver }) => {
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
