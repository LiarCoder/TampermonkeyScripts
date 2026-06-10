// ==UserScript==
// @name         PR三思器
// @namespace    http://tampermonkey.net/
// @version      1.3.1
// @author       liaw
// @description  创建PR前，提醒一下有没有一些遗漏的东西需要检查
// @license      MIT
// @icon         https://code.fineres.com/projects/FX/avatar.png?s=64&v=1452596397000
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/pr-checker/dist/pr-checker.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/pr-checker/dist/pr-checker.user.js
// @match        https://code.fineres.com/*/pull-requests?create*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const compact = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }
    return items.filter(Boolean);
  };
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
  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
  const DIALOG_ID = "bitbucket-pr-checker";
  const DIALOG_BUTTONS_ID = "pr-checker-btns";
  const CHECK_ITEMS_ID = "pr-check-items";
  const CREATE_PR_BUTTON_ID = "submit-form";
  const CREATE_PR_BUTTON_SELECTOR = `#${CREATE_PR_BUTTON_ID}`;
  const MASK_BUTTON_CLASS = "pr-checker-mask-btn";
  const CREATE_BUTTON_WRAPPER_CLASS = "pr-checker-create-btn";
  const CUSTOM_CHECK_ITEMS_STORAGE_PREFIX = "bitbucket.pr.checker";
  const CREATE_BUTTON_WAIT_TIMEOUT = 1e4;
  const CREATE_BUTTON_WAIT_INTERVAL = 200;
  const DIALOG_CLOSE_ANIMATION_DURATION = 300;
  const DEFAULT_CHECK_ITEMS = [
    "copy的代码检查了吗？",
    "移动端漏了吗？",
    "CRM漏了吗？",
    "KMS漏了吗？",
    "任务号有没有关联错？",
    "目标分支提对了吗？",
    "国际化有没有处理好？"
  ];
  const noop = () => {
  };
  const getMountTarget = () => document.body ?? document.documentElement;
  const getUsername = () => {
    var _a;
    return ((_a = document.querySelector("[data-username]")) == null ? void 0 : _a.dataset.username) ?? "";
  };
  const getCustomCheckItemsStorageKey = () => `${CUSTOM_CHECK_ITEMS_STORAGE_PREFIX}.${getUsername()}`;
  const safeParseArray = (rawValue) => {
    if (!rawValue) {
      return [];
    }
    try {
      const parsedValue = JSON.parse(rawValue);
      return Array.isArray(parsedValue) ? parsedValue : [];
    } catch {
      return [];
    }
  };
  const getCustomCheckItems = (storageKey) => safeParseArray(window.localStorage.getItem(storageKey)).map((item) => String(item));
  const setCustomCheckItems = (storageKey, checkItems) => {
    window.localStorage.setItem(storageKey, JSON.stringify(checkItems));
  };
  const getCheckItems = (storageKey) => [...DEFAULT_CHECK_ITEMS, ...getCustomCheckItems(storageKey)];
  const addCustomCheckItems = (storageKey, ...checkItems) => {
    const normalizedItems = checkItems.map((item) => String(item));
    const customCheckItems = [.../* @__PURE__ */ new Set([...getCustomCheckItems(storageKey), ...normalizedItems])];
    setCustomCheckItems(storageKey, customCheckItems);
  };
  const clearCustomCheckItems = (storageKey) => {
    window.localStorage.removeItem(storageKey);
  };
  const exposePrCheckerApi = (storageKey) => {
    const consoleWindow = _unsafeWindow ?? window;
    consoleWindow.PrChecker = {
      add: (...checkItems) => addCustomCheckItems(storageKey, ...checkItems),
      clear: () => clearCustomCheckItems(storageKey)
    };
  };
  const closeDialogWithAnimation = (dialog, callback = noop) => {
    dialog.classList.add("closing");
    window.setTimeout(() => {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
      dialog.classList.remove("closing");
      callback();
    }, DIALOG_CLOSE_ANIMATION_DURATION);
  };
  const createDialogButton = ({ className, text, onClick }) => createElement({
    tagName: "button",
    text,
    attributes: {
      class: `pr-checker-btn ${className}`,
      type: "button"
    },
    events: [
      {
        name: "click",
        handler: () => onClick()
      }
    ]
  });
  const createDialog = ({
    id = "pr-checker-dialog",
    title = "",
    text4Ok = "确认",
    text4Cancel = "取消",
    closeOnClickMask = false,
    content = () => [],
    onOk = noop,
    onCancel = noop,
    onDialogExist = noop
  }) => {
    const existingDialog = document.getElementById(id);
    if (existingDialog) {
      onDialogExist(existingDialog);
      return existingDialog;
    }
    const fragment = document.createDocumentFragment();
    const dialog = createElement({
      parent: fragment,
      tagName: "dialog",
      attributes: {
        id,
        class: "pr-checker-dialog pr-checker-mask"
      },
      children: () => [
        createElement({
          text: title,
          attributes: { class: "pr-checker-title" }
        }),
        createElement({
          attributes: { class: "pr-checker-content" },
          children: (element) => content(element)
        }),
        createElement({
          attributes: { id: DIALOG_BUTTONS_ID },
          children: compact([
            text4Cancel && createDialogButton({
              className: "close-btn",
              text: text4Cancel,
              onClick: () => closeDialogWithAnimation(dialog, onCancel)
            }),
            text4Ok && createDialogButton({
              className: "ensure-btn",
              text: text4Ok,
              onClick: () => closeDialogWithAnimation(dialog, onOk)
            })
          ])
        })
      ]
    });
    const mountTarget = getMountTarget();
    if (mountTarget) {
      mountTarget.appendChild(fragment);
    }
    if (closeOnClickMask) {
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) {
          closeDialogWithAnimation(dialog, onCancel);
        }
      });
    }
    return dialog;
  };
  const showDialog = (dialog) => {
    if (dialog.open) {
      return;
    }
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      return;
    }
    dialog.setAttribute("open", "");
  };
  const renderCheckItems = (parent, storageKey) => {
    if (!parent) {
      return;
    }
    const fragment = document.createDocumentFragment();
    getCheckItems(storageKey).forEach((item) => {
      createElement({ parent: fragment, tagName: "li", text: item });
    });
    parent.innerHTML = "";
    parent.appendChild(fragment);
  };
  const createCheckItemsContent = (parent, storageKey) => {
    const checkItemsWrapper = createElement({
      parent,
      tagName: "ol",
      attributes: { id: CHECK_ITEMS_ID }
    });
    renderCheckItems(checkItemsWrapper, storageKey);
    return [checkItemsWrapper];
  };
  const wrapCreatePrButton = (createPrButton) => {
    var _a;
    const parent = createPrButton.parentNode;
    if (!parent) {
      return null;
    }
    if ((_a = parent.classList) == null ? void 0 : _a.contains(CREATE_BUTTON_WRAPPER_CLASS)) {
      return parent;
    }
    const createButtonWrapper = createElement({
      attributes: {
        class: CREATE_BUTTON_WRAPPER_CLASS
      }
    });
    parent.insertBefore(createButtonWrapper, createPrButton);
    createButtonWrapper.appendChild(createPrButton);
    return createButtonWrapper;
  };
  const openCheckDialog = ({ createPrButton, storageKey }) => {
    const dialog = createDialog({
      id: DIALOG_ID,
      closeOnClickMask: false,
      title: "创建PR前请检查以下几项！",
      text4Ok: "确认创建",
      text4Cancel: "还需调整",
      content: (dialogContent) => createCheckItemsContent(dialogContent, storageKey),
      onOk: () => {
        createPrButton.click();
      },
      onDialogExist: (existingDialog) => {
        renderCheckItems(existingDialog.querySelector(`#${CHECK_ITEMS_ID}`), storageKey);
      }
    });
    showDialog(dialog);
  };
  const addMaskButton = ({ createButtonWrapper, createPrButton, storageKey }) => {
    if (!createButtonWrapper || createButtonWrapper.querySelector(`.${MASK_BUTTON_CLASS}`)) {
      return;
    }
    createElement({
      parent: createButtonWrapper,
      attributes: { class: MASK_BUTTON_CLASS },
      events: [
        {
          name: "click",
          handler: (event) => {
            event.stopPropagation();
            openCheckDialog({ createPrButton, storageKey });
          }
        }
      ]
    });
  };
  const initCreatePrChecker = async () => {
    try {
      const createPrButton = await waitForElement(CREATE_PR_BUTTON_SELECTOR, {
        timeout: CREATE_BUTTON_WAIT_TIMEOUT,
        interval: CREATE_BUTTON_WAIT_INTERVAL
      });
      const storageKey = getCustomCheckItemsStorageKey();
      const createButtonWrapper = wrapCreatePrButton(createPrButton);
      addMaskButton({ createButtonWrapper, createPrButton, storageKey });
      exposePrCheckerApi(storageKey);
    } catch (error) {
      console.error(error);
    }
  };
  const styles = ":root {\r\n  --fd-color-border: #d7d9dc;\r\n  --fd-color-text: #141e31;\r\n  --fd-color-white: #ffffff;\r\n  --fd-color-text-light-solid: #ffffff;\r\n  --fd-color-primary: #00b899;\r\n  --fd-color-primary-hover: #4dcdb8;\r\n}\r\n\r\n@keyframes pr-checker-fade-in {\r\n  from {\r\n    opacity: 0;\r\n    transform: scale(0.9);\r\n  }\r\n\r\n  to {\r\n    opacity: 1;\r\n    transform: scale(1);\r\n  }\r\n}\r\n\r\n@keyframes pr-checker-fade-out {\r\n  from {\r\n    opacity: 1;\r\n    transform: scale(1);\r\n  }\r\n\r\n  to {\r\n    opacity: 0;\r\n    transform: scale(0.9);\r\n  }\r\n}\r\n\r\n@keyframes pr-checker-backdrop-fade-in {\r\n  from {\r\n    opacity: 0;\r\n  }\r\n\r\n  to {\r\n    opacity: 1;\r\n  }\r\n}\r\n\r\n@keyframes pr-checker-backdrop-fade-out {\r\n  from {\r\n    opacity: 1;\r\n  }\r\n\r\n  to {\r\n    opacity: 0;\r\n  }\r\n}\r\n\r\n.pr-checker-mask::backdrop {\r\n  background-color: rgba(0, 10, 31, 0.29);\r\n  animation: pr-checker-backdrop-fade-in 0.3s ease-out;\r\n}\r\n\r\n.pr-checker-mask.closing::backdrop {\r\n  animation: pr-checker-backdrop-fade-out 0.3s ease-out;\r\n}\r\n\r\n.pr-checker-dialog {\r\n  width: 500px;\r\n  padding: 0;\r\n  font-size: 14px;\r\n  color: var(--fd-color-text);\r\n  background: #ffffff;\r\n  border: none;\r\n  border-radius: 8px;\r\n  box-shadow:\r\n    0 9px 28px 8px #0000000d,\r\n    0 3px 6px -4px #0000001f,\r\n    0 6px 16px #00000014;\r\n  animation: pr-checker-fade-in 0.3s ease-out;\r\n}\r\n\r\n.pr-checker-dialog.closing {\r\n  animation: pr-checker-fade-out 0.3s ease-out;\r\n}\r\n\r\n.pr-checker-dialog .pr-checker-title {\r\n  padding: 16px 20px;\r\n  font-size: 18px;\r\n  font-weight: 700;\r\n  line-height: 26px;\r\n  border-bottom: 1px solid var(--fd-color-border);\r\n}\r\n\r\n.pr-checker-dialog .pr-checker-content {\r\n  padding: 16px 20px;\r\n}\r\n\r\n#pr-checker-btns {\r\n  display: flex;\r\n  gap: 12px;\r\n  justify-content: flex-end;\r\n  padding: 12px 20px;\r\n  margin-top: 14px;\r\n  border-top: 1px solid var(--fd-color-border);\r\n}\r\n\r\n#pr-checker-btns .pr-checker-btn {\r\n  padding: 0 16px;\r\n  line-height: 32px;\r\n  cursor: pointer;\r\n  border: 1px solid;\r\n  border-radius: 4px;\r\n  outline: none;\r\n  transition:\r\n    box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\r\n    background 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\r\n    border-color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\r\n    color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);\r\n}\r\n\r\n#pr-checker-btns .close-btn {\r\n  background: var(--fd-color-white);\r\n  border-color: var(--fd-color-border);\r\n}\r\n\r\n#pr-checker-btns .close-btn:hover {\r\n  color: var(--fd-color-primary-hover);\r\n  border-color: var(--fd-color-primary-hover);\r\n}\r\n\r\n#pr-checker-btns .ensure-btn {\r\n  color: var(--fd-color-text-light-solid);\r\n  background: var(--fd-color-primary);\r\n  border-color: var(--fd-color-primary);\r\n}\r\n\r\n#pr-checker-btns .ensure-btn:hover {\r\n  background: var(--fd-color-primary-hover);\r\n}\r\n\r\n.pr-checker-create-btn {\r\n  position: relative;\r\n  display: inline-block;\r\n  margin-right: 9px;\r\n  cursor: pointer;\r\n}\r\n\r\n.pr-checker-create-btn:hover #submit-form {\r\n  --aui-btn-bg: var(--aui-button-primary-hover-bg-color);\r\n  --aui-btn-text: var(--aui-button-primary-active-text-color);\r\n}\r\n\r\n.pr-checker-mask-btn {\r\n  position: absolute;\r\n  top: 0;\r\n  left: 0;\r\n  width: 100%;\r\n  height: 100%;\r\n}\r\n";
  const CONTINUE_BUTTON_ID = "show-create-pr-button";
  const TARGET_BRANCH_INPUT_ID = "targetBranch-field";
  const SOURCE_BRANCH_INPUT_ID = "sourceBranch-field";
  const ILLEGAL_TARGET_BRANCHES = ["master", "main"];
  const isIllegalTargetBranch = (targetBranch) => ILLEGAL_TARGET_BRANCHES.some((illegalTargetBranch) => targetBranch.includes(illegalTargetBranch));
  const showTargetBranchWarning = (targetBranch) => {
    const createPrButton = document.getElementById(CONTINUE_BUTTON_ID);
    if (!createPrButton || !isIllegalTargetBranch(targetBranch)) {
      return;
    }
    const warningTip = `目标分支不能为 ${targetBranch}`;
    const warningWrapper = document.querySelector(".pr-create-warning");
    const warningText = document.querySelector(".pr-create-warning-text");
    createPrButton.setAttribute("disabled", "");
    createPrButton.setAttribute("title", warningTip);
    warningWrapper == null ? void 0 : warningWrapper.classList.remove("hidden");
    if (warningText) {
      warningText.innerText = warningTip;
    }
  };
  const triggerTargetBranchWarning = (targetBranch, { immediate = false } = {}) => {
    window.setTimeout(
      () => {
        showTargetBranchWarning(targetBranch);
      },
      immediate ? 0 : 300
    );
  };
  const getTargetBranch = () => {
    var _a;
    return ((_a = document.getElementById(TARGET_BRANCH_INPUT_ID)) == null ? void 0 : _a.value) ?? "";
  };
  const triggerCurrentTargetBranchWarning = ({ immediate = false } = {}) => {
    const targetBranch = getTargetBranch();
    if (targetBranch) {
      triggerTargetBranchWarning(targetBranch, { immediate });
    }
  };
  const observeInputValueChange = (input, onChange) => {
    if (typeof MutationObserver !== "function") {
      return;
    }
    const observer = new MutationObserver(() => {
      onChange(input.value);
    });
    observer.observe(input, {
      attributes: true,
      attributeFilter: ["value"]
    });
  };
  const initTargetBranchChecker = () => {
    const targetBranchInput = document.getElementById(TARGET_BRANCH_INPUT_ID);
    const sourceBranchInput = document.getElementById(SOURCE_BRANCH_INPUT_ID);
    if (!targetBranchInput) {
      return;
    }
    triggerCurrentTargetBranchWarning({ immediate: true });
    observeInputValueChange(targetBranchInput, (targetBranch) => {
      if (targetBranch) {
        triggerTargetBranchWarning(targetBranch);
      }
    });
    if (sourceBranchInput) {
      observeInputValueChange(sourceBranchInput, () => {
        triggerCurrentTargetBranchWarning();
      });
    }
  };
  const STYLE_ID = "pr-checker-style";
  const init = () => {
    if (!isTopWindow()) {
      return;
    }
    addStyle(styles, { id: STYLE_ID });
    initTargetBranchChecker();
    initCreatePrChecker();
  };
  init();

})();