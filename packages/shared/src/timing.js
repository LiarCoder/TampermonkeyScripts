export const debounce = (callback, delay) => {
  let timer = null;
  const debounced = (...args) => {
    globalThis.clearTimeout(timer);
    timer = globalThis.setTimeout(() => callback(...args), delay);
  };
  debounced.cancel = () => globalThis.clearTimeout(timer);
  return debounced;
};
