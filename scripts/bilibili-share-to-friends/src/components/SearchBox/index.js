import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createSearchBox = ({ value, placeholder = "搜索用户昵称", notice = "", onInput }) =>
  createElement({
    attributes: { class: `${SCRIPT_ID}-search` },
    children: [
      createElement({
        tagName: "input",
        attributes: {
          class: `${SCRIPT_ID}-search-input`,
          type: "search",
          value,
          placeholder,
        },
        events: [
          {
            name: "input",
            handler: (event) => onInput(event.target.value),
          },
        ],
      }),
      notice
        ? createElement({
            attributes: { class: `${SCRIPT_ID}-search-notice` },
            text: notice,
          })
        : null,
    ],
  });
