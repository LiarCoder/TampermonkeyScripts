/**
 * Returns only truthy entries when the input is an array.
 *
 * @param {unknown} items Value that may contain an array.
 * @returns {Array<unknown>} Truthy array entries, or an empty array for non-arrays.
 */
export const compact = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(Boolean);
};
