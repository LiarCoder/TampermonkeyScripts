import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 渲染空状态、加载状态或错误状态提示。
 */
export const StateView = ({ text, isError = false }) => (
  <div className={`${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`}>{text}</div>
);
