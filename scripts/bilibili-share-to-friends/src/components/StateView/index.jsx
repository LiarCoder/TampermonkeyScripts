import { SCRIPT_ID } from "../../constants.js";
import { renderToElement } from "../../render.js";
import "./style.css";

const StateView = ({ text, isError = false }) => (
  <div className={`${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`}>{text}</div>
);

export const createState = (text, isError = false) => renderToElement(StateView({ text, isError }));
