import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";

import { getFollowers, getFollowings, searchFollowings } from "../../api.js";
import { LIST_SCROLL_SELECTOR } from "../../constants.js";
import { RelationFilter } from "../relation-filter/RelationFilter.jsx";
import { SearchBox } from "../search-box/SearchBox.jsx";
import { StateView } from "../state-view/StateView.jsx";
import { UserList } from "../user-list/UserList.jsx";

const createPageState = () => ({
  users: [],
  page: 0,
  hasMore: true,
  loadingPage: 0,
  moreError: "",
  error: "",
  loaded: false,
});

const createRelationsState = () => ({
  following: createPageState(),
  followers: createPageState(),
});

const getPageLoadingState = (state) => ({
  loading: state.loadingPage > 0 && (state.loadingPage === 1 || !state.loaded),
  loadingMore: state.loadingPage > 0 && state.loaded && state.loadingPage > 1,
});

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
  const [followingSearch, setFollowingSearch] = useState(createPageState);
  const keyword = searchTerm.trim();
  const normalizedKeyword = keyword.toLowerCase();
  const displaySource =
    activeRelation === "following" && keyword ? "followingSearch" : activeRelation;
  const relationState = relations[activeRelation];
  const displayState = useMemo(() => {
    if (displaySource === "followingSearch") {
      return followingSearch;
    }
    return relationState;
  }, [displaySource, followingSearch, relationState]);
  const displayLoading = useMemo(() => getPageLoadingState(displayState), [displayState]);
  const displayUsers = useMemo(() => {
    if (!normalizedKeyword) {
      return relationState.users;
    }
    if (activeRelation === "following") {
      return followingSearch.users;
    }
    return relationState.users.filter((user) =>
      user.name.toLowerCase().includes(normalizedKeyword)
    );
  }, [activeRelation, followingSearch.users, normalizedKeyword, relationState]);

  stateRef.current = {
    activeRelation,
    searchTerm,
    relations,
    followingSearch,
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
    setFollowingSearch(createPageState());
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

  const setPageState = useCallback((source, updater) => {
    if (source === "followingSearch") {
      setFollowingSearch(updater);
      return;
    }
    setRelations((currentRelations) => ({
      ...currentRelations,
      [source]: updater(currentRelations[source]),
    }));
  }, []);

  const loadRelationUsers = useCallback(
    async (relation, { reset = false, keywordOverride = null } = {}) => {
      const current = stateRef.current;
      const keyword = (keywordOverride ?? current.searchTerm).trim();
      const useSearch = relation === "following" && Boolean(keyword);
      const source = useSearch ? "followingSearch" : relation;
      const relationState = current.relations[relation];
      const displayState = useSearch ? current.followingSearch : relationState;
      const loadingState = getPageLoadingState(displayState);
      const loadingKey = `${relation}:${useSearch ? keyword : "list"}`;

      if (
        !current.mid ||
        loadingKeysRef.current.has(loadingKey) ||
        loadingState.loading ||
        loadingState.loadingMore ||
        (!reset && displayState.loaded && !displayState.hasMore)
      ) {
        return;
      }

      const nextPage = reset ? 1 : displayState.page + 1;
      const listScrollTop = !reset && displayState.loaded ? getListScrollTop() : null;
      pendingScrollTopRef.current = listScrollTop;
      loadingKeysRef.current.add(loadingKey);
      setPageState(source, (state) => ({
        ...state,
        loadingPage: nextPage,
        error: "",
        moreError: "",
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
        setPageState(source, (state) => ({
          ...state,
          users: nextPage === 1 ? nextResult.users : [...state.users, ...nextResult.users],
          page: nextPage,
          hasMore: nextResult.hasMore,
          loaded: true,
        }));
      } catch (loadError) {
        setPageState(source, (state) => {
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
        setPageState(source, (state) => ({
          ...state,
          loadingPage: 0,
        }));
      }
    },
    [getListScrollTop, setPageState]
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
    if (!displayState.hasMore || displayLoading.loading || displayLoading.loadingMore) {
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
  }, [
    active,
    activeRelation,
    displayLoading.loading,
    displayLoading.loadingMore,
    displayState.hasMore,
    loadRelationUsers,
  ]);

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

  if (!active) {
    return null;
  }

  const emptyText = activeRelation === "following" ? "暂无关注用户。" : "暂无粉丝用户。";
  const renderListContent = () => {
    if (displayLoading.loading) {
      return <StateView text="正在读取用户列表..." />;
    }
    if (displayState.error) {
      return <StateView text={displayState.error} isError />;
    }
    if (displayUsers.length === 0) {
      return <StateView text={emptyText} />;
    }
    return (
      <UserList
        users={displayUsers}
        selectedMid={selectedMid}
        hasMore={displayState.hasMore}
        loadingMore={displayLoading.loadingMore}
        moreError={displayState.moreError}
        showFooter
        onRetry={() => loadRelationUsers(activeRelation)}
        onSelect={onSelect}
      />
    );
  };

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
      {renderListContent()}
    </div>
  );
};
