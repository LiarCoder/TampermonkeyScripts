export const compact = (items) => {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.filter(Boolean);
};

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
