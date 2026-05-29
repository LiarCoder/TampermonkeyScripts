import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const createVideoCover = (video) => {
  if (!video?.pic) {
    return createElement({
      attributes: {
        class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`,
      },
      text: "读取中",
    });
  }
  return createElement({
    tagName: "img",
    attributes: {
      class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-img`,
      src: video.pic,
      alt: "",
      referrerpolicy: "no-referrer",
    },
    events: [
      {
        name: "error",
        handler: (event) => {
          const placeholder = createElement({
            attributes: {
              class: `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`,
            },
            text: "封面加载失败",
          });
          event.currentTarget.replaceWith(placeholder);
        },
      },
    ],
  });
};

export const createVideoPreview = (video) =>
  createElement({
    attributes: { class: `${SCRIPT_ID}-video` },
    children: [
      createVideoCover(video),
      createElement({
        children: [
          createElement({
            tagName: "p",
            text: video?.title || "当前视频",
            attributes: { class: `${SCRIPT_ID}-video-title` },
          }),
          createElement({
            text: video?.ownerName ? `UP主：${video.ownerName}` : "",
            attributes: { class: `${SCRIPT_ID}-video-author` },
          }),
        ],
      }),
    ],
  });
