// ==UserScript==
// @name         PR三思器
// @namespace    http://tampermonkey.net/
// @version      1.3.0
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

  var _unsafeWindow = /* @__PURE__ */ (() => typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
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
  const styles = ":root {\n  --fd-color-border: #d7d9dc;\n  --fd-color-text: #141e31;\n  --fd-color-white: #ffffff;\n  --fd-color-text-light-solid: #ffffff;\n  --fd-color-primary: #00b899;\n  --fd-color-primary-hover: #4dcdb8;\n}\n\n@keyframes pr-checker-fade-in {\n  from {\n    opacity: 0;\n    transform: scale(0.9);\n  }\n\n  to {\n    opacity: 1;\n    transform: scale(1);\n  }\n}\n\n@keyframes pr-checker-fade-out {\n  from {\n    opacity: 1;\n    transform: scale(1);\n  }\n\n  to {\n    opacity: 0;\n    transform: scale(0.9);\n  }\n}\n\n@keyframes pr-checker-backdrop-fade-in {\n  from {\n    opacity: 0;\n  }\n\n  to {\n    opacity: 1;\n  }\n}\n\n@keyframes pr-checker-backdrop-fade-out {\n  from {\n    opacity: 1;\n  }\n\n  to {\n    opacity: 0;\n  }\n}\n\n.pr-checker-mask::backdrop {\n  background-color: rgba(0, 10, 31, 0.29);\n  animation: pr-checker-backdrop-fade-in 0.3s ease-out;\n}\n\n.pr-checker-mask.closing::backdrop {\n  animation: pr-checker-backdrop-fade-out 0.3s ease-out;\n}\n\n.pr-checker-dialog {\n  width: 500px;\n  padding: 0;\n  font-size: 14px;\n  color: var(--fd-color-text);\n  background: #ffffff;\n  border: none;\n  border-radius: 8px;\n  box-shadow:\n    0 9px 28px 8px #0000000d,\n    0 3px 6px -4px #0000001f,\n    0 6px 16px #00000014;\n  animation: pr-checker-fade-in 0.3s ease-out;\n}\n\n.pr-checker-dialog.closing {\n  animation: pr-checker-fade-out 0.3s ease-out;\n}\n\n.pr-checker-dialog .pr-checker-title {\n  padding: 16px 20px;\n  font-size: 18px;\n  font-weight: 700;\n  line-height: 26px;\n  border-bottom: 1px solid var(--fd-color-border);\n}\n\n.pr-checker-dialog .pr-checker-content {\n  padding: 16px 20px;\n}\n\n#pr-checker-btns {\n  display: flex;\n  gap: 12px;\n  justify-content: flex-end;\n  padding: 12px 20px;\n  margin-top: 14px;\n  border-top: 1px solid var(--fd-color-border);\n}\n\n#pr-checker-btns .pr-checker-btn {\n  padding: 0 16px;\n  line-height: 32px;\n  cursor: pointer;\n  border: 1px solid;\n  border-radius: 4px;\n  outline: none;\n  transition:\n    box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\n    background 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\n    border-color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),\n    color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);\n}\n\n#pr-checker-btns .close-btn {\n  background: var(--fd-color-white);\n  border-color: var(--fd-color-border);\n}\n\n#pr-checker-btns .close-btn:hover {\n  color: var(--fd-color-primary-hover);\n  border-color: var(--fd-color-primary-hover);\n}\n\n#pr-checker-btns .ensure-btn {\n  color: var(--fd-color-text-light-solid);\n  background: var(--fd-color-primary);\n  border-color: var(--fd-color-primary);\n}\n\n#pr-checker-btns .ensure-btn:hover {\n  background: var(--fd-color-primary-hover);\n}\n\n.pr-checker-create-btn {\n  position: relative;\n  display: inline-block;\n  margin-right: 9px;\n  cursor: pointer;\n}\n\n.pr-checker-create-btn:hover #submit-form {\n  --aui-btn-bg: var(--aui-button-primary-hover-bg-color);\n  --aui-btn-text: var(--aui-button-primary-active-text-color);\n}\n\n.pr-checker-mask-btn {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n";
  const STYLE_ID = "pr-checker-style";
  const DIALOG_ID = "bitbucket-pr-checker";
  const DIALOG_BUTTONS_ID = "pr-checker-btns";
  const CHECK_ITEMS_ID = "pr-check-items";
  const CREATE_PR_BUTTON_ID = "submit-form";
  const CREATE_PR_BUTTON_SELECTOR = `#${CREATE_PR_BUTTON_ID}`;
  const CONTINUE_BUTTON_ID = "show-create-pr-button";
  const MASK_BUTTON_CLASS = "pr-checker-mask-btn";
  const CREATE_BUTTON_WRAPPER_CLASS = "pr-checker-create-btn";
  const TARGET_BRANCH_INPUT_ID = "targetBranch-field";
  const CUSTOM_CHECK_ITEMS_STORAGE_PREFIX = "bitbucket.pr.checker";
  const CREATE_BUTTON_WAIT_TIMEOUT = 1e4;
  const CREATE_BUTTON_WAIT_INTERVAL = 200;
  const DIALOG_CLOSE_ANIMATION_DURATION = 300;
  const ILLEGAL_TARGET_BRANCHES = ["master", "main"];
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
  const isTopWindow = () => {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
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
  const initPrCreateChecker = async (storageKey) => {
    try {
      const createPrButton = await waitForElement(CREATE_PR_BUTTON_SELECTOR, {
        timeout: CREATE_BUTTON_WAIT_TIMEOUT,
        interval: CREATE_BUTTON_WAIT_INTERVAL
      });
      const createButtonWrapper = wrapCreatePrButton(createPrButton);
      addMaskButton({ createButtonWrapper, createPrButton, storageKey });
      exposePrCheckerApi(storageKey);
    } catch (error) {
      console.error(error);
    }
  };
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
  const observeTargetBranch = (targetBranchInput) => {
    if (typeof MutationObserver !== "function") {
      return;
    }
    const observer = new MutationObserver(() => {
      const targetBranch = targetBranchInput.value;
      if (targetBranch) {
        triggerTargetBranchWarning(targetBranch);
      }
    });
    observer.observe(targetBranchInput, {
      attributes: true,
      attributeFilter: ["value"]
    });
  };
  const initTargetBranchChecker = () => {
    const targetBranchInput = document.getElementById(TARGET_BRANCH_INPUT_ID);
    if (!targetBranchInput) {
      return;
    }
    triggerTargetBranchWarning(targetBranchInput.value, { immediate: true });
    observeTargetBranch(targetBranchInput);
  };
  const init = () => {
    if (!isTopWindow()) {
      return;
    }
    addStyle(styles, { id: STYLE_ID });
    const storageKey = getCustomCheckItemsStorageKey();
    initTargetBranchChecker();
    initPrCreateChecker(storageKey);
  };
  init();

})();