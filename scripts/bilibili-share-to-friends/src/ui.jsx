import { render } from "preact";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import {
  assertLogin,
  getFollowers,
  getFollowings,
  getRecentSessions,
  getVideoInfo,
  searchFollowings,
  sendVideoText,
} from "./api.js";
import { closeDialog, createDialog } from "./components/Dialog/index.jsx";
import { DialogFooter } from "./components/DialogFooter/index.jsx";
import { DialogHeader } from "./components/DialogHeader/index.jsx";
import { createEntryButton as createShareEntryButton } from "./components/EntryButton/index.jsx";
import { RecipientTabs } from "./components/RecipientTabs/index.jsx";
import { RelationFilter } from "./components/RelationFilter/index.jsx";
import { SearchBox } from "./components/SearchBox/index.jsx";
import { StateView } from "./components/StateView/index.jsx";
import { UserList } from "./components/UserList/index.jsx";
import { VideoPreview } from "./components/VideoPreview/index.jsx";
import { LIST_SCROLL_SELECTOR, SCRIPT_ID } from "./constants.js";

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

const createRelationsState = () => ({
  following: createEmptyRelationState(),
  followers: createEmptyRelationState(),
});

const getRelationDisplayState = (relations, relation, searchTerm) => {
  const relationState = relations[relation];
  const keyword = searchTerm.trim();
  if (relation === "following" && keyword) {
    return relationState.search;
  }
  return relationState;
};

const getRelationDisplayUsers = (relations, relation, searchTerm) => {
  const relationState = relations[relation];
  const keyword = searchTerm.trim().toLowerCase();
  if (!keyword) {
    return relationState.users;
  }
  if (relation === "following") {
    return relationState.search.users;
  }
  return relationState.users.filter((user) => user.name.toLowerCase().includes(keyword));
};

const updateRelationDisplayState = (relations, relation, useSearch, updater) => {
  const relationState = relations[relation];
  return {
    ...relations,
    [relation]: useSearch
      ? {
          ...relationState,
          search: updater(relationState.search),
        }
      : updater(relationState),
  };
};

