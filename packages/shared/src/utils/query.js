/**
 * Builds a URL query string while omitting empty values.
 *
 * @param {Record<string, string | number | boolean | null | undefined>} params Query parameters.
 * @returns {string} Encoded query string.
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
