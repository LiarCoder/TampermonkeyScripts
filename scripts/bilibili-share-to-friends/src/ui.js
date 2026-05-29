import { createElement } from "@tampermonkey-scripts/shared";

import {
  assertLogin,
  getFollowers,
  getFollowings,
  getRecentSessions,
  getVideoInfo,
  sendVideoText,
} from "./api.js";
import {
  closeDialog,
  createDialog,
  createDialogHeader,
  setDialogContent,
} from "./components/Dialog/index.js";
import { createDialogFooter, createCloseFooter } from "./components/DialogFooter/index.js";
import { createEntryButton as createShareEntryButton } from "./components/EntryButton/index.js";
import { createRecipientTabs } from "./components/RecipientTabs/index.js";
import { createRelationFilter } from "./components/RelationFilter/index.js";
import { createState } from "./components/StateView/index.js";
import { createUserList } from "./components/UserList/index.js";
import { createVideoPreview } from "./components/VideoPreview/index.js";
import { SCRIPT_ID } from "./constants.js";

const clearErrorStates = (body) => {
  body.querySelectorAll(`.${SCRIPT_ID}-state-error`).forEach((element) => element.remove());
};

const createEmptyRelationState = () => ({
  users: [],
  loading: false,
  error: "",
  loaded: false,
});

const renderDialog = ({ dialog, video, nav = null, sessions = [], status = "", error = "" }) => {
  const state = {
    activeTab: "recent",
    activeRelation: "following",
    selectedUser: null,
    recent: {
      users: sessions,
      error: "",
      loading: false,
      loaded: sessions.length > 0,
    },
    relations: {
      following: createEmptyRelationState(),
      followers: createEmptyRelationState(),
    },
  };
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

  const updateSelection = (button, user) => {
    clearErrorStates(body);
    state.selectedUser = user;
    body
      .querySelectorAll(`.${SCRIPT_ID}-person`)
      .forEach((item) => item.setAttribute("aria-selected", "false"));
    button.setAttribute("aria-selected", "true");
    sendBtn.removeAttribute("disabled");
  };

  const setSending = (nextSending) => {
    sending = nextSending;
    sendBtn.disabled = nextSending || !state.selectedUser;
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

  const renderUsers = ({ users, emptyText }) => {
    if (users.length === 0) {
      body.appendChild(createState(emptyText));
      return;
    }
    body.appendChild(
      createUserList({
        users,
        selectedMid: state.selectedUser?.mid,
        onSelect: updateSelection,
      })
    );
  };

  const renderRelationContent = () => {
    body.appendChild(
      createRelationFilter({
        activeRelation: state.activeRelation,
        onChange: (relation) => {
          if (state.activeRelation === relation) {
            return;
          }
          state.activeRelation = relation;
          renderBody();
          loadRelationUsers(relation);
        },
      })
    );
    const relationState = state.relations[state.activeRelation];
    if (relationState.loading) {
      body.appendChild(createState("正在读取用户列表..."));
      return;
    }
    if (relationState.error) {
      body.appendChild(createState(relationState.error, true));
      return;
    }
    renderUsers({
      users: relationState.users,
      emptyText: state.activeRelation === "following" ? "暂无关注用户。" : "暂无粉丝用户。",
    });
  };

  const renderBody = () => {
    body.innerHTML = "";
    sendBtn.disabled = sending || !state.selectedUser;
    if (status) {
      body.appendChild(createState(status));
      return;
    }
    if (error) {
      body.appendChild(createState(error, true));
      return;
    }
    body.appendChild(
      createRecipientTabs({
        activeTab: state.activeTab,
        onChange: (tab) => {
          if (state.activeTab === tab) {
            return;
          }
          state.activeTab = tab;
          renderBody();
          if (tab === "all") {
            loadRelationUsers(state.activeRelation);
          }
        },
      })
    );
    if (state.activeTab === "recent") {
      renderUsers({
        users: state.recent.users,
        emptyText: "暂无最近私信联系人。",
      });
      return;
    }
    renderRelationContent();
  };

  const loadRelationUsers = async (relation) => {
    const relationState = state.relations[relation];
    if (!nav || relationState.loading || relationState.loaded) {
      return;
    }
    relationState.loading = true;
    relationState.error = "";
    renderBody();
    try {
      const loader = relation === "following" ? getFollowings : getFollowers;
      const result = await loader({ mid: nav.mid });
      relationState.users = result.users;
      relationState.loaded = true;
    } catch (loadError) {
      relationState.error = loadError.message;
    } finally {
      relationState.loading = false;
      renderBody();
    }
  };

  if (status) {
    renderBody();
  } else if (error) {
    renderBody();
  } else {
    renderBody();
  }

  sendBtn.addEventListener("click", async () => {
    if (!state.selectedUser || sending) {
      return;
    }
    setSending(true);
    try {
      const { nav, csrf } = await assertLogin();
      await sendVideoText({
        nav,
        csrf,
        video,
        receiver: state.selectedUser,
      });
      showResult(`已将视频链接发送给 ${state.selectedUser.name}。`);
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
    const { nav } = await assertLogin();
    const video = await getVideoInfo();
    const sessions = await getRecentSessions();
    if (!dialog.isConnected || !dialog.open) {
      return;
    }
    renderDialog({ dialog, video, nav, sessions });
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
