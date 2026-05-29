import { SCRIPT_ID } from "../../constants.js";
import { renderToElement } from "../../render.js";
import "./style.css";

export const DialogFooter = ({ sending = false, canSend = false, onCancel, onSend = () => {} }) => (
  <div className={`${SCRIPT_ID}-footer`}>
    <button className={`${SCRIPT_ID}-btn`} type="button" disabled={sending} onClick={onCancel}>
      取消
    </button>
    <button
      className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`}
      type="button"
      disabled={sending || !canSend}
      onClick={onSend}
    >
      {sending ? "发送中" : "发送"}
    </button>
  </div>
);

export const CloseFooter = ({ onClose }) => (
  <div className={`${SCRIPT_ID}-footer`}>
    <button className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`} type="button" onClick={onClose}>
      关闭
    </button>
  </div>
);

export const createDialogFooter = ({ onCancel }) => {
  const footer = renderToElement(<DialogFooter onCancel={onCancel} />);
  const [cancelBtn, sendBtn] = footer.querySelectorAll("button");
  return { footer, cancelBtn, sendBtn };
};

export const createCloseFooter = ({ onClose }) =>
  renderToElement(<CloseFooter onClose={onClose} />);
