import { useEffect, useState } from "preact/hooks";

import { assertLogin, sendVideoText } from "../../api.js";
import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * Renders close/cancel/send actions and owns the send request state.
 */
export const DialogFooter = ({
  video,
  selectedUser,
  showCloseOnly = false,
  onClose,
  onSendingChange = () => {},
  onSendSuccess = () => {},
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
    try {
      const login = await assertLogin();
      await sendVideoText({
        nav: login.nav,
        csrf: login.csrf,
        video,
        receiver: selectedUser,
      });
      onSendSuccess({
        message: `已将视频链接发送给 ${selectedUser.name}。`,
        isError: false,
      });
    } catch (sendError) {
      onSendError(sendError.message);
    } finally {
      setSending(false);
    }
  };

  if (showCloseOnly) {
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
