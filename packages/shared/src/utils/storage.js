/**
 * 安全解析 JSON 字符串；解析失败时返回兜底值。
 *
 * @param {string | null | undefined} rawValue JSON 字符串。
 * @param {unknown} [fallback=null] 解析失败或空值时的兜底值。
 * @returns {unknown} 解析结果或兜底值。
 */
export const safeParseJson = (rawValue, fallback = null) => {
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    return fallback;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return fallback;
  }
};

/**
 * 安全解析 JSON 数组；解析结果不是数组时返回空数组。
 *
 * @param {string | null | undefined} rawValue JSON 字符串。
 * @returns {Array<unknown>} 解析后的数组。
 */
export const safeParseArray = (rawValue) => {
  const parsedValue = safeParseJson(rawValue, []);
  return Array.isArray(parsedValue) ? parsedValue : [];
};

/**
 * 创建支持可选命名空间的 JSON 存储封装。
 *
 * @param {object} [options] 存储配置。
 * @returns {{ get: Function, set: Function, remove: Function }} JSON 存储适配器。
 */
export const createJsonStorage = ({ namespace, storage = window.localStorage } = {}) => {
  const resolveKey = (key) => (namespace ? `${namespace}.${key}` : key);

  return {
    get(key, fallback = null) {
      const raw = storage.getItem(resolveKey(key));
      return safeParseJson(raw, fallback);
    },
    set(key, value) {
      storage.setItem(resolveKey(key), JSON.stringify(value));
    },
    remove(key) {
      storage.removeItem(resolveKey(key));
    },
  };
};

/**
 * 创建基于 JSON 存储的 TTL 缓存。
 *
 * @param {object} [options] 缓存配置。
 * @returns {{ get: Function, set: Function, remove: Function }} TTL 缓存适配器。
 */
export const createTtlCache = ({ namespace, ttl, storage = window.localStorage } = {}) => {
  const jsonStorage = createJsonStorage({ namespace, storage });

  return {
    get(key, fallback = null) {
      const entry = jsonStorage.get(key);
      if (!entry || typeof entry.expiresAt !== "number" || Date.now() > entry.expiresAt) {
        return fallback;
      }
      return entry.value;
    },
    set(key, value, customTtl = ttl) {
      jsonStorage.set(key, {
        value,
        expiresAt: Date.now() + customTtl,
      });
    },
    remove(key) {
      jsonStorage.remove(key);
    },
  };
};
