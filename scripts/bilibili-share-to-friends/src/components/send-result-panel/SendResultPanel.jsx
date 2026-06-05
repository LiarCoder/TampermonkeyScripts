import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const STATUS_TEXT = {
  sending: "正在发送...",
  success: "发送成功",
  failed: "发送失败",
};

/**
 * 渲染私信发送过程和结果。
 */
export const SendResultPanel = ({ results }) => {
  const successCount = results.filter((result) => result.status === "success").length;
  const failedCount = results.filter((result) => result.status === "failed").length;
  const sendingCount = results.filter((result) => result.status === "sending").length;
  const isFinished = sendingCount === 0;

  return (
    <div className={`${SCRIPT_ID}-send-result`}>
      <div className={`${SCRIPT_ID}-send-summary`}>
        {isFinished
          ? `发送完成：成功 ${successCount} 个，失败 ${failedCount} 个`
          : "正在发送视频链接..."}
      </div>
      <ul className={`${SCRIPT_ID}-send-list`}>
        {results.map((result) => (
          <li
            className={`${SCRIPT_ID}-send-item`}
            data-status={result.status}
            key={result.user.mid}
          >
            <span className={`${SCRIPT_ID}-send-name`}>{result.user.name}</span>
            <span className={`${SCRIPT_ID}-send-status`}>
              {STATUS_TEXT[result.status] || result.status}
            </span>
            {result.error ? (
              <span className={`${SCRIPT_ID}-send-error`}>{result.error}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
};
