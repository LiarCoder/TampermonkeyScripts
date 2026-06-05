import { useEffect, useState } from "preact/hooks";

import { assertLogin, sendVideoText } from "../../api.js";
import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 渲染关闭、取消和发送操作，并维护发送请求状态。
 */
export const DialogFooter = ({
  video,
  selectedUser,
  sendStage = "selecting",
  onClose,
  onContinue = () => {},
  onSendingChange = () => {},
  onSendStart = () => {},
  onSendSuccess = () => {},
  onSendFailure = () => {},
  onSendError = () => {},
}) => {
  const [sending, setSending] = useState(false);

  useEffect(() => {
    onSendingChange(sending);
  }, [onSendingChange, sending]);

  const handleSend = async () => {
    if (!selectedUser || sending) {
      return;
    }
    setSending(true);
    onSendError("");
    onSendStart(selectedUser);
    try {
      const login = await assertLogin();
      await sendVideoText({
        nav: login.nav,
        csrf: login.csrf,
        video,
        receiver: selectedUser,
      });
      onSendSuccess({
        user: selectedUser,
        status: "success",
      });
    } catch (sendError) {
      onSendFailure({
        user: selectedUser,
        status: "failed",
        error: sendError.message,
      });
    } finally {
      setSending(false);
    }
  };

  if (sendStage === "sending") {
    return (
      <div className={`${SCRIPT_ID}-footer`}>
        <button className={`${SCRIPT_ID}-btn`} type="button" disabled>
          取消
        </button>
        <button className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`} type="button" disabled>
          发送中
        </button>
      </div>
    );
  }

  if (sendStage === "result") {
    return (
      <div className={`${SCRIPT_ID}-footer`}>
        <button className={`${SCRIPT_ID}-btn`} type="button" onClick={onContinue}>
          继续
        </button>
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
      <button className={`${SCRIPT_ID}-btn`} type="button" disabled={sending} onClick={onClose}>
        取消
      </button>
      <button
        className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`}
        type="button"
        disabled={sending || !selectedUser}
        onClick={handleSend}
      >
        {sending ? "发送中" : "发送"}
      </button>
    </div>
  );
};
