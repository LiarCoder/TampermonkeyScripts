/**
 * 从当前文档读取并解码指定 cookie 值。
 *
 * @param {string} name 要读取的 cookie 名称。
 * @returns {string} 解码后的 cookie 值；不存在时返回空字符串。
 */
export const getCookie = (name) => {
  const cookie = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : "";
};
