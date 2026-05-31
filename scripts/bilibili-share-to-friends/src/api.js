import { GM_xmlhttpRequest } from "$";

import {
  buildQuery,
  getCookie,
  httpRequest as sharedHttpRequest,
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
  MIXIN_KEY_ENC_TAB,
} from "./constants.js";

let navCache = null;

const httpRequest = (options) =>
  sharedHttpRequest({
    ...options,
    request: GM_xmlhttpRequest,
  });

/**
 * 从当前 B 站视频页地址读取 BV 号。
 *
 * @returns {string} BV 号；不在视频页时返回空字符串。
 */
export const getBvidFromLocation = () => {
  const match = location.href.match(/\/video\/(BV[0-9A-Za-z]+)/);
  return match ? match[1] : "";
};

/**
 * 校验 B 站接口响应是否成功，并返回数据字段。
 *
 * @param {object} result B 站接口响应。
 * @param {string} action 用于错误提示的操作名称。
 * @returns {unknown} 响应中的数据字段。
 */
const assertSuccess = (result, action) => {
  if (!result || result.code !== 0) {
    const message = result?.message || result?.msg || "未知错误";
    throw new Error(`${action}失败：${message}（code: ${result?.code ?? "-"}）`);
  }
  return result.data;
};

/**
 * 构造 B 站发送私信接口所需的表单数据。
 *
 * @param {object} options 私信表单配置。
 * @returns {URLSearchParams} 编码后的私信表单数据。
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
 * 将已编码的私信表单发送给指定 B 站用户。
 *
 * @param {object} options 私信请求配置。
 * @returns {Promise<unknown>} B 站发送私信接口返回数据。
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
 * 根据 B 站图片密钥生成 WBI 混合密钥。
 *
 * @param {string} imgKey WBI 图片密钥。
 * @param {string} subKey WBI 子图片密钥。
 * @returns {string} 32 位混合密钥。
 */
const getMixinKey = (imgKey, subKey) =>
  MIXIN_KEY_ENC_TAB.map((index) => `${imgKey}${subKey}`[index])
    .join("")
    .slice(0, 32);

/**
 * 当导航接口响应提供密钥时，为 B 站网页接口参数补充 WBI 签名字段。
 *
 * @param {Record<string, string | number>} params 未签名的查询参数。
 * @param {object} wbiImg 导航接口返回的 WBI 图片信息。
 * @returns {Record<string, string | number>} 签名后的参数；缺少密钥时返回原参数。
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
 * 加载并缓存当前 B 站导航和登录信息。
 *
 * @returns {Promise<object>} B 站导航接口数据。
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
 * 校验用户已登录，并且具备发送私信所需的 CSRF 令牌。
 *
 * @returns {Promise<{ nav: object, csrf: string }>} 登录信息和 CSRF 令牌。
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
 * 加载文本分享所需的当前视频信息。
 *
 * @returns {Promise<object>} 归一化后的视频信息。
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
 * 在缓存仍有效时，从本地存储读取最近私信联系人。
 *
 * @returns {Array<object> | null} 缓存的会话；不可用时返回空值。
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
 * 将最近私信联系人和创建时间写入本地存储。
 *
 * @param {Array<object>} sessions 归一化后的最近私信联系人。
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
 * 将关系接口用户项转换为可选择的用户项。
 *
 * @param {object} user B 站原始关系用户。
 * @returns {object | null} 归一化后的用户项；缺少 UID 时返回 null。
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
 * 从最近私信会话中提取可展示的单聊联系人 UID。
 *
 * @param {Array<object>} sessions B 站原始会话列表。
 * @returns {Array<number>} 按最近会话顺序排列的 UID 列表。
 */
const getRecentTalkerIds = (sessions) => {
  const seen = new Set();
  const talkerIds = [];

  for (const session of sessions) {
    const talkerId = Number(session.talker_id);
    // 只展示一对一私聊联系人，避免群聊、系统通知等非用户会话进入收件人列表。
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

/**
 * 批量加载 B 站 UID 对应的账号资料。
 *
 * @param {Array<number>} uids B 站用户 id 列表。
 * @returns {Promise<Array<object>>} 按输入 UID 顺序排列的用户资料。
 */
const getUserCards = async (uids) => {
  if (uids.length === 0) {
    return [];
  }

  const result = await httpRequest({
    url: `https://api.vc.bilibili.com/account/v1/user/cards?${buildQuery({
      uids: uids.join(","),
    })}`,
  });
  const data = assertSuccess(result, "获取最近私信联系人资料");

  // cards 接口返回数组的顺序不保证稳定，按 mid 建表后再恢复最近会话顺序。
  const userMap = new Map(
    (data || []).map((user) => [
      Number(user.mid),
      {
        mid: Number(user.mid),
        name: user.name,
        avatar: normalizeImageUrl(user.face),
      },
    ])
  );

  return uids.map((uid) => userMap.get(uid)).filter(Boolean);
};

/**
 * 加载最近私信联系人，可选择跳过会话缓存。
 *
 * @param {boolean} [forceRefresh=false] 是否忽略缓存会话。
 * @returns {Promise<Array<object>>} 最近私信联系人。
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
  const sessions = await getUserCards(getRecentTalkerIds(data.session_list || []));
  writeSessionCache(sessions);
  return sessions;
};

/**
 * 从 B 站关系接口加载一页关注或粉丝用户。
 *
 * @param {object} options 关系接口请求配置。
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} 关系用户分页数据。
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
 * 加载当前账号关注用户的一页数据。
 *
 * @param {object} options 分页配置。
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} 关注用户分页数据。
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
 * 通过 B 站关系搜索接口搜索当前账号关注的用户。
 *
 * @param {object} options 搜索和分页配置。
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} 搜索分页数据。
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
 * 加载当前账号粉丝的一页数据。
 *
 * @param {object} options 分页配置。
 * @returns {Promise<{ users: Array<object>, total: number, hasMore: boolean }>} 粉丝分页数据。
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
 * 读取或创建持久化的 B 站私信设备 id。
 *
 * @returns {string} 发送私信接口使用的设备 id。
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
 * 将当前视频作为纯文本私信发送。
 *
 * @param {object} options 发送配置。
 * @returns {Promise<unknown>} B 站发送私信接口返回数据。
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
