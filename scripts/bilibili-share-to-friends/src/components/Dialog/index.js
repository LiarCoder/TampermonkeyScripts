import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const closeDialog = (dialog) => {
  if (!dialog) {
    return;
  }
  try {
    if (dialog.open) {
      dialog.close();
    }
  } finally {
    // B 站页面有自己的浮层样式，关闭后直接移除节点可避免透明遮罩残留。
    dialog.remove();
  }
};

export const createDialog = () => {
  closeDialog(document.getElementById(`${SCRIPT_ID}-dialog`));
  const dialog = createElement({
    tagName: "dialog",
    attributes: {
      id: `${SCRIPT_ID}-dialog`,
      class: `${SCRIPT_ID}-dialog`,
    },
    events: [
      {
        name: "cancel",
        handler: (event) => {
          event.preventDefault();
          closeDialog(dialog);
        },
      },
    ],
  });
  document.body.appendChild(dialog);
  return dialog;
};

export const setDialogContent = (dialog, child) => {
  dialog.innerHTML = "";
  dialog.appendChild(child);
};

export const createDialogHeader = ({ title, onClose }) => {
  const closeBtn = createElement({
    tagName: "button",
    text: "×",
    attributes: {
      class: `${SCRIPT_ID}-close`,
      title: "关闭",
      type: "button",
    },
    events: [{ name: "click", handler: onClose }],
  });
  const header = createElement({
    attributes: { class: `${SCRIPT_ID}-header` },
    children: [
      createElement({
        tagName: "h3",
        text: title,
        attributes: { class: `${SCRIPT_ID}-title` },
      }),
      closeBtn,
    ],
  });

  return { header, closeBtn };
};
