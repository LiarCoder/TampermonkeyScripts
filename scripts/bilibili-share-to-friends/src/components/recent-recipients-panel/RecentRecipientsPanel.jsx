import { useEffect, useState } from "preact/hooks";

import { getRecentSessions } from "../../api.js";
import { StateView } from "../state-view/StateView.jsx";
import { UserList } from "../user-list/UserList.jsx";

/**
 * Renders recently contacted private message recipients.
 */
export const RecentRecipientsPanel = ({ active, selectedMid = null, onSelect }) => {
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

  if (!active) {
    return null;
  }
  if (recent.loading) {
    return <StateView text="正在读取最近私信联系人..." />;
  }
  if (recent.error) {
    return <StateView text={recent.error} isError />;
  }
  if (recent.users.length === 0) {
    return <StateView text="暂无最近私信联系人。" />;
  }
  return <UserList users={recent.users} selectedMid={selectedMid} onSelect={onSelect} />;
};
