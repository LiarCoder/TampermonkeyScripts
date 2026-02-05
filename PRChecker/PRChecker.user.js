// ==UserScript==
// @name         PR三思器
// @namespace    http://tampermonkey.net/
// @version      V1.2.3
// @description  创建PR前，提醒一下有没有一些遗漏的东西需要检查
// @author       liaw
// @match        https://code.fineres.com/*/pull-requests?create*
// @icon         https://code.fineres.com/projects/FX/avatar.png?s=64&v=1452596397000
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";
  // 创建元素函数
  const createElement = ({
    parent = document.body,
    tagName = "div",
    text = "",
    attributes = {},
    children = [],
    events = [],
  }) => {
    const element = document.createElement(tagName);
    element.innerText = text;
    Object.keys(attributes).forEach((key) =>
      element.setAttribute(key, attributes[key])
    );
    const childList = typeof children === 'function' ? children(element) : children;
    if (childList && childList.length > 0) {
      childList.forEach(child => {
        element.appendChild(child);
      });
    }
    if (events && events.length > 0) {
      events.forEach(event => {
        if (event.name && event.handler) {
          element.addEventListener(event.name, event.handler);
        }
      });
    }
    if (parent) {
      parent.appendChild(element);
    }
    return element;
  };

  // 创建对话框
  const createDialog = ({
    title = '',
    text4Ok = '',
    text4Cancel = '',
    closeOnClickMask = true,
    content = () => [],
    onOk = () => {},
    onCancel = () => {},
    onDialogExist = () => null,
  }) => {
    const existingDialog = document.getElementById("bitbucket-pr-checker");
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
      GM_addStyle(dialogStyle);
    }

    // 使用文档片段批量创建元素
    const fragment = document.createDocumentFragment();
    const dialog = createElement({
      parent: fragment,
      tagName: "dialog",
      attributes: {
        id: "bitbucket-pr-checker",
        class: "pr-checker-dialog pr-checker-mask"
      },
      children: (dialog) => {
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
            children: [
              // 取消按钮
              createElement({
                tagName: "button",
                text: text4Cancel,
                attributes: {
                  class: "pr-checker-btn close-btn"
                },
                events: [{
                  name: "click",
                  handler: () => {
                    closeDialogWithAnimation(onCancel);
                  }
                }]
              }),
              // 确认按钮
              createElement({
                tagName: "button",
                text: text4Ok,
                attributes: {
                  class: "pr-checker-btn ensure-btn"
                },
                events: [{
                  name: "click",
                  handler: () => {
                    closeDialogWithAnimation(onOk);
                  }
                }]
              })
            ]
          }),
        ]
      }
    });

    // 将片段一次性插入文档
    document.body.appendChild(fragment);
    initDialogStyle();
    
    // 带动画的关闭函数
    const closeDialogWithAnimation = (callback) => {
      dialog.classList.add('closing');
      setTimeout(() => {
        dialog.close();
        dialog.classList.remove('closing');
        callback();
      }, 300); // 动画时长 0.3s
    };
    
    // 实现点击遮罩关闭功能
    if (closeOnClickMask) {
      dialog.addEventListener('click', (e) => {
        // 如果点击的是 dialog 本身（遮罩层），而不是内部的子元素，则关闭 dialog
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
    GM_addStyle(commonStyle);
  }

  /**
   * 在创建PR前进行检查
   */
  const checkPrBeforeCreate = () => {
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
    GM_addStyle(prCheckerStyle);

    // 最大寻找次数，脚本加载后，即在页面中寻找创建按钮，查找次数超过50次后即认为当前页面没有创建按钮
    const MAX_FIND_COUNT = 50;
    const USERNAME =
      document.querySelector("[data-username]")?.dataset.username || "";
    // 自定义check项的本地缓存
    const CUSTOM_CHECK_ITEMS_KEY = `bitbucket.pr.checker.${USERNAME}`;

    /**
     * 初始化PR检查器
     * 脚本支持在浏览器控制台，通过 window.PrChecker.add('xxx') 的方式添加自定义check项
     * 也支持通过 window.PrChecker.clear() 的方式清除所有自定义check项
     */
    const initPrChecker = () => {
      const addCustomCheckItems = (...checkItems) => {
        const cachedItems =
          JSON.parse(window.localStorage.getItem(CUSTOM_CHECK_ITEMS_KEY)) || [];
        const uniqItems = [...new Set(checkItems.map((item) => item.toString()))];
        const customCheckItems = [...new Set([...cachedItems, ...uniqItems])];
        window.localStorage.setItem(
          CUSTOM_CHECK_ITEMS_KEY,
          JSON.stringify(customCheckItems)
        );
      };
      const clearCustomCheckItems = () => {
        window.localStorage.removeItem(CUSTOM_CHECK_ITEMS_KEY);
      };
      /**
       * 注意这里必须用 unsafeWindow，否则无法在浏览器控制台访问 PrChecker
       * @see https://www.tampermonkey.net/documentation.php#api:unsafeWindow
       * @see https://bbs.tampermonkey.net.cn/thread-249-1-1.html#%E7%BB%99%E8%AE%BA%E5%9D%9B%E6%B7%BB%E5%8A%A0%E9%BB%91%E5%A4%9C%E6%A8%A1%E5%BC%8F
       */
      unsafeWindow.PrChecker = {};
      unsafeWindow.PrChecker.add = addCustomCheckItems;
      unsafeWindow.PrChecker.clear = clearCustomCheckItems;
    };

    // 获取检查项
    const getCheckItems = () => {
      const customCheckItems =
        JSON.parse(
          window.localStorage.getItem(`bitbucket.pr.checker.${USERNAME}`)
        ) || [];
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

    // 创建检查项列表
    const createCheckItems = (parent) => {
      const fragment = document.createDocumentFragment();
      getCheckItems().forEach((item) => {
        createElement({ parent: fragment, tagName: "li", text: item });
      });
      parent.innerHTML = "";
      parent.appendChild(fragment);
    };

    // 轮询查找创建PR按钮
    const findCreatePrBtn = () => {
      let findCount = 0;
      return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
          const createPrBtn = document.getElementById("submit-form");
          if (createPrBtn) {
            clearInterval(interval);
            // 因为创建PR的按钮是一个input标签，无法插入子元素，所以需要一个包装元素
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
          attributes: { class: "pr-checker-mask-btn"},
          events: [{
            name: "click",
            handler: (e) => {
              e.stopPropagation();
              const dialog = createDialog({
                closeOnClickMask: false,
                title: "创建PR前请检查以下几项！",
                text4Ok: "确认创建",
                text4Cancel: "还需调整",
                content: (dialog) => {
                  // 创建检查项列表
                  const checkItemsWrapper = createElement({
                    parent: dialog,
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
            }
          }]
        });
      })
      .catch((err) => console.error(err));
  };

  initCommonStyle();
  checkPrBeforeCreate();
})();
