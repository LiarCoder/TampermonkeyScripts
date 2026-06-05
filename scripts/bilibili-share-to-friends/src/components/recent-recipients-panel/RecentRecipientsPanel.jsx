import { useEffect, useState } from "preact/hooks";

import { getRecentSessions } from "../../api.js";
import { SCRIPT_ID, SESSION_LIMIT } from "../../constants.js";
import { StateView } from "../state-view/StateView.jsx";
import { UserList } from "../user-list/UserList.jsx";

/**
 * 渲染最近私信联系人列表。
 */
export const RecentRecipientsPanel = ({ active, selectedMids = [], onSelect }) => {
  const [recent, setRecent] = useState({
    users: [],
    error: "",
    loading: false,
    loaded: false,
  });

  useEffect(() => {
    if (!active || recent.loaded) {
      return;
    }

    let canceled = false;
    setRecent((state) => ({
      ...state,
      loading: true,
      error: "",
    }));

    getRecentSessions()
      .then((users) => {
        if (canceled) {
          return;
        }
        setRecent({
          users,
          error: "",
          loading: false,
          loaded: true,
        });
      })
      .catch((error) => {
        if (canceled) {
          return;
        }
        setRecent({
          users: [],
          error: error.message,
          loading: false,
          loaded: true,
        });
      });

    return () => {
      canceled = true;
    };
  }, [active, recent.loaded]);

  const renderContent = () => {
    if (recent.loading) {
      return <StateView text="正在读取最近私信联系人..." />;
    }
    if (recent.error) {
      return <StateView text={recent.error} isError />;
    }
    if (recent.users.length === 0) {
      return <StateView text="暂无最近私信联系人。" />;
    }
    return (
      <UserList
        users={recent.users}
        selectedMids={selectedMids}
        footerText={`最近聊天列表只展示 ${SESSION_LIMIT} 个`}
        onSelect={onSelect}
      />
    );
  };

  return (
    <div
      className={`${SCRIPT_ID}-tab-panel${active ? ` ${SCRIPT_ID}-tab-panel-active` : ""}`}
      aria-hidden={!active}
    >
      <div className={`${SCRIPT_ID}-panel`}>{renderContent()}</div>
    </div>
  );
};
