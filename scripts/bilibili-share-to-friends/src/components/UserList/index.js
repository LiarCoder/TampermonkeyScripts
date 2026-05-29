import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import { createUserListItem } from "../UserListItem/index.js";
import "./style.css";

export const createUserList = ({ users, onSelect }) => {
  const list = createElement({
    tagName: "ul",
    attributes: { class: `${SCRIPT_ID}-list` },
  });
  users.forEach((user) => {
    const item = createUserListItem({ user, onSelect });
    list.appendChild(createElement({ tagName: "li", children: [item] }));
  });
  return list;
};
