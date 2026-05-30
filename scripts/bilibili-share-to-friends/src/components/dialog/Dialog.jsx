import { render } from "preact";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 卸载并移除已有分享弹窗节点。
 */
export const closeDialog = (dialog) => {
  if (!dialog) {
    return;
  }
  try {
    render(null, dialog);
    if (dialog.open) {
      dialog.close();
    }
  } finally {
    // B 站页面有自己的浮层样式，关闭后直接移除节点可避免透明遮罩残留。
    dialog.remove();
  }
};

/**
 * 创建新的原生弹窗容器，用于承载分享界面。
 */
export const createDialog = () => {
  closeDialog(document.getElementById(`${SCRIPT_ID}-dialog`));
  const dialog = document.createElement("dialog");
  dialog.id = `${SCRIPT_ID}-dialog`;
  dialog.className = `${SCRIPT_ID}-dialog`;
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDialog(dialog);
  });
  document.body.appendChild(dialog);
  return dialog;
};
