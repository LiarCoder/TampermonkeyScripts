/** Script namespace used in DOM class names, storage keys, and logs. */
export const SCRIPT_ID = "bili-share-to-friends";

/** localStorage key for the generated Bilibili IM device id. */
export const DEV_ID_KEY = `${SCRIPT_ID}.dev_id`;

/** localStorage key for recently contacted IM sessions. */
export const SESSION_CACHE_KEY = `${SCRIPT_ID}.recent_sessions.v2`;

/** Cache lifetime for recent IM sessions, in milliseconds. */
export const SESSION_CACHE_TTL = 5 * 60 * 1000;

/** Maximum number of recent IM sessions shown in the dialog. */
export const SESSION_LIMIT = 20;

/** Page size used when loading following or follower users. */
export const RELATION_PAGE_SIZE = 20;

/** Selector for the Bilibili native share button container. */
export const SHARE_BUTTONS_SELECTOR = ".video-share-dropdown .dropdown-bottom > .share-btns";

/** Selector for the scroll container that owns relation list pagination. */
export const LIST_SCROLL_SELECTOR = "[data-bili-share-to-friends-list-scroll]";

/** WBI mixin key permutation table used by Bilibili web API signing. */
export const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];
