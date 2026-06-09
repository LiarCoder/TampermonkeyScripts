/** 脚本命名空间，用于 DOM 类名、存储键和日志。 */
export const SCRIPT_ID = "bili-share-to-friends";

/** 用户头像加载失败时使用的 B 站默认头像。 */
export const DEFAULT_AVATAR_URL = "https://static.hdslb.com/images/member/noface.gif";

/** 生成的 B 站私信设备 id 对应的本地存储键。 */
export const DEV_ID_KEY = `${SCRIPT_ID}.dev_id`;

/** 最近私信会话缓存对应的本地存储键。 */
export const SESSION_CACHE_KEY = `${SCRIPT_ID}.recent_sessions.v2`;

/** 最近私信会话缓存有效期，单位毫秒。 */
export const SESSION_CACHE_TTL = 5 * 60 * 1000;

/** 弹窗中展示的最近私信会话数量上限。 */
export const SESSION_LIMIT = 20;

/** 单次建议发送的用户数量上限，超过后禁用发送按钮。 */
export const MAX_SELECTED_USERS = 5;

/** 加载关注或粉丝列表时使用的分页大小。 */
export const RELATION_PAGE_SIZE = 20;

/** B 站普通视频页原生分享按钮容器选择器。 */
export const VIDEO_SHARE_BUTTONS_SELECTOR = ".video-share-dropdown .dropdown-bottom > .share-btns";

/** B 站番剧播放页原生分享按钮容器选择器。 */
export const BANGUMI_SHARE_BUTTONS_SELECTOR = "#share-container-id .Share_shareBtns__X_uY9";

/** 关系用户列表分页滚动容器选择器。 */
export const LIST_SCROLL_SELECTOR = "[data-bili-share-to-friends-list-scroll]";

/** B 站网页接口 WBI 签名使用的混合密钥重排表。 */
export const MIXIN_KEY_ENC_TAB = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];
