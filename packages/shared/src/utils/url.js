/**
 * Normalizes image URLs for browser display.
 *
 * @param {string} url Raw image URL returned by a page or API.
 * @returns {string} HTTPS image URL, or an empty string for empty input.
 */
export const normalizeImageUrl = (url) => {
  if (!url) {
    return "";
  }
  if (url.startsWith("//")) {
    return `https:${url}`;
  }
  if (url.startsWith("http://")) {
    return `https://${url.slice("http://".length)}`;
  }
  return url;
};
