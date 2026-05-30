/**
 * 添加或更新样式标签；可用时优先使用 GM_addStyle。
 *
 * @param {string} css 要注入的 CSS 文本。
 * @param {object} [options] 注入配置。
 * @returns {HTMLElement | unknown} 注入后的样式节点或 GM_addStyle 返回值。
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
