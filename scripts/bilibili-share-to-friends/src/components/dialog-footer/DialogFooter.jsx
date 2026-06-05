import { useEffect, useState } from "preact/hooks";

import { assertLogin, sendVideoText } from "../../api.js";
import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 渲染关闭、取消和发送操作，并维护发送请求状态。
 */
export const DialogFooter = ({
  video,
  maxSelectedUsers,
  selectedUsers = [],
  sendStage = "selecting",
  onClose,
  onContinue = () => {},
  onSendingChange = () => {},
  onSendStart = () => {},
  onSendProgress = () => {},
  onSendComplete = () => {},
  onSendError = () => {},
}) => {
  const [sending, setSending] = useState(false);
  const selectedCount = selectedUsers.length;
  const selectionLimitExceeded = selectedCount > maxSelectedUsers;
  const sendDisabled = sending || selectedCount === 0 || selectionLimitExceeded;
  const selectionNotice = selectionLimitExceeded
    ? `最多 ${maxSelectedUsers} 个`
    : selectedCount > 0
      ? `已选择 ${selectedCount} 个`
      : "";
  const selectionNoticeTitle = selectionLimitExceeded
    ? `最多一次发送 ${maxSelectedUsers} 个，请取消部分勾选后再发送。`
    : selectionNotice;

  useEffect(() => {
    onSendingChange(sending);
  }, [onSendingChange, sending]);

  const handleSend = async () => {
    if (sendDisabled) {
      return;
    }
    const receivers = [...selectedUsers];
    setSending(true);
    onSendError("");
    onSendStart(receivers);
    try {
      const login = await assertLogin();
      for (const receiver of receivers) {
        onSendProgress({
          user: receiver,
          status: "sending",
          error: "",
        });
        try {
          await sendVideoText({
            nav: login.nav,
            csrf: login.csrf,
            video,
            receiver,
          });
          onSendProgress({
            user: receiver,
            status: "success",
          });
        } catch (sendError) {
          onSendProgress({
            user: receiver,
            status: "failed",
            error: sendError.message,
          });
        }
      }
    } catch (sendError) {
      receivers.forEach((receiver) => {
        onSendProgress({
          user: receiver,
          status: "failed",
          error: sendError.message,
        });
      });
    } finally {
      onSendComplete();
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
      {selectionNotice ? (
        <div
          className={`${SCRIPT_ID}-footer-notice`}
          data-error={String(selectionLimitExceeded)}
          title={selectionNoticeTitle}
        >
          {selectionNotice}
        </div>
      ) : null}
      <button className={`${SCRIPT_ID}-btn`} type="button" disabled={sending} onClick={onClose}>
        取消
      </button>
      <button
        className={`${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`}
        type="button"
        disabled={sendDisabled}
        onClick={handleSend}
      >
        {sending ? "发送中" : "发送"}
      </button>
    </div>
  );
};
