/**
 * 订阅由浏览器历史记录、前进后退或哈希变化触发的单页应用地址变化。
 *
 * @param {(event: { url: string, previousUrl: string }) => void} handler 地址变化处理函数。
 * @param {object} [options] 订阅配置。
 * @returns {() => void} 清理函数。
 */
export const onUrlChange = (handler, { fireImmediately = false } = {}) => {
  let currentUrl = location.href;

  const notify = () => {
    if (location.href === currentUrl) {
      return;
    }
    const previousUrl = currentUrl;
    currentUrl = location.href;
    handler({ url: currentUrl, previousUrl });
  };

  const wrapHistoryMethod = (methodName) => {
    const original = history[methodName];
    history[methodName] = function wrappedHistoryMethod(...args) {
      const result = original.apply(this, args);
      window.setTimeout(notify, 0);
      return result;
    };
    return () => {
      history[methodName] = original;
    };
  };

  const restorePushState = wrapHistoryMethod("pushState");
  const restoreReplaceState = wrapHistoryMethod("replaceState");

  window.addEventListener("popstate", notify);
  window.addEventListener("hashchange", notify);

  if (fireImmediately) {
    handler({ url: currentUrl, previousUrl: "" });
  }

  return () => {
    restorePushState();
    restoreReplaceState();
    window.removeEventListener("popstate", notify);
    window.removeEventListener("hashchange", notify);
  };
};
