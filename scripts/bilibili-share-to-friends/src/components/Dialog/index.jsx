import { render } from "preact";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

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

export const DialogHeader = ({ title, onClose, disabled = false }) => (
  <div className={`${SCRIPT_ID}-header`}>
    <h3 className={`${SCRIPT_ID}-title`}>{title}</h3>
    <button
      className={`${SCRIPT_ID}-close`}
      title="关闭"
      type="button"
      disabled={disabled}
      onClick={onClose}
    >
      ×
    </button>
  </div>
);
