/**
 * Sends a Tampermonkey GM_xmlhttpRequest and parses the JSON response body.
 *
 * @param {object} options Request options.
 * @param {string} options.url Request URL.
 * @param {string} [options.method="GET"] HTTP method.
 * @param {string | FormData | URLSearchParams | null} [options.data=null] Request body.
 * @param {Record<string, string>} [options.headers={}] Request headers.
 * @returns {Promise<unknown>} Parsed JSON response.
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
