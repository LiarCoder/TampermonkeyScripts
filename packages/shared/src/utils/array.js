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
