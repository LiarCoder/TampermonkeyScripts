/**
 * 归一化图片地址，便于浏览器展示。
 *
 * @param {string} url 页面或接口返回的原始图片地址。
 * @returns {string} HTTPS 图片地址；输入为空时返回空字符串。
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
