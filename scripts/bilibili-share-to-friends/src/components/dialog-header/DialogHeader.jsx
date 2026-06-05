import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 渲染分享弹窗标题和关闭按钮。
 */
export const DialogHeader = ({ title, onClose, disabled = false }) => (
  <div className={`${SCRIPT_ID}-header`}>
    <h3 className={`${SCRIPT_ID}-title`}>{title}</h3>
    <button
      className={`${SCRIPT_ID}-close`}
      aria-label="关闭"
      title="关闭"
      type="button"
      disabled={disabled}
      onClick={onClose}
    />
  </div>
);
