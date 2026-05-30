const GITHUB_RAW_DIST_BASE_URL =
  "https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts";

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

/**
 * 构建 GitHub Raw 上的脚本发布地址。
 *
 * @param {string} scriptName 脚本目录名，也是构建产物的文件名前缀。
 * @returns {string} 指向 dist 目录下 user.js 的 GitHub Raw 地址。
 */
export const buildRawScriptUrl = (scriptName) =>
  `${GITHUB_RAW_DIST_BASE_URL}/${scriptName}/dist/${scriptName}.user.js`;
