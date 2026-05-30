import {
  buildQuery,
  getCookie,
  httpRequest,
  md5,
  normalizeImageUrl,
} from "@tampermonkey-scripts/shared";

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

/**
 * Reads the current video BV id from the Bilibili video page URL.
 *
 * @returns {string} BV id, or an empty string outside a video page.
 */
export const getBvidFromLocation = () => {
  const match = location.href.match(/\/video\/(BV[0-9A-Za-z]+)/);
  return match ? match[1] : "";
};

/**
 * Ensures a Bilibili API response is successful and returns its data payload.
 *
 * @param {object} result Bilibili API response.
 * @param {string} action User-facing action name for error messages.
 * @returns {unknown} Response data payload.
 */
const assertSuccess = (result, action) => {
  if (!result || result.code !== 0) {
    const message = result?.message || result?.msg || "未知错误";
    throw new Error(`${action}失败：${message}（code: ${result?.code ?? "-"}）`);
  }
  return result.data;
};

/**
 * Builds the form body required by Bilibili private message sending API.
 *
 * @param {object} options Message form options.
 * @returns {URLSearchParams} Encoded private message form body.
 */
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

/**
 * Sends an already encoded private message form to one Bilibili receiver.
 *
 * @param {object} options Private message request options.
 * @returns {Promise<unknown>} Bilibili send message response data.
 */
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

/**
 * Creates the WBI mixin key from Bilibili image keys.
 *
 * @param {string} imgKey WBI image key.
 * @param {string} subKey WBI sub image key.
 * @returns {string} 32-character mixin key.
 */
const getMixinKey = (imgKey, subKey) =>
  mixinKeyEncTab
    .map((index) => `${imgKey}${subKey}`[index])
    .join("")
    .slice(0, 32);

/**
 * Signs Bilibili web API params with WBI fields when the nav response exposes keys.
 *
 * @param {Record<string, string | number>} params Unsigned query params.
 * @param {object} wbiImg WBI image metadata from the nav API.
 * @returns {Record<string, string | number>} Signed params, or original params when keys are absent.
 */
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

/**
 * Loads and caches the current Bilibili navigation/login payload.
 *
 * @returns {Promise<object>} Bilibili nav API data.
 */
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

/**
 * Verifies that the user is logged in and has a CSRF token for private messages.
 *
 * @returns {Promise<{ nav: object, csrf: string }>} Login payload and CSRF token.
 */
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

/**
 * Loads the current video metadata needed for text sharing.
 *
 * @returns {Promise<object>} Normalized video metadata.
 */
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

/**
 * Reads recent session contacts from localStorage when the TTL is still valid.
 *
 * @returns {Array<object> | null} Cached sessions or null when unavailable.
 */
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

/**
 * Stores recent session contacts in localStorage with a creation timestamp.
 *
 * @param {Array<object>} sessions Normalized recent session contacts.
 */
const writeSessionCache = (sessions) => {
  localStorage.setItem(
    SESSION_CACHE_KEY,
    JSON.stringify({
      createdAt: Date.now(),
      sessions,
    })
  );
};

/**
 * Resolves account metadata for a session from inline or companion account info.
 *
 * @param {object} session Raw Bilibili session item.
 * @param {object} accountInfoMap Account info map returned by the session API.
 * @returns {object} Matching account metadata.
 */
const getSessionAccountInfo = (session, accountInfoMap = {}) => {
  const talkerId = String(session.talker_id || "");
  return session.account_info || accountInfoMap[talkerId] || accountInfoMap[Number(talkerId)] || {};
};

/**
 * Converts a Bilibili IM session item to a selectable user entry.
 *
 * @param {object} session Raw Bilibili session item.
 * @param {object} accountInfoMap Account info map returned by the session API.
 * @returns {object | null} Normalized user entry, or null for unsupported sessions.
 */
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

/**
 * Converts a relation API user item to a selectable user entry.
 *
 * @param {object} user Raw Bilibili relation user.
 * @returns {object | null} Normalized user entry, or null when the UID is missing.
 */
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

/**
 * Loads public profile information for one Bilibili UID.
 *
 * @param {number} mid Bilibili user id.
 * @returns {Promise<object>} Normalized user profile.
 */
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

/**
 * Fills recent sessions that only include UID with profile name and avatar data.
 *
 * @param {Array<object>} sessions Normalized recent sessions.
 * @returns {Promise<Array<object>>} Enriched recent sessions.
 */
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

/**
 * Loads recent private message contacts, optionally bypassing the session cache.
 *
 * @param {boolean} [forceRefresh=false] Whether to ignore cached sessions.
 * @returns {Promise<Array<object>>} Recent private message contacts.
 */
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

/**
 * Loads one page of following or follower users from a Bilibili relation API.
 *
 * @param {object} options Relation API request options.
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} Relation page.
 */
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

/**
 * Loads one page of users followed by the current account.
 *
 * @param {object} options Pagination options.
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} Following page.
 */
export const getFollowings = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) =>
  getRelationUsers({
    action: "获取我的关注",
    url: "https://api.bilibili.com/x/relation/followings",
    mid,
    page,
    pageSize,
  });

/**
 * Searches users followed by the current account through Bilibili's relation search API.
 *
 * @param {object} options Search and pagination options.
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} Search page.
 */
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

/**
 * Loads one page of users following the current account.
 *
 * @param {object} options Pagination options.
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} Follower page.
 */
export const getFollowers = ({ mid, page = 1, pageSize = RELATION_PAGE_SIZE }) =>
  getRelationUsers({
    action: "获取我的粉丝",
    url: "https://api.bilibili.com/x/relation/followers",
    mid,
    page,
    pageSize,
  });

/**
 * Reads or creates the persistent Bilibili IM device id.
 *
 * @returns {string} Device id used by the send message API.
 */
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

/**
 * Sends the current video as a plain text private message.
 *
 * @param {object} options Send options.
 * @returns {Promise<unknown>} Bilibili send message response data.
 */
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
