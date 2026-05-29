import { createElement } from "@tampermonkey-scripts/shared";

import {
  assertLogin,
  getFollowers,
  getFollowings,
  getRecentSessions,
  getVideoInfo,
  searchFollowings,
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
import { createSearchBox } from "./components/SearchBox/index.js";
import { createState } from "./components/StateView/index.js";
import { createUserList } from "./components/UserList/index.js";
import { createVideoPreview } from "./components/VideoPreview/index.js";
import { SCRIPT_ID } from "./constants.js";

const clearErrorStates = (body) => {
  body.querySelectorAll(`.${SCRIPT_ID}-state-error`).forEach((element) => element.remove());
};

const createEmptyRelationState = () => ({
  users: [],
  page: 0,
  hasMore: true,
  loading: false,
  loadingMore: false,
  moreError: "",
  error: "",
  loaded: false,
  search: {
    users: [],
    page: 0,
    hasMore: true,
    loading: false,
    loadingMore: false,
    moreError: "",
    error: "",
    loaded: false,
    keyword: "",
  },
});

const renderDialog = ({ dialog, video, nav = null, sessions = [], status = "", error = "" }) => {
  const state = {
    activeTab: "recent",
    activeRelation: "following",
    searchTerm: "",
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
  let searchTimer = null;
  let loadMoreObserver = null;

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

  const resetSelection = () => {
    state.selectedUser = null;
    sendBtn.disabled = true;
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

  const renderUsers = ({
    users,
    emptyText,
    hasMore = false,
    loadingMore = false,
    moreError = "",
    showFooter = false,
    onRetry = () => {},
  }) => {
    if (users.length === 0) {
      body.appendChild(createState(emptyText));
      if (showFooter) {
        body.appendChild(
          createUserList({
            users,
            selectedMid: state.selectedUser?.mid,
            hasMore,
            loadingMore,
            moreError,
            showFooter,
            onRetry,
            onSelect: updateSelection,
          })
        );
      }
      return;
    }
    body.appendChild(
      createUserList({
        users,
        selectedMid: state.selectedUser?.mid,
        hasMore,
        loadingMore,
        moreError,
        showFooter,
        onRetry,
        onSelect: updateSelection,
      })
    );
  };

  const getRelationDisplayState = (relation) => {
    const relationState = state.relations[relation];
    const keyword = state.searchTerm.trim();
    if (relation === "following" && keyword) {
      return relationState.search;
    }
    return relationState;
  };

  const getRelationDisplayUsers = (relation) => {
    const relationState = state.relations[relation];
    const keyword = state.searchTerm.trim().toLowerCase();
    if (!keyword) {
      return relationState.users;
    }
    if (relation === "following") {
      return relationState.search.users;
    }
    return relationState.users.filter((user) => user.name.toLowerCase().includes(keyword));
  };

  const disconnectLoadMoreObserver = () => {
    if (loadMoreObserver) {
      loadMoreObserver.disconnect();
      loadMoreObserver = null;
    }
  };

  const observeLoadMore = () => {
    disconnectLoadMoreObserver();
    if (state.activeTab !== "all") {
      return;
    }
    const displayState = getRelationDisplayState(state.activeRelation);
    if (!displayState.hasMore || displayState.loading || displayState.loadingMore) {
      return;
    }
    const sentinel = body.querySelector("[data-bili-share-to-friends-list-sentinel]");
    if (!sentinel) {
      return;
    }
    loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadRelationUsers(state.activeRelation);
        }
      },
      { root: body, threshold: 0.1 }
    );
    loadMoreObserver.observe(sentinel);
  };

  const scheduleSearch = (value) => {
    if (state.searchTerm !== value) {
      resetSelection();
    }
    state.searchTerm = value;
    renderBody();
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      if (state.activeTab !== "all") {
        return;
      }
      const keyword = state.searchTerm.trim();
      if (state.activeRelation === "following" && keyword) {
        state.relations.following.search.keyword = keyword;
        loadRelationUsers("following", { reset: true });
        return;
      }
      renderBody();
    }, 300);
  };

  const renderRelationContent = () => {
    body.appendChild(
      createRelationFilter({
        activeRelation: state.activeRelation,
        onChange: (relation) => {
          if (state.activeRelation === relation) {
            return;
          }
          resetSelection();
          state.activeRelation = relation;
          renderBody();
          loadRelationUsers(relation);
        },
      })
    );
    const keyword = state.searchTerm.trim();
    body.appendChild(
      createSearchBox({
        value: state.searchTerm,
        notice:
          state.activeRelation === "followers" && keyword
            ? "粉丝搜索仅筛选已加载的用户，继续向下滚动可扩大搜索范围。"
            : "",
        onInput: scheduleSearch,
      })
    );
    const displayState = getRelationDisplayState(state.activeRelation);
    if (displayState.loading) {
      body.appendChild(createState("正在读取用户列表..."));
      return;
    }
    if (displayState.error) {
      body.appendChild(createState(displayState.error, true));
      return;
    }
    renderUsers({
      users: getRelationDisplayUsers(state.activeRelation),
      emptyText: state.activeRelation === "following" ? "暂无关注用户。" : "暂无粉丝用户。",
      hasMore: displayState.hasMore,
      loadingMore: displayState.loadingMore,
      moreError: displayState.moreError,
      showFooter: true,
      onRetry: () => loadRelationUsers(state.activeRelation),
    });
    observeLoadMore();
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
          resetSelection();
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

  const loadRelationUsers = async (relation, { reset = false } = {}) => {
    const relationState = state.relations[relation];
    const keyword = state.searchTerm.trim();
    const useSearch = relation === "following" && keyword;
    const displayState = useSearch ? relationState.search : relationState;
    if (
      !nav ||
      displayState.loading ||
      displayState.loadingMore ||
      (!reset && displayState.loaded && !displayState.hasMore)
    ) {
      return;
    }
    const nextPage = reset ? 1 : displayState.page + 1;
    displayState.loading = reset || !displayState.loaded;
    displayState.loadingMore = !displayState.loading;
    displayState.error = "";
    displayState.moreError = "";
    renderBody();
    try {
      const loader = useSearch
        ? searchFollowings
        : relation === "following"
          ? getFollowings
          : getFollowers;
      const result = await loader({
        mid: nav.mid,
        keyword,
        page: nextPage,
      });
      displayState.users = nextPage === 1 ? result.users : [...displayState.users, ...result.users];
      displayState.page = nextPage;
      displayState.hasMore = result.hasMore;
      displayState.loaded = true;
    } catch (loadError) {
      if (useSearch && nextPage === 1) {
        displayState.users = relationState.users.filter((user) =>
          user.name.toLowerCase().includes(keyword.toLowerCase())
        );
        displayState.hasMore = false;
        displayState.loaded = true;
      } else if (nextPage === 1) {
        displayState.error = loadError.message;
      } else {
        displayState.moreError = loadError.message;
      }
    } finally {
      displayState.loading = false;
      displayState.loadingMore = false;
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
