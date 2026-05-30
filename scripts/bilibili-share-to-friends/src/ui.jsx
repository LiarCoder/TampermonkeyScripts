import { render } from "preact";
import { useCallback, useEffect, useState } from "preact/hooks";

import {
  AllFriendsPanel,
  closeDialog,
  createDialog,
  createEntryButton as createShareEntryButton,
  DialogFooter,
  DialogHeader,
  RecentRecipientsPanel,
  RecipientTabs,
  StateView,
  VideoPreview,
} from "./components/index.js";
import { assertLogin, getVideoInfo } from "./api.js";
import { SCRIPT_ID } from "./constants.js";

export const ShareDialog = ({ dialog, video, nav = null, status = "", error = "" }) => {
  const [activeTab, setActiveTab] = useState("recent");
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    setSelectedUser(null);
    setSendError("");
    setSendResult(null);
  }, [video]);

  const handleClose = useCallback(() => closeDialog(dialog), [dialog]);

  const resetSelection = useCallback(() => {
    setSelectedUser(null);
    setSendError("");
  }, []);

  const handleTabChange = useCallback(
    (tab) => {
      if (activeTab === tab) {
        return;
      }
      resetSelection();
      setActiveTab(tab);
    },
    [activeTab, resetSelection]
  );

  const handleUserSelect = useCallback((_button, user) => {
    setSendError("");
    setSelectedUser(user);
  }, []);

  const handleSendSuccess = useCallback((nextResult) => {
    setSendError("");
    setSendResult(nextResult);
  }, []);

  const renderBody = () => {
    if (sendResult) {
      return <StateView text={sendResult.message} isError={sendResult.isError} />;
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
          active={activeTab === "recent"}
          selectedMid={selectedUser?.mid}
          onSelect={handleUserSelect}
        />
        <AllFriendsPanel
          active={activeTab === "all"}
          mid={nav?.mid}
          selectedMid={selectedUser?.mid}
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
        selectedUser={selectedUser}
        showCloseOnly={Boolean(sendResult)}
        onClose={handleClose}
        onSendingChange={setSending}
        onSendSuccess={handleSendSuccess}
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
