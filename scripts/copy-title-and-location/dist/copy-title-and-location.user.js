// ==UserScript==
// @name         复制标题和地址
// @namespace    http://tampermonkey.net/
// @version      0.7.2
// @author       LiarCoder
// @description  一键复制标题和地址为Markdown格式并带上当前时间（myFirstScript）
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVQ4jY3TO0tcURQF4G/ixFdhCIg2qWysZPwDsUkXSJk2Qso0IpLOTtLERkGwEjQhXV5d0gkGK6v7E/IHgg9EHR0nHLLvzGHujGbB5pzLOXvttfc6twaNRiMta1g1GG28xJfyRlEU6rF/FskpjvA4o7nABD7gM17hY3lYEjzHOd4NqP8QW3gURA+wJzYJI2hV0rq4xtfsexdPcwW3EQmLaSw4wVCQr+M1DtDEJt7iVz1jLRUsB0GOn9iPymWRJ7mChOFY5ysNVFHrHaKwKWEGUyG1HZcnMY4/0UarH0Ez1u+Yq9T8h5tw5BTTg1p4EYfNnuR6WC3srCgo+/odcRdK+7ubrGIRvfeLq7hz3KsgESXPE97HDFKfOUazxLFegst4MAmf7pGfkP6NNNAOwTesYAM/YkgdrzOcYRYLeJMTHMbTTE926T8U7GAb/gI+kkP5n3CsvwAAAABJRU5ErkJggg==
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/copy-title-and-location/dist/copy-title-and-location.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/copy-title-and-location/dist/copy-title-and-location.user.js
// @match        *://*/*
// @grant        GM_addStyle
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  const compact = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.filter(Boolean);
  };
  const createCopyError = (fallbackError, clipboardError) => {
    if (clipboardError) {
      fallbackError.clipboardError = clipboardError;
    }
    return fallbackError;
  };
  const copyTextWithTextarea = (text, { documentRef }) => {
    if (!(documentRef == null ? void 0 : documentRef.createElement)) {
      throw new Error("Document is unavailable.");
    }
    const target = documentRef.body ?? documentRef.documentElement;
    if (!(target == null ? void 0 : target.appendChild)) {
      throw new Error("Clipboard fallback target is unavailable.");
    }
    const textarea = documentRef.createElement("textarea");
    textarea.value = text;
    textarea.style.cssText = "position:fixed;top:-999px;left:-999px;";
    textarea.setAttribute("readonly", "");
    target.appendChild(textarea);
    try {
      textarea.select();
      const copied = documentRef.execCommand("copy");
      if (!copied) {
        throw new Error("Clipboard fallback copy command failed.");
      }
    } finally {
      target.removeChild(textarea);
    }
  };
  const copyTextToClipboard = async (text, { navigatorRef = globalThis.navigator, documentRef = globalThis.document } = {}) => {
    const normalizedText = String(text ?? "");
    const clipboard = navigatorRef == null ? void 0 : navigatorRef.clipboard;
    let clipboardError = null;
    if (typeof (clipboard == null ? void 0 : clipboard.writeText) === "function") {
      try {
        await clipboard.writeText(normalizedText);
        return;
      } catch (error) {
        clipboardError = error;
      }
    }
    try {
      copyTextWithTextarea(normalizedText, { documentRef });
    } catch (fallbackError) {
      throw createCopyError(fallbackError, clipboardError);
    }
  };
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  const createElement = ({
    parent = null,
    tagName = "div",
    text = "",
    html = "",
    className = "",
    attributes = {},
    dataset = {},
    children = [],
    events = []
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
      if (value !== void 0 && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
    Object.entries(dataset).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
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
  const isTopWindow = (windowRef = globalThis.window) => {
    try {
      return Boolean(windowRef && windowRef.self === windowRef.top);
    } catch {
      return false;
    }
  };
  const createSvgElement = (tagName, attributes = {}) => {
    const element = document.createElementNS(SVG_NAMESPACE, tagName);
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== void 0 && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
    return element;
  };
  const getDocumentMountTarget = (documentRef = globalThis.document) => (documentRef == null ? void 0 : documentRef.body) ?? (documentRef == null ? void 0 : documentRef.documentElement) ?? null;
  const addStyle = (css, { id = "", target = document.head || document.documentElement } = {}) => {
    if (id) {
      const existing = document.getElementById(id);
      if (existing) {
        existing.textContent = css;
        return existing;
      }
    }
    if (typeof GM_addStyle === "function") {
      return GM_addStyle(css);
    }
    const style = document.createElement("style");
    if (id) {
      style.id = id;
    }
    style.textContent = css;
    target.appendChild(style);
    return style;
  };
  const BUTTON_ID = "copy-title-and-location";
  const STYLE_ID = `${BUTTON_ID}-style`;
  const BUTTON_TEXT = "复制标题和地址";
  const BUTTON_STYLE = `
  #${BUTTON_ID} {
    position: fixed;
    top: 100px;
    left: -95px;
    opacity: 0.3;
    z-index: 2147483647;
    background-image: none;
    cursor: pointer;
    color: #fff;
    background-color: #0084ff !important;
    margin: 5px 0;
    width: auto;
    border-radius: 3px;
    border: #0084ff;
    outline: none;
    padding: 3px 6px;
    height: 26px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    transition: left, 0.5s;
  }

  #${BUTTON_ID}:hover {
    left: 0;
    opacity: 1;
  }

  #${BUTTON_ID} svg {
    width: auto;
    vertical-align: middle;
    margin-left: 10px;
    border-style: none;
    text-align: center;
    display: inline-block !important;
    margin-bottom: 2px;
  }
`;
  const SITE_REFERENCE_HANDLERS = [
    {
      matches: ({ hostname }) => hostname.includes("mp.weixin.qq.com"),
      buildReference: ({ baseReference, href, title }) => {
        const officialAccount = document.getElementById("js_name");
        const publishDate = document.getElementById("publish_time");
        if (!officialAccount || !publishDate) {
          return baseReference;
        }
        publishDate.click();
        return `参考：[【微信公众号：${officialAccount.innerText}${publishDate.innerText}】${title}](${href})`;
      }
    }
  ];
  const createButtonIcon = () => {
    const icon = createSvgElement("svg", {
      width: 16,
      height: 16,
      viewBox: "0 0 48 48",
      fill: "none"
    });
    icon.append(
      createSvgElement("rect", {
        width: 48,
        height: 48,
        fill: "white",
        "fill-opacity": "0.01"
      }),
      createSvgElement("path", {
        d: "M8 6C8 4.89543 8.89543 4 10 4H30L40 14V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V6Z",
        fill: "none",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linejoin": "round"
      }),
      createSvgElement("path", {
        d: "M16 20H32",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }),
      createSvgElement("path", {
        d: "M16 28H32",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      })
    );
    return icon;
  };
  const createTimestamp = () => {
    const date = /* @__PURE__ */ new Date();
    const dateText = date.toLocaleDateString().replace("/", "年").replace("/", "月");
    const timeText = date.toLocaleTimeString("chinese", {
      hour12: false
    });
    return `更新：${dateText}日${timeText}`;
  };
  const buildReference = ({ href, title }) => `参考：[${title}](${href})`;
  const getReference = () => {
    const context = {
      hostname: window.location.hostname,
      href: window.location.href,
      title: document.title
    };
    const baseReference = buildReference(context);
    const handler = SITE_REFERENCE_HANDLERS.find(({ matches }) => matches(context));
    if (!handler) {
      return baseReference;
    }
    return handler.buildReference({
      ...context,
      baseReference
    });
  };
  const getAddress = ({ hasQuote = true } = {}) => {
    const reference = getReference();
    return hasQuote ? `
> ${reference}` : reference;
  };
  const copyText = async (text) => {
    try {
      await copyTextToClipboard(text);
    } catch (error) {
      console.error("复制失败：", error);
    }
  };
  const createCopyButton = () => createElement({
    tagName: "button",
    text: BUTTON_TEXT,
    attributes: {
      id: BUTTON_ID,
      type: "button"
    },
    children: [createButtonIcon()],
    events: [
      {
        name: "click",
        handler: async () => {
          await copyText(`${createTimestamp()}${getAddress()}`);
        }
      },
      {
        name: "contextmenu",
        handler: async (event) => {
          event.preventDefault();
          await copyText(getAddress({ hasQuote: false }));
        }
      }
    ]
  });
  const init = () => {
    if (!isTopWindow() || document.getElementById(BUTTON_ID)) {
      return;
    }
    const mountTarget = getDocumentMountTarget();
    if (!mountTarget) {
      return;
    }
    mountTarget.appendChild(createCopyButton());
    addStyle(BUTTON_STYLE, { id: STYLE_ID });
  };
  init();

})();