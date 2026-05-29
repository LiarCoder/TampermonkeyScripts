import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const tabs = [
  { value: "recent", label: "最近聊天" },
  { value: "all", label: "全部好友" },
];

export const createRecipientTabs = ({ activeTab, onChange }) =>
  createElement({
    attributes: { class: `${SCRIPT_ID}-tabs` },
    children: tabs.map((tab) =>
      createElement({
        tagName: "button",
        text: tab.label,
        attributes: {
          class: `${SCRIPT_ID}-tab`,
          type: "button",
          "aria-selected": String(activeTab === tab.value),
        },
        events: [
          {
            name: "click",
            handler: () => onChange(tab.value),
          },
        ],
      })
    ),
  });
