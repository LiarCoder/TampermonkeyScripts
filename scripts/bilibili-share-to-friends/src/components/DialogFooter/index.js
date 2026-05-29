import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createDialogFooter = ({ onCancel }) => {
  const cancelBtn = createElement({
    tagName: "button",
    text: "取消",
    attributes: {
      class: `${SCRIPT_ID}-btn`,
      type: "button",
    },
    events: [{ name: "click", handler: onCancel }],
  });
  const sendBtn = createElement({
    tagName: "button",
    text: "发送",
    attributes: {
      class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
      type: "button",
      disabled: "disabled",
    },
  });
  const footer = createElement({
    attributes: { class: `${SCRIPT_ID}-footer` },
    children: [cancelBtn, sendBtn],
  });

  return { footer, cancelBtn, sendBtn };
};

export const createCloseFooter = ({ onClose }) =>
  createElement({
    attributes: { class: `${SCRIPT_ID}-footer` },
    children: [
      createElement({
        tagName: "button",
        text: "关闭",
        attributes: {
          class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
          type: "button",
        },
        events: [{ name: "click", handler: onClose }],
      }),
    ],
  });
