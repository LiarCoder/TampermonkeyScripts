import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const DialogFooter = ({
  sending = false,
  canSend = false,
  result = false,
  onCancel,
  onClose,
  onSend = () => {},
}) => {
  if (result) {
    return (
      <div className={`${SCRIPT_ID}-footer`}>
        <button
          className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`}
          type="button"
          onClick={onClose}
        >
          关闭
        </button>
      </div>
    );
  }

  return (
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
};
