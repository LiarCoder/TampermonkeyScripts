import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import { createUserListItem } from "../UserListItem/index.js";
import "./style.css";

export const createUserList = ({
  users,
  selectedMid = null,
  loadingMore = false,
  hasMore = false,
  moreError = "",
  showFooter = false,
  onRetry = () => {},
  onSelect,
}) => {
  const footer = showFooter
    ? createElement({
        attributes: { class: `${SCRIPT_ID}-list-footer` },
        children: [
          moreError
            ? createElement({
                tagName: "button",
                text: `${moreError}，点击重试`,
                attributes: {
                  class: `${SCRIPT_ID}-list-retry`,
                  type: "button",
                },
                events: [{ name: "click", handler: onRetry }],
              })
            : createElement({
                text: loadingMore ? "正在加载更多..." : hasMore ? "" : "没有更多了",
              }),
        ],
      })
    : null;
  const list = createElement({
    tagName: "ul",
    attributes: { class: `${SCRIPT_ID}-list` },
  });
  users.forEach((user) => {
    const item = createUserListItem({ user, selected: user.mid === selectedMid, onSelect });
    list.appendChild(createElement({ tagName: "li", children: [item] }));
  });
  return createElement({
    attributes: {
      class: `${SCRIPT_ID}-list-scroll`,
      "data-bili-share-to-friends-list-scroll": "true",
    },
    children: [
      list,
      footer,
      showFooter && hasMore && !moreError
        ? createElement({
            attributes: {
              class: `${SCRIPT_ID}-list-sentinel`,
              "data-bili-share-to-friends-list-sentinel": "true",
            },
          })
        : null,
    ],
  });
};
