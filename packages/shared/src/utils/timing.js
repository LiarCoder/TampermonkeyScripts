/**
 * 创建带取消方法的防抖函数。
 *
 * @param {Function} callback 延迟后执行的函数。
 * @param {number} delay 延迟毫秒数。
 * @returns {Function & { cancel: () => void }} 防抖后的函数。
 */
export const debounce = (callback, delay) => {
  let timer = null;
  const debounced = (...args) => {
    globalThis.clearTimeout(timer);
    timer = globalThis.setTimeout(() => callback(...args), delay);
  };
  debounced.cancel = () => globalThis.clearTimeout(timer);
  return debounced;
};
