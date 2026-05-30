/**
 * Creates a debounced function with a cancel method.
 *
 * @param {Function} callback Function to run after the delay.
 * @param {number} delay Delay in milliseconds.
 * @returns {Function & { cancel: () => void }} Debounced function.
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
