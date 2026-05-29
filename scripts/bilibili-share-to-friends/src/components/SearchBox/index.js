import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createSearchBox = ({
  value,
  placeholder = "搜索用户昵称",
  notice = "",
  onCompositionStart = () => {},
  onInput,
}) => {
  let composing = false;

  return createElement({
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
            name: "compositionstart",
            handler: () => {
              composing = true;
              onCompositionStart();
            },
          },
          {
            name: "compositionend",
            handler: (event) => {
              composing = false;
              onInput(event.target.value);
            },
          },
          {
            name: "input",
            handler: (event) => {
              if (composing || event.isComposing) {
                return;
              }
              onInput(event.target.value);
            },
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
};
