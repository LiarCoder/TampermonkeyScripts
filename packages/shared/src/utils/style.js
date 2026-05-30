/**
 * Adds or updates a style tag, falling back to GM_addStyle when available.
 *
 * @param {string} css CSS text to inject.
 * @param {object} [options] Injection options.
 * @returns {HTMLElement | unknown} Injected style node or GM_addStyle result.
 */
export const addStyle = (
  css,
  { id = "", target = document.head || document.documentElement } = {}
) => {
  if (id) {
    const existing = document.getElementById(id);
    if (existing) {
      existing.textContent = css;
      return existing;
    }
  }

  if (typeof GM_addStyle === "function") {
    return GM_addStyle(css);
  }

  const style = document.createElement("style");
  if (id) {
    style.id = id;
  }
  style.textContent = css;
  target.appendChild(style);
  return style;
};
