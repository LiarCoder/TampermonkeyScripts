import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * Renders an empty, loading, or error state message.
 */
export const StateView = ({ text, isError = false }) => (
  <div className={`${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`}>{text}</div>
);
