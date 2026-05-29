import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const createEntryButton = ({ onClick }) =>
  createElement({
    tagName: "button",
    attributes: {
      class: `${SCRIPT_ID}-entry`,
      type: "button",
      "data-bili-share-to-friends-entry": "true",
      title: "分享给 B站好友",
    },
    html: `
      <span class="${SCRIPT_ID}-entry-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2h9A3.5 3.5 0 0 1 20 5.5v6A3.5 3.5 0 0 1 16.5 15H12l-4.2 4.2A1 1 0 0 1 6 18.5V15A3.5 3.5 0 0 1 4 11.8V5.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
          <path d="M8 7.5h8M8 11h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
      </span>
      <span class="${SCRIPT_ID}-entry-text">B站好友</span>
    `,
    events: [
      {
        name: "click",
        handler: (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        },
      },
    ],
  });
