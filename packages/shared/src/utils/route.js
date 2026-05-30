/**
 * Subscribes to SPA URL changes caused by history, popstate, or hashchange.
 *
 * @param {(event: { url: string, previousUrl: string }) => void} handler Change handler.
 * @param {object} [options] Subscription options.
 * @returns {() => void} Cleanup function.
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
