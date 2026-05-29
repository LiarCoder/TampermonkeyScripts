import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createState = (text, isError = false) =>
  createElement({
    attributes: {
      class: `${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`,
    },
    text,
  });
