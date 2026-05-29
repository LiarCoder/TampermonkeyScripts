import { createElement } from "@tampermonkey-scripts/shared";

import { assertLogin, getRecentSessions, getVideoInfo, sendVideoText } from "./api.js";
import {
  closeDialog,
  createDialog,
  createDialogHeader,
  setDialogContent,
} from "./components/Dialog/index.js";
import { createDialogFooter, createCloseFooter } from "./components/DialogFooter/index.js";
import { createEntryButton as createShareEntryButton } from "./components/EntryButton/index.js";
import { createState } from "./components/StateView/index.js";
import { createUserList } from "./components/UserList/index.js";
import { createVideoPreview } from "./components/VideoPreview/index.js";
import { SCRIPT_ID } from "./constants.js";

const clearErrorStates = (body) => {
  body.querySelectorAll(`.${SCRIPT_ID}-state-error`).forEach((element) => element.remove());
};

const renderDialog = ({ dialog, video, sessions = [], status = "", error = "" }) => {
  let selectedSession = null;
  let sending = false;

  const { header, closeBtn } = createDialogHeader({
    title: "分享给 B站好友",
    onClose: () => closeDialog(dialog),
  });
  const body = createElement({
    attributes: { class: `${SCRIPT_ID}-body` },
  });
  const { footer, cancelBtn, sendBtn } = createDialogFooter({
    onCancel: () => closeDialog(dialog),
  });

  const updateSelection = (button, session) => {
    clearErrorStates(body);
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
    footer.replaceWith(createCloseFooter({ onClose: () => closeDialog(dialog) }));
    closeBtn.disabled = false;
  };

  if (status) {
    body.appendChild(createState(status));
  } else if (error) {
    body.appendChild(createState(error, true));
  } else if (sessions.length === 0) {
    body.appendChild(createState("暂无最近私信联系人。"));
  } else {
    body.appendChild(createUserList({ users: sessions, onSelect: updateSelection }));
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
      clearErrorStates(body);
      body.prepend(createState(sendError.message, true));
    }
  });

  setDialogContent(
    dialog,
    createElement({
      children: [header, createVideoPreview(video), body, footer],
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

export const createEntryButton = () => createShareEntryButton({ onClick: openShareDialog });
