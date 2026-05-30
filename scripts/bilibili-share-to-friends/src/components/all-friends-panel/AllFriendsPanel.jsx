import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";

import { getFollowers, getFollowings, searchFollowings } from "../../api.js";
import { LIST_SCROLL_SELECTOR } from "../../constants.js";
import { RelationFilter } from "../relation-filter/RelationFilter.jsx";
import { SearchBox } from "../search-box/SearchBox.jsx";
import { StateView } from "../state-view/StateView.jsx";
import { UserList } from "../user-list/UserList.jsx";

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

export const AllFriendsPanel = ({
  active,
  mid,
  selectedMid = null,
  onSelect,
  onSelectionReset = () => {},
}) => {
  const panelRef = useRef(null);
  const stateRef = useRef(null);
  const searchTimerRef = useRef(null);
  const loadMoreObserverRef = useRef(null);
  const loadingKeysRef = useRef(new Set());
  const pendingScrollTopRef = useRef(null);
  const searchComposingRef = useRef({ value: false });
  const [activeRelation, setActiveRelation] = useState("following");
  const [searchTerm, setSearchTerm] = useState("");
  const [relations, setRelations] = useState(createRelationsState);

  stateRef.current = {
    activeRelation,
    searchTerm,
    relations,
    mid,
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(searchTimerRef.current);
      loadMoreObserverRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    setActiveRelation("following");
    setSearchTerm("");
    setRelations(createRelationsState());
    onSelectionReset();
  }, [mid, onSelectionReset]);

  useLayoutEffect(() => {
    const scrollTop = pendingScrollTopRef.current;
    if (scrollTop === null) {
      return;
    }
    pendingScrollTopRef.current = null;
    const scrollRoot = panelRef.current?.querySelector(LIST_SCROLL_SELECTOR);
    if (scrollRoot) {
      scrollRoot.scrollTop = scrollTop;
    }
  }, [relations]);

  const getListScrollTop = useCallback(
    () => panelRef.current?.querySelector(LIST_SCROLL_SELECTOR)?.scrollTop ?? 0,
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
        !current.mid ||
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
          mid: current.mid,
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
    if (active) {
      loadRelationUsers(activeRelation);
    }
  }, [active, activeRelation, loadRelationUsers]);

  useEffect(() => {
    loadMoreObserverRef.current?.disconnect();
    loadMoreObserverRef.current = null;
    if (!active) {
      return;
    }
    const displayState = getRelationDisplayState(relations, activeRelation, searchTerm);
    if (!displayState.hasMore || displayState.loading || displayState.loadingMore) {
      return;
    }
    const scrollRoot = panelRef.current?.querySelector(LIST_SCROLL_SELECTOR);
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
  }, [active, activeRelation, loadRelationUsers, relations, searchTerm]);

  const resetSelection = () => {
    onSelectionReset();
  };

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
      if (current.activeRelation === "following" && nextKeyword) {
        loadRelationUsers("following", { reset: true, keywordOverride: nextKeyword });
      }
    }, 300);
  };

  const renderUsers = ({
    users,
    emptyText,
    hasMore = false,
    loadingMore = false,
    moreError = "",
    onRetry = () => {},
  }) => {
    const userList = (
      <UserList
        users={users}
        selectedMid={selectedMid}
        hasMore={hasMore}
        loadingMore={loadingMore}
        moreError={moreError}
        showFooter
        onRetry={onRetry}
        onSelect={onSelect}
      />
    );

    if (users.length === 0) {
      return (
        <>
          <StateView text={emptyText} />
          {userList}
        </>
      );
    }
    return userList;
  };

  if (!active) {
    return null;
  }

  const keyword = searchTerm.trim();
  const displayState = getRelationDisplayState(relations, activeRelation, searchTerm);

  return (
    <div ref={panelRef}>
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
          onRetry: () => loadRelationUsers(activeRelation),
        })
      )}
    </div>
  );
};