export const ShareDialog = ({
  dialog,
  video,
  nav = null,
  sessions = [],
  status = "",
  error = "",
}) => {
  const bodyRef = useRef(null);
  const stateRef = useRef(null);
  const searchTimerRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const loadingKeysRef = useRef(new Set());
  const pendingScrollTopRef = useRef(null);
  const searchComposingRef = useRef({ value: false });
  const [activeTab, setActiveTab] = useState("recent");
  const [activeRelation, setActiveRelation] = useState("following");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [recent, setRecent] = useState({
    users: sessions,
    error: "",
    loading: false,
    loaded: sessions.length > 0,
  });
  const [relations, setRelations] = useState(createRelationsState);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [result, setResult] = useState(null);

  stateRef.current = {
    activeTab,
    activeRelation,
    searchTerm,
    relations,
    nav,
  };

  useEffect(() => {
    setRecent({
      users: sessions,
      error: "",
      loading: false,
      loaded: sessions.length > 0,
    });
    setSelectedUser(null);
    setSendError("");
    setResult(null);
  }, [sessions]);

  useEffect(() => {
    return () => {
      window.clearTimeout(searchTimerRef.current);
      loadMoreObserverRef.current?.disconnect();
    };
  }, []);

  useLayoutEffect(() => {
    const scrollTop = pendingScrollTopRef.current;
    if (scrollTop === null) {
      return;
    }
    pendingScrollTopRef.current = null;
    const scrollRoot = bodyRef.current?.querySelector(LIST_SCROLL_SELECTOR);
    if (scrollRoot) {
      scrollRoot.scrollTop = scrollTop;
    }
  }, [relations]);

  const resetSelection = () => {
    setSelectedUser(null);
    setSendError("");
  };

  const getListScrollTop = useCallback(
    () => bodyRef.current?.querySelector(LIST_SCROLL_SELECTOR)?.scrollTop ?? 0,
    []
  );

  const setDisplayState = useCallback((relation, useSearch, updater) => {
    setRelations((currentRelations) =>
      updateRelationDisplayState(currentRelations, relation, useSearch, updater)
    );
  }, []);

  const loadRelationUsers = useCallback(
    async (relation, { reset = false, keywordOverride = null } = {}) => {
      const current = stateRef.current;
      const keyword = (keywordOverride ?? current.searchTerm).trim();
      const useSearch = relation === "following" && Boolean(keyword);
      const relationState = current.relations[relation];
      const displayState = useSearch ? relationState.search : relationState;
      const loadingKey = `${relation}:${useSearch ? keyword : "list"}`;

      if (
        !current.nav ||
        loadingKeysRef.current.has(loadingKey) ||
        displayState.loading ||
        displayState.loadingMore ||
        (!reset && displayState.loaded && !displayState.hasMore)
      ) {
        return;
      }

      const nextPage = reset ? 1 : displayState.page + 1;
      const listScrollTop = !reset && displayState.loaded ? getListScrollTop() : null;
      pendingScrollTopRef.current = listScrollTop;
      loadingKeysRef.current.add(loadingKey);
      setDisplayState(relation, useSearch, (state) => ({
        ...state,
        loading: reset || !state.loaded,
        loadingMore: !(reset || !state.loaded),
        error: "",
        moreError: "",
        keyword: useSearch ? keyword : state.keyword,
      }));

      try {
        const loader = useSearch
          ? searchFollowings
          : relation === "following"
            ? getFollowings
            : getFollowers;
        const nextResult = await loader({
          mid: current.nav.mid,
          keyword,
          page: nextPage,
        });
        setDisplayState(relation, useSearch, (state) => ({
          ...state,
          users: nextPage === 1 ? nextResult.users : [...state.users, ...nextResult.users],
          page: nextPage,
          hasMore: nextResult.hasMore,
          loaded: true,
        }));
      } catch (loadError) {
        setDisplayState(relation, useSearch, (state) => {
          if (useSearch && nextPage === 1) {
            return {
              ...state,
              users: relationState.users.filter((user) =>
                user.name.toLowerCase().includes(keyword.toLowerCase())
              ),
              hasMore: false,
              loaded: true,
            };
          }
          if (nextPage === 1) {
            return {
              ...state,
              error: loadError.message,
            };
          }
          return {
            ...state,
            moreError: loadError.message,
          };
        });
      } finally {
        loadingKeysRef.current.delete(loadingKey);
        setDisplayState(relation, useSearch, (state) => ({
          ...state,
          loading: false,
          loadingMore: false,
        }));
      }
    },
    [getListScrollTop, setDisplayState]
  );

  useEffect(() => {
    loadMoreObserverRef.current?.disconnect();
    loadMoreObserverRef.current = null;
    if (activeTab !== "all") {
      return;
    }
    const displayState = getRelationDisplayState(relations, activeRelation, searchTerm);
    if (!displayState.hasMore || displayState.loading || displayState.loadingMore) {
      return;
    }
    const scrollRoot = bodyRef.current?.querySelector(LIST_SCROLL_SELECTOR);
    const sentinel = scrollRoot?.querySelector("[data-bili-share-to-friends-list-sentinel]");
    if (!scrollRoot || !sentinel) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadRelationUsers(activeRelation);
        }
      },
      { root: scrollRoot, threshold: 0.1 }
    );
    observer.observe(sentinel);
    loadMoreObserverRef.current = observer;
    return () => observer.disconnect();
  }, [activeRelation, activeTab, loadRelationUsers, relations, searchTerm]);

  const scheduleSearch = (value) => {
    const previousKeyword = searchTerm.trim();
    const nextKeyword = value.trim();
    setSearchTerm(value);
    if (previousKeyword === nextKeyword) {
      return;
    }
    if (previousKeyword || nextKeyword) {
      resetSelection();
    }
    window.clearTimeout(searchTimerRef.current);
    searchTimerRef.current = window.setTimeout(() => {
      const current = stateRef.current;
      if (current.activeTab !== "all") {
        return;
      }
      if (current.activeRelation === "following" && nextKeyword) {
        loadRelationUsers("following", { reset: true, keywordOverride: nextKeyword });
      }
    }, 300);
  };

  const handleSend = async () => {
    if (!selectedUser || sending) {
      return;
    }
    setSending(true);
    setSendError("");
    try {
      const login = await assertLogin();
      await sendVideoText({
        nav: login.nav,
        csrf: login.csrf,
        video,
        receiver: selectedUser,
      });
      setResult({
        message: `已将视频链接发送给 ${selectedUser.name}。`,
        isError: false,
      });
    } catch (sendErrorResult) {
      setSendError(sendErrorResult.message);
    } finally {
      setSending(false);
    }
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
      return (
        <>
          <StateView text={emptyText} />
          {showFooter ? (
            <UserList
              users={users}
              selectedMid={selectedUser?.mid}
              hasMore={hasMore}
              loadingMore={loadingMore}
              moreError={moreError}
              showFooter
              onRetry={onRetry}
              onSelect={(_button, user) => {
                setSendError("");
                setSelectedUser(user);
              }}
            />
          ) : null}
        </>
      );
    }
    return (
      <UserList
        users={users}
        selectedMid={selectedUser?.mid}
        hasMore={hasMore}
        loadingMore={loadingMore}
        moreError={moreError}
        showFooter={showFooter}
        onRetry={onRetry}
        onSelect={(_button, user) => {
          setSendError("");
          setSelectedUser(user);
        }}
      />
    );
  };

  const renderRelationContent = () => {
    const keyword = searchTerm.trim();
    const displayState = getRelationDisplayState(relations, activeRelation, searchTerm);

    return (
      <>
        <RelationFilter
          activeRelation={activeRelation}
          onChange={(relation) => {
            if (activeRelation === relation) {
              return;
            }
            resetSelection();
            setActiveRelation(relation);
            loadRelationUsers(relation);
          }}
        />
        <SearchBox
          value={searchTerm}
          notice={
            activeRelation === "followers" && keyword
              ? "粉丝搜索仅筛选已加载的用户，继续向下滚动可扩大搜索范围。"
              : ""
          }
          composing={searchComposingRef.current}
          onCompositionStart={() => window.clearTimeout(searchTimerRef.current)}
          onInput={scheduleSearch}
        />
        {displayState.loading ? (
          <StateView text="正在读取用户列表..." />
        ) : displayState.error ? (
          <StateView text={displayState.error} isError />
        ) : (
          renderUsers({
            users: getRelationDisplayUsers(relations, activeRelation, searchTerm),
            emptyText: activeRelation === "following" ? "暂无关注用户。" : "暂无粉丝用户。",
            hasMore: displayState.hasMore,
            loadingMore: displayState.loadingMore,
            moreError: displayState.moreError,
            showFooter: true,
            onRetry: () => loadRelationUsers(activeRelation),
          })
        )}
      </>
    );
  };

  const renderBody = () => {
    if (result) {
      return <StateView text={result.message} isError={result.isError} />;
    }
    if (status) {
      return <StateView text={status} />;
    }
    if (error) {
      return <StateView text={error} isError />;
    }
    return (
      <>
        {sendError ? <StateView text={sendError} isError /> : null}
        <RecipientTabs
          activeTab={activeTab}
          onChange={(tab) => {
            if (activeTab === tab) {
              return;
            }
            resetSelection();
            setActiveTab(tab);
            if (tab === "all") {
              loadRelationUsers(activeRelation);
            }
          }}
        />
        {activeTab === "recent"
          ? renderUsers({
              users: recent.users,
              emptyText: "暂无最近私信联系人。",
            })
          : renderRelationContent()}
      </>
    );
  };

  return (
    <div className={`${SCRIPT_ID}-dialog-content`}>
      <DialogHeader title="分享给 B站好友" disabled={sending} onClose={() => closeDialog(dialog)} />
      <VideoPreview video={video} />
      <div className={`${SCRIPT_ID}-body`} ref={bodyRef}>
        {renderBody()}
      </div>
      <DialogFooter
        result={Boolean(result)}
        sending={sending}
        canSend={Boolean(selectedUser)}
        onCancel={() => closeDialog(dialog)}
        onClose={() => closeDialog(dialog)}
        onSend={handleSend}
      />
    </div>
  );
};

const renderDialog = ({ dialog, video, nav = null, sessions = [], status = "", error = "" }) => {
  render(
    <ShareDialog
      dialog={dialog}
      video={video}
      nav={nav}
      sessions={sessions}
      status={status}
      error={error}
    />,
    dialog
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
