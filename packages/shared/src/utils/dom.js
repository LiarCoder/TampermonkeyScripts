import { compact } from "./array.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

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
 * 判断当前脚本是否运行在顶层窗口；跨域 frame 访问 window.top 失败时返回 false。
 *
 * @param {Window} [windowRef] 要判断的窗口对象，主要用于测试。
 * @returns {boolean} 当前窗口是否为顶层窗口。
 */
export const isTopWindow = (windowRef = globalThis.window) => {
  try {
    return Boolean(windowRef && windowRef.self === windowRef.top);
  } catch {
    return false;
  }
};

/**
 * 创建 SVG 元素并应用属性。
 *
 * @param {string} tagName SVG 标签名。
 * @param {object} [attributes] SVG 属性。
 * @returns {SVGElement} 创建后的 SVG 元素。
 */
export const createSvgElement = (tagName, attributes = {}) => {
  const element = document.createElementNS(SVG_NAMESPACE, tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      element.setAttribute(key, String(value));
    }
  });

  return element;
};

/**
 * 获取适合挂载脚本 DOM 的页面容器。
 *
 * @param {Document} [documentRef] 目标文档，主要用于测试。
 * @returns {HTMLElement | null} 页面 body 或 documentElement。
 */
export const getDocumentMountTarget = (documentRef = globalThis.document) =>
  documentRef?.body ?? documentRef?.documentElement ?? null;

/**
 * 观察元素指定属性的变化；MutationObserver 不可用时返回空清理函数。
 *
 * @param {Element} element 要观察的元素。
 * @param {string} attributeName 属性名。
 * @param {Function} callback 属性变化后的回调。
 * @param {object} [options] 运行时依赖，主要用于测试。
 * @returns {Function} 停止观察的清理函数。
 */
export const observeAttributeChange = (
  element,
  attributeName,
  callback,
  { observerConstructor = globalThis.MutationObserver } = {}
) => {
  if (!element || !attributeName || typeof callback !== "function") {
    return () => {};
  }
  if (typeof observerConstructor !== "function") {
    return () => {};
  }

  const observer = new observerConstructor(() => {
    callback(element.getAttribute(attributeName), element);
  });
  observer.observe(element, {
    attributes: true,
    attributeFilter: [attributeName],
  });

  return () => observer.disconnect();
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
