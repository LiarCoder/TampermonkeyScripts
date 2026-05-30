// ==UserScript==
// @name         PR三思器
// @namespace    http://tampermonkey.net/
// @version      V1.3.0
// @author       liaw
// @description  创建PR前，提醒一下有没有一些遗漏的东西需要检查
// @license      MIT
// @icon         https://code.fineres.com/projects/FX/avatar.png?s=64&v=1452596397000
// @match        https://code.fineres.com/*/pull-requests?create*
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  var _GM_addStyle = /* @__PURE__ */ (() =>
    typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  var _unsafeWindow = /* @__PURE__ */ (() =>
    typeof unsafeWindow != "undefined" ? unsafeWindow : void 0)();
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
  const createDialog = ({
    id = "pr-checker-dialog",
    title = "",
    text4Ok = "确认",
    text4Cancel = "取消",
    closeOnClickMask = false,
    content = () => [],
    onOk = () => {},
    onCancel = () => {},
    onDialogExist = () => null,
  }) => {
    const existingDialog = document.getElementById(id);
    if (existingDialog) {
      onDialogExist(existingDialog);
      return existingDialog;
    }
    const initDialogStyle = () => {
      const dialogStyle = `
      @keyframes pr-checker-fade-in {
        from {
          opacity: 0;
          transform: scale(0.9);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }

      @keyframes pr-checker-fade-out {
        from {
          opacity: 1;
          transform: scale(1);
        }
        to {
          opacity: 0;
          transform: scale(0.9);
        }
      }

      @keyframes pr-checker-backdrop-fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes pr-checker-backdrop-fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }

      .pr-checker-mask::backdrop {
        background-color: rgba(0, 10, 31, 0.29);
        animation: pr-checker-backdrop-fade-in 0.3s ease-out;
      }

      .pr-checker-mask.closing::backdrop {
        animation: pr-checker-backdrop-fade-out 0.3s ease-out;
      }
  
      .pr-checker-dialog {
        font-size: 14px;
        color: var(--fd-color-text);
        border: none;
        border-radius: 8px;
        background: #ffffff;
        width: 500px;
        padding: 0;
        box-shadow: 0 9px 28px 8px #0000000d, 0 3px 6px -4px #0000001f,
          0 6px 16px #00000014;
        animation: pr-checker-fade-in 0.3s ease-out;
      }

      .pr-checker-dialog.closing {
        animation: pr-checker-fade-out 0.3s ease-out;
      }
  
      .pr-checker-dialog .pr-checker-title {
        border-bottom: 1px solid var(--fd-color-border);
        padding: 16px 20px;
        font-size: 18px;
        line-height: 26px;
        font-weight: 700;
      }

      .pr-checker-dialog .pr-checker-content {
        padding: 16px 20px;
      }

      #pr-checker-btns {
        margin-top: 14px;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 12px 20px;
        border-top: 1px solid var(--fd-color-border);
      }

      #pr-checker-btns .pr-checker-btn {
        border: 1px solid;
        border-radius: 4px;
        line-height: 32px;
        padding: 0px 16px;
        outline: none;
        cursor: pointer;
        transition: box-shadow 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
          background 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
          border-color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1),
          color 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
      }

      #pr-checker-btns .close-btn {
        background: var(--fd-color-white);
        border-color: var(--fd-color-border);
      }

      #pr-checker-btns .close-btn:hover {
        color: var(--fd-color-primary-hover);
        border-color: var(--fd-color-primary-hover);
      }

      #pr-checker-btns .ensure-btn {
        color: var(--fd-color-text-light-solid);
        background: var(--fd-color-primary);
        border-color: var(--fd-color-primary);
      }

      #pr-checker-btns .ensure-btn:hover {
        background: var(--fd-color-primary-hover);
      }
    `;
      _GM_addStyle(dialogStyle);
    };
    const fragment = document.createDocumentFragment();
    const dialog = createElement({
      parent: fragment,
      tagName: "dialog",
      attributes: {
        id,
        class: "pr-checker-dialog pr-checker-mask",
      },
      children: () => {
        return [
          // 创建标题
          createElement({
            text: title,
            attributes: { class: "pr-checker-title" },
          }),
          // 创建内容
          createElement({
            attributes: { class: "pr-checker-content" },
            children: (element) => content(element),
          }),
          // 创建按钮组
          createElement({
            attributes: { id: "pr-checker-btns" },
            children: compact([
              // 取消按钮
              text4Cancel &&
                createElement({
                  tagName: "button",
                  text: text4Cancel,
                  attributes: {
                    class: "pr-checker-btn close-btn",
                  },
                  events: [
                    {
                      name: "click",
                      handler: () => {
                        closeDialogWithAnimation(onCancel);
                      },
                    },
                  ],
                }),
              // 确认按钮
              text4Ok &&
                createElement({
                  tagName: "button",
                  text: text4Ok,
                  attributes: {
                    class: "pr-checker-btn ensure-btn",
                  },
                  events: [
                    {
                      name: "click",
                      handler: () => {
                        closeDialogWithAnimation(onOk);
                      },
                    },
                  ],
                }),
            ]),
          }),
        ];
      },
    });
    document.body.appendChild(fragment);
    initDialogStyle();
    const closeDialogWithAnimation = (callback) => {
      dialog.classList.add("closing");
      setTimeout(() => {
        dialog.close();
        dialog.classList.remove("closing");
        callback();
      }, 300);
    };
    if (closeOnClickMask) {
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
          closeDialogWithAnimation(onCancel);
        }
      });
    }
    return dialog;
  };
  const initCommonStyle = () => {
    const commonStyle = `
    :root {
      --fd-color-border: #d7d9dc;
      --fd-color-text: #141e31;
      --fd-color-white: #ffffff;
      --fd-color-text-light-solid: #ffffff;
      --fd-color-primary: #00b899;
      --fd-color-primary-hover: #4dcdb8;
    }
  `;
    _GM_addStyle(commonStyle);
  };
  const checkPrBeforeCreate = () => {
    var _a;
    const prCheckerStyle = `
    .pr-checker-create-btn {
      position: relative;
      display: inline-block;
      cursor: pointer;
      margin-right: 9px;
    }

    .pr-checker-create-btn:hover #submit-form {
      --aui-btn-bg: var(--aui-button-primary-hover-bg-color);
      --aui-btn-text: var(--aui-button-primary-active-text-color);
    }

    .pr-checker-mask-btn {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
    `;
    _GM_addStyle(prCheckerStyle);
    const MAX_FIND_COUNT = 50;
    const USERNAME =
      ((_a = document.querySelector("[data-username]")) == null ? void 0 : _a.dataset.username) ||
      "";
    const CUSTOM_CHECK_ITEMS_KEY = `bitbucket.pr.checker.${USERNAME}`;
    const initPrChecker = () => {
      const addCustomCheckItems = (...checkItems) => {
        const cachedItems = JSON.parse(window.localStorage.getItem(CUSTOM_CHECK_ITEMS_KEY)) || [];
        const uniqItems = [...new Set(checkItems.map((item) => item.toString()))];
        const customCheckItems = [.../* @__PURE__ */ new Set([...cachedItems, ...uniqItems])];
        window.localStorage.setItem(CUSTOM_CHECK_ITEMS_KEY, JSON.stringify(customCheckItems));
      };
      const clearCustomCheckItems = () => {
        window.localStorage.removeItem(CUSTOM_CHECK_ITEMS_KEY);
      };
      _unsafeWindow.PrChecker = {};
      _unsafeWindow.PrChecker.add = addCustomCheckItems;
      _unsafeWindow.PrChecker.clear = clearCustomCheckItems;
    };
    const getCheckItems = () => {
      const customCheckItems =
        JSON.parse(window.localStorage.getItem(`bitbucket.pr.checker.${USERNAME}`)) || [];
      return [
        "copy的代码检查了吗？",
        "移动端漏了吗？",
        "CRM漏了吗？",
        "KMS漏了吗？",
        "任务号有没有关联错？",
        "目标分支提对了吗？",
        "国际化有没有处理好？",
        ...customCheckItems,
      ];
    };
    const createCheckItems = (parent) => {
      const fragment = document.createDocumentFragment();
      getCheckItems().forEach((item) => {
        createElement({ parent: fragment, tagName: "li", text: item });
      });
      parent.innerHTML = "";
      parent.appendChild(fragment);
    };
    const findCreatePrBtn = () => {
      let findCount = 0;
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const createPrBtn = document.getElementById("submit-form");
          if (createPrBtn) {
            clearInterval(interval);
            const createBtnWrapper = createElement({
              parent: null,
              attributes: {
                class: "pr-checker-create-btn",
              },
            });
            createPrBtn.parentNode.insertBefore(createBtnWrapper, createPrBtn);
            createPrBtn.parentNode.removeChild(createPrBtn);
            createBtnWrapper.appendChild(createPrBtn);
            resolve({ createBtnWrapper, createPrBtn });
          } else if (findCount > MAX_FIND_COUNT) {
            clearInterval(interval);
            reject(new Error("Create PR button doesn't exist"));
          }
          findCount++;
        }, 200);
      });
    };
    findCreatePrBtn()
      .then(({ createBtnWrapper, createPrBtn }) => {
        initPrChecker();
        createElement({
          parent: createBtnWrapper,
          attributes: { class: "pr-checker-mask-btn" },
          events: [
            {
              name: "click",
              handler: (e) => {
                e.stopPropagation();
                const dialog = createDialog({
                  id: "bitbucket-pr-checker",
                  closeOnClickMask: false,
                  title: "创建PR前请检查以下几项！",
                  text4Ok: "确认创建",
                  text4Cancel: "还需调整",
                  content: (dialog2) => {
                    const checkItemsWrapper = createElement({
                      parent: dialog2,
                      tagName: "ol",
                      attributes: { id: "pr-check-items" },
                    });
                    createCheckItems(checkItemsWrapper);
                    return [checkItemsWrapper];
                  },
                  onOk: () => {
                    createPrBtn.click();
                  },
                  onDialogExist: (existingDialog) => {
                    return createCheckItems(existingDialog.querySelector("#pr-check-items"));
                  },
                });
                dialog.showModal();
              },
            },
          ],
        });
      })
      .catch((err) => console.error(err));
  };
  const checkTargetBranch = () => {
    const targetBranchInput = document.getElementById("targetBranch-field");
    if (!targetBranchInput) {
      return;
    }
    const ILLEGAL_TARGET_BRANCH = ["master", "main"];
    const triggerTargetBranchWarning = (targetBranch, isImmediate = false) => {
      const createPrBtn = document.getElementById("show-create-pr-button");
      if (!createPrBtn) {
        return;
      }
      const warningWrapper = document.querySelector(".pr-create-warning");
      const warningText = document.querySelector(".pr-create-warning-text");
      const isCurrentTargetBranchIllegal = ILLEGAL_TARGET_BRANCH.some((illegalTargetBranch) =>
        targetBranch.includes(illegalTargetBranch)
      );
      setTimeout(
        () => {
          if (isCurrentTargetBranchIllegal) {
            const warningTip = `目标分支不能为 ${targetBranch}`;
            createPrBtn.setAttribute("disabled", "");
            createPrBtn.setAttribute("title", warningTip);
            if (warningWrapper) {
              warningWrapper.classList.remove("hidden");
            }
            if (warningText) {
              warningText.innerText = warningTip;
            }
          }
        },
        isImmediate ? 0 : 300
      );
    };
    triggerTargetBranchWarning(targetBranchInput.value, true);
    const observer = new MutationObserver(() => {
      const targetBranch = targetBranchInput.value;
      if (targetBranch) {
        triggerTargetBranchWarning(targetBranch);
      }
    });
    observer.observe(targetBranchInput, {
      attributes: true,
      attributeFilter: ["value"],
    });
  };
  initCommonStyle();
  checkTargetBranch();
  checkPrBeforeCreate();
})();
