import { createElement } from "@tampermonkey-scripts/shared";

import { SCRIPT_ID } from "./constants.js";
import { assertLogin, getRecentSessions, getVideoInfo, sendVideoText } from "./api.js";

const closeDialog = (dialog) => {
  if (!dialog) {
    return;
  }
  try {
    if (dialog.open) {
      dialog.close();
    }
  } finally {
    // B 站页面有自己的浮层样式，关闭后直接移除节点可避免透明遮罩残留。
    dialog.remove();
  }
};

const createDialog = () => {
  closeDialog(document.getElementById(`${SCRIPT_ID}-dialog`));
  const dialog = createElement({
    tagName: "dialog",
    attributes: {
      id: `${SCRIPT_ID}-dialog`,
      class: `${SCRIPT_ID}-dialog`,
    },
    events: [
      {
        name: "cancel",
        handler: (event) => {
          event.preventDefault();
          closeDialog(dialog);
        },
      },
    ],
  });
  document.body.appendChild(dialog);
  return dialog;
};

const setDialogContent = (dialog, child) => {
  dialog.innerHTML = "";
  dialog.appendChild(child);
};

const createState = (text, isError = false) =>
  createElement({
    attributes: {
      class: `${SCRIPT_ID}-state${isError ? ` ${SCRIPT_ID}-state-error` : ""}`,
    },
    text,
  });

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

const renderDialog = ({ dialog, video, sessions = [], status = "", error = "" }) => {
  let selectedSession = null;
  let sending = false;

  const closeBtn = createElement({
    tagName: "button",
    text: "×",
    attributes: {
      class: `${SCRIPT_ID}-close`,
      title: "关闭",
      type: "button",
    },
    events: [{ name: "click", handler: () => closeDialog(dialog) }],
  });
  const header = createElement({
    attributes: { class: `${SCRIPT_ID}-header` },
    children: [
      createElement({
        tagName: "h3",
        text: "分享给 B站好友",
        attributes: { class: `${SCRIPT_ID}-title` },
      }),
      closeBtn,
    ],
  });
  const videoPreview = createElement({
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
  const body = createElement({
    attributes: { class: `${SCRIPT_ID}-body` },
  });
  const cancelBtn = createElement({
    tagName: "button",
    text: "取消",
    attributes: {
      class: `${SCRIPT_ID}-btn`,
      type: "button",
    },
    events: [{ name: "click", handler: () => closeDialog(dialog) }],
  });
  const sendBtn = createElement({
    tagName: "button",
    text: "发送",
    attributes: {
      class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
      type: "button",
      disabled: "disabled",
    },
  });
  const footer = createElement({
    attributes: { class: `${SCRIPT_ID}-footer` },
    children: [cancelBtn, sendBtn],
  });

  const clearErrorStates = () => {
    body
      .querySelectorAll(`.${SCRIPT_ID}-state-error`)
      .forEach((element) => element.remove());
  };

  const updateSelection = (button, session) => {
    clearErrorStates();
    selectedSession = session;
    body
      .querySelectorAll(`.${SCRIPT_ID}-person`)
      .forEach((item) => item.setAttribute("aria-selected", "false"));
    button.setAttribute("aria-selected", "true");
    sendBtn.removeAttribute("disabled");
  };

  const setSending = (nextSending) => {
    sending = nextSending;
    sendBtn.disabled = nextSending || !selectedSession;
    cancelBtn.disabled = nextSending;
    closeBtn.disabled = nextSending;
    sendBtn.innerText = nextSending ? "发送中" : "发送";
  };

  const showResult = (message, isError = false) => {
    body.innerHTML = "";
    body.appendChild(createState(message, isError));
    footer.innerHTML = "";
    footer.appendChild(
      createElement({
        tagName: "button",
        text: "关闭",
        attributes: {
          class: `${SCRIPT_ID}-btn ${SCRIPT_ID}-btn-primary`,
          type: "button",
        },
        events: [{ name: "click", handler: () => closeDialog(dialog) }],
      })
    );
    closeBtn.disabled = false;
  };

  if (status) {
    body.appendChild(createState(status));
  } else if (error) {
    body.appendChild(createState(error, true));
  } else if (sessions.length === 0) {
    body.appendChild(createState("暂无最近私信联系人。"));
  } else {
    const list = createElement({
      tagName: "ul",
      attributes: { class: `${SCRIPT_ID}-list` },
    });
    sessions.forEach((session) => {
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
              src: session.avatar,
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
                  event.currentTarget.src =
                    "https://static.hdslb.com/images/member/noface.gif";
                },
              },
            ],
          }),
          createElement({
            children: [
              createElement({
                text: session.name,
                attributes: { class: `${SCRIPT_ID}-name` },
              }),
              createElement({
                text: session.unreadCount > 0 ? `${session.unreadCount} 条未读` : `UID ${session.mid}`,
                attributes: { class: `${SCRIPT_ID}-meta` },
              }),
            ],
          }),
          createElement({
            attributes: { class: `${SCRIPT_ID}-check` },
          }),
        ],
      });
      button.addEventListener("click", () => updateSelection(button, session));
      list.appendChild(createElement({ tagName: "li", children: [button] }));
    });
    body.appendChild(list);
  }

  sendBtn.addEventListener("click", async () => {
    if (!selectedSession || sending) {
      return;
    }
    setSending(true);
    try {
      const { nav, csrf } = await assertLogin();
      await sendVideoText({
        nav,
        csrf,
        video,
        receiver: selectedSession,
      });
      showResult(`已将视频链接发送给 ${selectedSession.name}。`);
    } catch (sendError) {
      setSending(false);
      clearErrorStates();
      body.prepend(createState(sendError.message, true));
    }
  });

  setDialogContent(
    dialog,
    createElement({
      children: [header, videoPreview, body, footer],
    })
  );
};

const openShareDialog = async () => {
  const dialog = createDialog();
  const fallbackVideo = {
    title: document.title.replace("_哔哩哔哩_bilibili", ""),
    pic: "",
    ownerName: "",
  };
  renderDialog({
    dialog,
    video: fallbackVideo,
    status: "正在读取视频和最近私信联系人...",
  });
  if (!dialog.open) {
    dialog.showModal();
  }

  try {
    await assertLogin();
    const video = await getVideoInfo();
    const sessions = await getRecentSessions();
    if (!dialog.isConnected || !dialog.open) {
      return;
    }
    renderDialog({ dialog, video, sessions });
  } catch (error) {
    if (!dialog.isConnected || !dialog.open) {
      return;
    }
    renderDialog({
      dialog,
      video: fallbackVideo,
      error: error.message,
    });
  }
};

export const createEntryButton = () =>
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
          openShareDialog();
        },
      },
    ],
  });
