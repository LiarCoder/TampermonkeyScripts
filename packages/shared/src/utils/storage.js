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
      if (raw === null) {
        return fallback;
      }
      try {
        return JSON.parse(raw);
      } catch {
        return fallback;
      }
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
