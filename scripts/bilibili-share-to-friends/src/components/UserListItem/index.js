import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createUserListItem = ({ user, onSelect }) => {
  const button = createElement({
    tagName: "button",
    attributes: {
      class: `${SCRIPT_ID}-person`,
      type: "button",
      "aria-selected": "false",
    },
    children: [
      createElement({
        tagName: "img",
        attributes: {
          class: `${SCRIPT_ID}-avatar`,
          src: user.avatar,
          alt: "",
          referrerpolicy: "no-referrer",
        },
        events: [
          {
            name: "error",
            handler: (event) => {
              if (event.currentTarget.dataset.fallbackApplied === "true") {
                return;
              }
              event.currentTarget.dataset.fallbackApplied = "true";
              event.currentTarget.src = "https://static.hdslb.com/images/member/noface.gif";
            },
          },
        ],
      }),
      createElement({
        children: [
          createElement({
            text: user.name,
            attributes: { class: `${SCRIPT_ID}-name` },
          }),
          createElement({
            text: user.meta || `UID ${user.mid}`,
            attributes: { class: `${SCRIPT_ID}-meta` },
          }),
        ],
      }),
      createElement({
        attributes: { class: `${SCRIPT_ID}-check` },
      }),
    ],
  });
  button.addEventListener("click", () => onSelect(button, user));
  return button;
};
