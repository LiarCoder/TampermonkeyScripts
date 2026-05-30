/**
 * 发送 Tampermonkey GM_xmlhttpRequest 请求，并解析 JSON 响应体。
 *
 * @param {object} options 请求配置。
 * @param {string} options.url 请求地址。
 * @param {string} [options.method="GET"] HTTP 方法。
 * @param {string | FormData | URLSearchParams | null} [options.data=null] 请求体。
 * @param {Record<string, string>} [options.headers={}] 请求头。
 * @returns {Promise<unknown>} 解析后的 JSON 响应。
 */
export const httpRequest = ({ method = "GET", url, data = null, headers = {} }) => {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method,
      url,
      data,
      headers,
      withCredentials: true,
      timeout: 15000,
      onload: (response) => {
        try {
          const result = JSON.parse(response.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error(`响应解析失败：${error.message}`));
        }
      },
      onerror: () => reject(new Error("网络请求失败")),
      ontimeout: () => reject(new Error("网络请求超时")),
    });
  });
};
