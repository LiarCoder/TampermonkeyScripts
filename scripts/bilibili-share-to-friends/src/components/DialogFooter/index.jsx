import { SCRIPT_ID } from "../../constants.js";
import { renderToElement } from "../../render.js";
import "./style.css";

const DialogFooter = ({ onCancel }) => (
  <div className={`${SCRIPT_ID}-footer`}>
    <button className={`${SCRIPT_ID}-btn`} type="button" onClick={onCancel}>
      取消
    </button>
    <button className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`} type="button" disabled>
      发送
    </button>
  </div>
);

const CloseFooter = ({ onClose }) => (
  <div className={`${SCRIPT_ID}-footer`}>
    <button className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`} type="button" onClick={onClose}>
      关闭
    </button>
  </div>
);

export const createDialogFooter = ({ onCancel }) => {
  const footer = renderToElement(DialogFooter({ onCancel }));
  const [cancelBtn, sendBtn] = footer.querySelectorAll("button");
  return { footer, cancelBtn, sendBtn };
};

export const createCloseFooter = ({ onClose }) => renderToElement(CloseFooter({ onClose }));
