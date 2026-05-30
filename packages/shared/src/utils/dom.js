import { compact } from "./array.js";

/**
 * 创建 DOM 元素，并应用常见属性、子节点和事件。
 *
 * @param {object} options 元素创建配置。
 * @returns {HTMLElement} 创建后的元素。
 */
export const createElement = ({
  parent = null,
  tagName = "div",
  text = "",
  html = "",
  className = "",
  attributes = {},
  dataset = {},
  children = [],
  events = [],
} = {}) => {
  const element = document.createElement(tagName);

  if (text) {
    element.innerText = text;
  }
  if (html) {
    element.innerHTML = html;
  }
  if (className) {
    element.className = className;
  }

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  });

  Object.entries(dataset).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.dataset[key] = String(value);
    }
  });

  const resolvedChildren = typeof children === "function" ? children(element) : children;
  compact(resolvedChildren).forEach((child) => element.appendChild(child));

  compact(events).forEach(({ name, handler, options }) => {
    if (name && handler) {
      element.addEventListener(name, handler, options);
    }
  });

  if (parent) {
    parent.appendChild(element);
  }

  return element;
};

/**
 * 轮询等待元素出现，直到命中元素或超时。
 *
 * @param {string} selector 要查询的 CSS 选择器。
 * @param {object} [options] 轮询配置。
 * @returns {Promise<Element>} 匹配到的元素。
 */
export const waitForElement = (
  selector,
  { root = document, timeout = 10000, interval = 100 } = {}
) =>
  new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const element = root.querySelector(selector);
      if (element) {
        window.clearInterval(timer);
        resolve(element);
        return;
      }

      if (Date.now() - startedAt >= timeout) {
        window.clearInterval(timer);
        reject(new Error(`Timed out waiting for element: ${selector}`));
      }
    }, interval);
  });
