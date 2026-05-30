/**
 * 构建 URL 查询字符串，并跳过空值参数。
 *
 * @param {Record<string, string | number | boolean | null | undefined>} params 查询参数。
 * @returns {string} 编码后的查询字符串。
 */
export const buildQuery = (params) => {
  const query = new URLSearchParams();
  Object.keys(params).forEach((key) => {
    const value = params[key];
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  return query.toString();
};
