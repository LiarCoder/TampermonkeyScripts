// ==UserScript==
// @name         PR三思器
// @namespace    http://tampermonkey.net/
// @version      2024-06-14
// @description  创建PR前，提醒一下有没有一些遗漏的东西需要检查
// @author       liaw
// @match        https://code.fineres.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=fineres.com
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @grant        unsafeWindow
// @run-at       document-end
// @resource pr-checker-css https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/PRChecker/PRChecker.user.css
// ==/UserScript==

(function () {
  "use strict";
  GM_addStyle(GM_getResourceText("pr-checker-css"));

  const MAX_FIND_COUNT = 50;
  const USERNAME =
    document.querySelector("[data-username]")?.dataset.username || "";
  const CUSTOM_CHECK_ITEMS_KEY = `bitbucket.pr.checker.${USERNAME}`;

  // 创建元素函数
  const createElement = ({
    parent = document.body,
    tagName = "div",
    text = "",
    attributes = {},
  }) => {
    const element = document.createElement(tagName);
    element.innerText = text;
    Object.keys(attributes).forEach((key) =>
      element.setAttribute(key, attributes[key])
    );
    if (parent) {
      parent.appendChild(element);
    }
    return element;
  };

  // 初始化PR检查器
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
    parent.innerHTML = "";
    getCheckItems().forEach((item) => {
      createElement({ parent, tagName: "li", text: item });
    });
  };

  // 创建对话框
  const createDialog = (createPrBtn) => {
    const existingDialog = document.getElementById("bitbucket-pr-checker");
    if (existingDialog) {
      createCheckItems(existingDialog.querySelector("#pr-check-items"));
      return existingDialog;
    }
    const dialog = createElement({
      tagName: "dialog",
      attributes: { id: "bitbucket-pr-checker" },
    });
    createElement({
      parent: dialog,
      text: "创建PR前请检查以下几项！",
      attributes: { class: "pr-checker-title" },
    });
    const checkItemsWrapper = createElement({
      parent: dialog,
      tagName: "ol",
      attributes: { id: "pr-check-items" },
    });
    createCheckItems(checkItemsWrapper);
    const btnWrapper = createElement({
      parent: dialog,
      attributes: { id: "pr-checker-btns" },
    });
    const closeBtn = createElement({
      parent: btnWrapper,
      tagName: "button",
      text: "还需调整",
      attributes: { class: "operate-btn pr-checker-close-btn" },
    });
    closeBtn.onclick = () => dialog.close();
    const ensureBtn = createElement({
      parent: btnWrapper,
      tagName: "button",
      text: "确认创建",
      attributes: { class: "operate-btn pr-checker-ensure-btn" },
    });
    ensureBtn.onclick = () => {
      dialog.close();
      createPrBtn.click();
    };
    return dialog;
  };

  // 轮询查找创建PR按钮
  const findCreatePrBtn = () => {
    let findCount = 0;
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        const createPrBtn = document.getElementById("cancel-button");
        if (createPrBtn) {
          clearInterval(interval);
          resolve(createPrBtn);
        } else if (findCount > MAX_FIND_COUNT) {
          clearInterval(interval);
          reject(new Error("Create PR button doesn't exist"));
        }
        findCount++;
      }, 200);
    });
  };

  findCreatePrBtn()
    .then((createPrBtn) => {
      initPrChecker();
      createPrBtn.style.position = "relative";
      const maskBtn = createElement({
        parent: createPrBtn,
        attributes: { class: "pr-checker-mask-btn" },
      });
      maskBtn.onclick = (e) => {
        e.stopPropagation();
        const dialog = createDialog(createPrBtn);
        dialog.showModal();
      };
    })
    .catch((err) => console.error(err));
})();
