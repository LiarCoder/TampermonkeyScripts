import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const relationOptions = [
  { value: "following", label: "我的关注" },
  { value: "followers", label: "我的粉丝" },
];

export const createRelationFilter = ({ activeRelation, onChange }) =>
  createElement({
    attributes: { class: `${SCRIPT_ID}-relation-filter` },
    children: relationOptions.map((option) =>
      createElement({
        tagName: "label",
        attributes: { class: `${SCRIPT_ID}-relation-option` },
        children: [
          createElement({
            tagName: "input",
            attributes: {
              type: "radio",
              name: `${SCRIPT_ID}-relation`,
              value: option.value,
              checked: activeRelation === option.value ? "checked" : null,
            },
            events: [
              {
                name: "change",
                handler: () => onChange(option.value),
              },
            ],
          }),
          createElement({ tagName: "span", text: option.label }),
        ],
      })
    ),
  });
