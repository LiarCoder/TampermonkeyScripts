import { render } from "preact";
import { useCallback, useEffect, useMemo, useState } from "preact/hooks";

import {
  AllFriendsPanel,
  closeDialog,
  createDialog,
  createEntryButton as createShareEntryButton,
  DialogFooter,
  DialogHeader,
  RecentRecipientsPanel,
  RecipientTabs,
  SendResultPanel,
  StateView,
  VideoPreview,
} from "./components/index.js";
import { assertLogin, getVideoInfo } from "./api.js";
import { MAX_SELECTED_USERS, SCRIPT_ID } from "./constants.js";

export const ShareDialog = ({ dialog, video, nav = null, status = "", error = "" }) => {
  const [activeTab, setActiveTab] = useState("recent");
  const [panelResetKey, setPanelResetKey] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendStage, setSendStage] = useState("selecting");
  const [sendResults, setSendResults] = useState([]);
  const selectedMids = useMemo(() => selectedUsers.map((user) => user.mid), [selectedUsers]);

  useEffect(() => {
    setActiveTab("recent");
    setPanelResetKey((key) => key + 1);
    setSelectedUsers([]);
    setSendError("");
    setSendStage("selecting");
    setSendResults([]);
  }, [video]);

  const handleClose = useCallback(() => closeDialog(dialog), [dialog]);

  const resetSelection = useCallback(() => {
    setSelectedUsers([]);
    setSendError("");
  }, []);

  const handleTabChange = useCallback(
    (tab) => {
      if (activeTab === tab) {
        return;
      }
      setActiveTab(tab);
    },
    [activeTab]
  );

  const handleUserSelect = useCallback((user) => {
    setSendError("");
    setSelectedUsers((currentUsers) => {
      if (currentUsers.some((currentUser) => String(currentUser.mid) === String(user.mid))) {
        return currentUsers.filter((currentUser) => String(currentUser.mid) !== String(user.mid));
      }
      return [...currentUsers, user];
    });
  }, []);

  const handleSendStart = useCallback((users) => {
    setSendError("");
    setSendStage("sending");
    setSendResults(
      users.map((user, index) => ({
        user,
        status: index === 0 ? "sending" : "pending",
        error: "",
      }))
    );
  }, []);

  const handleSendProgress = useCallback((nextResult) => {
    setSendResults((currentResults) =>
      currentResults.map((result) =>
        String(result.user.mid) === String(nextResult.user.mid)
          ? { ...result, ...nextResult }
          : result
      )
    );
  }, []);

  const handleSendComplete = useCallback(() => {
    setSendStage("result");
  }, []);

  const handleContinue = useCallback(() => {
    setActiveTab("recent");
    setPanelResetKey((key) => key + 1);
    setSelectedUsers([]);
    setSendError("");
    setSendStage("selecting");
    setSendResults([]);
  }, []);

  const renderBody = () => {
    if (sendStage !== "selecting") {
      return <SendResultPanel results={sendResults} />;
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
        <RecipientTabs activeTab={activeTab} onChange={handleTabChange} />
        <RecentRecipientsPanel
          key={`recent-${panelResetKey}`}
          active={activeTab === "recent"}
          selectedMids={selectedMids}
          onSelect={handleUserSelect}
        />
        <AllFriendsPanel
          key={`all-${panelResetKey}`}
          active={activeTab === "all"}
          mid={nav?.mid}
          selectedMids={selectedMids}
          onSelectionReset={resetSelection}
          onSelect={handleUserSelect}
        />
      </>
    );
  };

  return (
    <div className={`${SCRIPT_ID}-dialog-content`}>
      <DialogHeader title="分享给 B站好友" disabled={sending} onClose={handleClose} />
      <VideoPreview video={video} />
      <div className={`${SCRIPT_ID}-body`}>{renderBody()}</div>
      <DialogFooter
        video={video}
        maxSelectedUsers={MAX_SELECTED_USERS}
        selectedUsers={selectedUsers}
        sendStage={sendStage}
        onClose={handleClose}
        onContinue={handleContinue}
        onSendingChange={setSending}
        onSendStart={handleSendStart}
        onSendProgress={handleSendProgress}
        onSendComplete={handleSendComplete}
        onSendError={setSendError}
      />
    </div>
  );
};

const renderDialog = ({ dialog, video, nav = null, status = "", error = "" }) => {
  render(
    <ShareDialog dialog={dialog} video={video} nav={nav} status={status} error={error} />,
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
    status: "正在读取视频信息...",
  });
  if (!dialog.open) {
    dialog.showModal();
  }

  try {
    const { nav } = await assertLogin();
    const video = await getVideoInfo();
    if (!dialog.isConnected || !dialog.open) {
      return;
    }
    renderDialog({ dialog, video, nav });
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
