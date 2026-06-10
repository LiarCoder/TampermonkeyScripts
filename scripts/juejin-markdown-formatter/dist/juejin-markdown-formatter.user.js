// ==UserScript==
// @name         掘金Markdown格式适配器
// @namespace    http://tampermonkey.net/
// @version      0.3.4
// @author       LiarCoder
// @description  掘金Markdown编辑器适配脚本：从本地导入Markdown文件，并对文档做一些处理：居中图片、居中图片标注的文字、解决==无法高亮的问题、自动填充标题
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA4LTMwVDE2OjMwOjUzKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHN0RXZ0OndoZW49IjIwMjEtMDgtMzBUMTY6MzA6NTMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5n1ZAhAAACMElEQVQ4y2P8//8/MwNh8BdKE1TLRIRh/69du6Z/+fJlIxCbkGJGAi4Eu8zY2Pj9t2/fBK5fv85IyKXEuJCBlZX1PxsbGzFKGViIUcTOzv79379/nMSoJcqFpACqGwjzMij2/kEtYERKJsQkIxS9MBf+Q6L/v3r1ShqYTPRguoHhxwTCMD4wGek+e/ZMDskwuBkgRf9u3bqlHRAQsPnChQtmIP6kSZPq9PT0Lm7dujUMGim/gTEN1nDgwAFPbW3tS93d3W0gtTdu3ND28fHZcu7cOUuwocB0yLBs2bJYkG1z5swpAvGvXLmiJy8v/xUktmHDBq+IiIhDQAuvbt++3QUkJi4u/vf8+fPGILVLly4F6509e3YxiA/2Bicn5zcQzc3N/RlEg1xw9OhRHTk5ue9Ag7Y+ffpU9927dzL+/v67xcTEGIByugYGBmdBarm4uMB6eXh4PsEjhZGR8T8yDQpsaWnp+ydPntSwt7e/funSJQFmZmYGkGFHjhxRA7r+NjRC/qLrxZdsmCUkJB7t379fQ0hI6DswHP/u27dPG8kwsnIKs5SU1OMTJ06o//nzhxXIvkeoxEExUERE5DlaOgMDoFcfY0mDMLknsIIGbuCvX7/YQGEE9J7nly9fQGHBRmTG+AVManYgvb9//2aFZBFgVG/bts0LmkjJxmvWrIkGmQUqD5l+/vzJtmPHDv+PHz9yA4spRlLyLtBl/4HJ7Zu7u/tmIP0dVsD+pVLZwAwA0KEB2b6h03UAAAAASUVORK5CYII=
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/juejin-markdown-formatter/dist/juejin-markdown-formatter.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/juejin-markdown-formatter/dist/juejin-markdown-formatter.user.js
// @match        https://juejin.cn/editor/*
// @grant        none
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
  const waitForElement = (selector, { root = document, timeout = 1e4, interval = 100 } = {}) => new Promise((resolve, reject) => {
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
  const readFileAsText = (file, { fileReaderConstructor = globalThis.FileReader } = {}) => new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File is unavailable."));
      return;
    }
    if (typeof fileReaderConstructor !== "function") {
      reject(new Error("FileReader is unavailable."));
      return;
    }
    const reader = new fileReaderConstructor();
    reader.addEventListener("load", () => {
      resolve(String(reader.result ?? ""));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Failed to read file as text."));
    });
    reader.readAsText(file);
  });
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
  const styles = 'label[for="juejin-markdown-formatter-import-md-file"] {\r\n  vertical-align: middle;\r\n  cursor: pointer;\r\n}\r\n\r\n[data-title] {\r\n  position: relative;\r\n  overflow: visible;\r\n}\r\n\r\nlabel[for="juejin-markdown-formatter-import-md-file"]::before,\r\nlabel[for="juejin-markdown-formatter-import-md-file"]::after {\r\n  display: block;\r\n  position: fixed;\r\n  opacity: 0;\r\n  transition: 0.15s 0.15s;\r\n  visibility: hidden;\r\n}\r\n\r\nlabel[for="juejin-markdown-formatter-import-md-file"]::before {\r\n  content: attr(data-title);\r\n  z-index: 2;\r\n  transform: translate(-53px, -36px);\r\n  border-radius: 5px;\r\n  padding: 5px 10px;\r\n  line-height: 16px;\r\n  text-align: center;\r\n  background-color: #333333;\r\n  color: #fff;\r\n  font-size: 12px;\r\n  font-style: normal;\r\n  white-space: nowrap;\r\n}\r\n\r\nlabel[for="juejin-markdown-formatter-import-md-file"]::after {\r\n  content: "";\r\n  z-index: 1;\r\n  transform: translate(2px, -38px);\r\n  width: 0;\r\n  height: 0;\r\n  margin-bottom: -12px;\r\n  overflow: hidden;\r\n  border: 10px solid transparent;\r\n  border-top-color: #333333;\r\n}\r\n\r\nlabel[for="juejin-markdown-formatter-import-md-file"]:hover::before,\r\nlabel[for="juejin-markdown-formatter-import-md-file"]:hover::after {\r\n  visibility: visible;\r\n  opacity: 1;\r\n}\r\n\r\n#juejin-markdown-formatter-import-md-file {\r\n  display: none;\r\n}\r\n';
  const SCRIPT_ID = "juejin-markdown-formatter";
  const STYLE_ID = `${SCRIPT_ID}-style`;
  const FILE_INPUT_ID = `${SCRIPT_ID}-import-md-file`;
  const TOOLBAR_SELECTOR = "#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-toolbar > div.bytemd-toolbar-right";
  const TITLE_INPUT_SELECTOR = "#juejin-web-editor > div.edit-draft > div > header > input";
  const IMPORT_LABEL_TITLE = "导入Markdown文档";
  const createImportIcon = () => {
    const icon = createSvgElement("svg", {
      width: 12,
      height: 12,
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
        d: "M6 24.0083V42H42V24",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }),
      createSvgElement("path", {
        d: "M33 23L24 32L15 23",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      }),
      createSvgElement("path", {
        d: "M23.9917 6V32",
        stroke: "#333",
        "stroke-width": 4,
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      })
    );
    return icon;
  };
  const createFileInput = (onChange) => createElement({
    tagName: "input",
    attributes: {
      id: FILE_INPUT_ID,
      accept: ".md",
      type: "file"
    },
    events: [
      {
        name: "change",
        handler: onChange
      }
    ]
  });
  const createImportLabel = () => createElement({
    tagName: "label",
    className: "bytemd-toolbar-icon",
    attributes: {
      for: FILE_INPUT_ID
    },
    dataset: {
      title: IMPORT_LABEL_TITLE
    },
    children: [createImportIcon()]
  });
  const formatHighlight = (content) => content.replace(/==([\s\S]*?)==/g, "<mark>$1</mark>");
  const formatImages = (content) => content.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (_, description, src) => `<div align="center"><img src="${src}"></div><div align="center" color="gray">${description}</div><br>`
  );
  const formatCenterTags = (content) => content.replace(/<center>([\s\S]*?)<\/center>/g, '<div align="center">$1</div>');
  const formatMarkdown = (content) => formatCenterTags(formatImages(formatHighlight(content)));
  const getArticleTitle = (content) => {
    const heading = content.match(/^#\s.*$/m);
    if (heading) {
      return `${heading[0].slice(2)} `;
    }
    return `${content.substring(0, 10)} `;
  };
  const updateTitleInput = (titleInput, content) => {
    titleInput.value = getArticleTitle(content);
    titleInput.focus();
  };
  const handleImportError = (error) => {
    console.error("导入 Markdown 文档失败：", error);
  };
  const createFileChangeHandler = (titleInput) => async (event) => {
    const [file] = event.target.files ?? [];
    if (!file) {
      return;
    }
    try {
      const rawContent = await readFileAsText(file);
      const content = formatMarkdown(rawContent);
      await copyTextToClipboard(content);
      updateTitleInput(titleInput, content);
      alert("文档处理完毕，删除标题尾部空格，然后在编辑区按下 Ctrl + V 粘贴内容");
    } catch (error) {
      handleImportError(error);
    } finally {
      event.target.value = "";
    }
  };
  const supportsFileImport = () => Boolean(window.FileList && window.File && window.FileReader);
  const injectImportButton = ({ toolbar, titleInput }) => {
    if (document.getElementById(FILE_INPUT_ID)) {
      return;
    }
    toolbar.style.position = "relative";
    toolbar.insertBefore(createFileInput(createFileChangeHandler(titleInput)), toolbar.firstChild);
    toolbar.insertBefore(createImportLabel(), toolbar.firstChild);
  };
  const init = async () => {
    if (!isTopWindow() || !supportsFileImport()) {
      return;
    }
    try {
      const [toolbar, titleInput] = await Promise.all([
        waitForElement(TOOLBAR_SELECTOR),
        waitForElement(TITLE_INPUT_SELECTOR)
      ]);
      addStyle(styles, { id: STYLE_ID });
      injectImportButton({ toolbar, titleInput });
    } catch (error) {
      handleImportError(error);
    }
  };
  init();

})();