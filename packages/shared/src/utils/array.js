/**
 * 当输入是数组时，仅返回其中的真值项。
 *
 * @param {unknown} items 可能是数组的值。
 * @returns {Array<unknown>} 真值数组项；非数组时返回空数组。
 */
export const compact = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(Boolean);
};

/**
 * 数组去重，保留第一次出现的顺序。
 *
 * @param {unknown} items 可能是数组的值。
 * @returns {Array<unknown>} 去重后的数组；非数组时返回空数组。
 */
export const unique = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return [...new Set(items)];
};
