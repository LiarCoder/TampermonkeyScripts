/**
 * Reads and decodes a cookie value from the current document.
 *
 * @param {string} name Cookie name to read.
 * @returns {string} Decoded cookie value, or an empty string when it is missing.
 */
export const getCookie = (name) => {
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
};
