import { unsafeWindow } from "$";
import {
  compact,
  createElement,
  getDocumentMountTarget,
  safeParseArray,
  waitForElement,
} from "@tampermonkey-scripts/shared";

const DIALOG_ID = "bitbucket-pr-checker";
const DIALOG_BUTTONS_ID = "pr-checker-btns";
const CHECK_ITEMS_ID = "pr-check-items";
const CREATE_PR_BUTTON_ID = "submit-form";
const CREATE_PR_BUTTON_SELECTOR = `#${CREATE_PR_BUTTON_ID}`;
const MASK_BUTTON_CLASS = "pr-checker-mask-btn";
const CREATE_BUTTON_WRAPPER_CLASS = "pr-checker-create-btn";
const CUSTOM_CHECK_ITEMS_STORAGE_PREFIX = "bitbucket.pr.checker";
const CREATE_BUTTON_WAIT_TIMEOUT = 10_000;
const CREATE_BUTTON_WAIT_INTERVAL = 200;
const DIALOG_CLOSE_ANIMATION_DURATION = 300;
const DEFAULT_CHECK_ITEMS = [
  "copy的代码检查了吗？",
  "移动端漏了吗？",
  "CRM漏了吗？",
  "KMS漏了吗？",
  "任务号有没有关联错？",
  "目标分支提对了吗？",
  "国际化有没有处理好？",
];

const noop = () => {};

const getUsername = () => document.querySelector("[data-username]")?.dataset.username ?? "";

const getCustomCheckItemsStorageKey = () => `${CUSTOM_CHECK_ITEMS_STORAGE_PREFIX}.${getUsername()}`;

const getCustomCheckItems = (storageKey) =>
  safeParseArray(window.localStorage.getItem(storageKey)).map((item) => String(item));

const setCustomCheckItems = (storageKey, checkItems) => {
  window.localStorage.setItem(storageKey, JSON.stringify(checkItems));
};

const getCheckItems = (storageKey) => [...DEFAULT_CHECK_ITEMS, ...getCustomCheckItems(storageKey)];

const addCustomCheckItems = (storageKey, ...checkItems) => {
  const normalizedItems = checkItems.map((item) => String(item));
  const customCheckItems = [...new Set([...getCustomCheckItems(storageKey), ...normalizedItems])];
  setCustomCheckItems(storageKey, customCheckItems);
};

const clearCustomCheckItems = (storageKey) => {
  window.localStorage.removeItem(storageKey);
};

const exposePrCheckerApi = (storageKey) => {
  const consoleWindow = unsafeWindow ?? window;

  /**
   * 这里必须暴露到 unsafeWindow，否则浏览器控制台无法直接访问 PrChecker。
   *
   * @see https://www.tampermonkey.net/documentation.php#api:unsafeWindow
   */
  consoleWindow.PrChecker = {
    add: (...checkItems) => addCustomCheckItems(storageKey, ...checkItems),
    clear: () => clearCustomCheckItems(storageKey),
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

const createDialogButton = ({ className, text, onClick }) =>
  createElement({
    tagName: "button",
    text,
    attributes: {
      class: `pr-checker-btn ${className}`,
      type: "button",
    },
    events: [
      {
        name: "click",
        handler: () => onClick(),
      },
    ],
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
  onDialogExist = noop,
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
      class: "pr-checker-dialog pr-checker-mask",
    },
    children: () => [
      createElement({
        text: title,
        attributes: { class: "pr-checker-title" },
      }),
      createElement({
        attributes: { class: "pr-checker-content" },
        children: (element) => content(element),
      }),
      createElement({
        attributes: { id: DIALOG_BUTTONS_ID },
        children: compact([
          text4Cancel &&
            createDialogButton({
              className: "close-btn",
              text: text4Cancel,
              onClick: () => closeDialogWithAnimation(dialog, onCancel),
            }),
          text4Ok &&
            createDialogButton({
              className: "ensure-btn",
              text: text4Ok,
              onClick: () => closeDialogWithAnimation(dialog, onOk),
            }),
        ]),
      }),
    ],
  });

  const mountTarget = getDocumentMountTarget();
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
    attributes: { id: CHECK_ITEMS_ID },
  });
  renderCheckItems(checkItemsWrapper, storageKey);

  return [checkItemsWrapper];
};

const wrapCreatePrButton = (createPrButton) => {
  const parent = createPrButton.parentNode;
  if (!parent) {
    return null;
  }

  if (parent.classList?.contains(CREATE_BUTTON_WRAPPER_CLASS)) {
    return parent;
  }

  const createButtonWrapper = createElement({
    attributes: {
      class: CREATE_BUTTON_WRAPPER_CLASS,
    },
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
    },
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
        },
      },
    ],
  });
};

export const initCreatePrChecker = async () => {
  try {
    const createPrButton = await waitForElement(CREATE_PR_BUTTON_SELECTOR, {
      timeout: CREATE_BUTTON_WAIT_TIMEOUT,
      interval: CREATE_BUTTON_WAIT_INTERVAL,
    });
    const storageKey = getCustomCheckItemsStorageKey();
    const createButtonWrapper = wrapCreatePrButton(createPrButton);
    addMaskButton({ createButtonWrapper, createPrButton, storageKey });
    exposePrCheckerApi(storageKey);
  } catch (error) {
    console.error(error);
  }
};
