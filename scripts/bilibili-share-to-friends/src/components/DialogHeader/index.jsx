import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

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
