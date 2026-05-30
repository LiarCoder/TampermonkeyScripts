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
  const [result, setResult] = useState(null);

  useEffect(() => {
    setSelectedUser(null);
    setSendError("");
    setResult(null);
  }, [video]);

  const resetSelection = useCallback(() => {
    setSelectedUser(null);
    setSendError("");
  }, []);

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
          }}
        />
        <RecentRecipientsPanel
          active={activeTab === "recent"}
          selectedMid={selectedUser?.mid}
          onSelect={(_button, user) => {
            setSendError("");
            setSelectedUser(user);
          }}
        />
        <AllFriendsPanel
          active={activeTab === "all"}
          mid={nav?.mid}
          selectedMid={selectedUser?.mid}
          onSelectionReset={resetSelection}
          onSelect={(_button, user) => {
            setSendError("");
            setSelectedUser(user);
          }}
        />
      </>
    );
  };

  return (
    <div className={`${SCRIPT_ID}-dialog-content`}>
      <DialogHeader title="分享给 B站好友" disabled={sending} onClose={() => closeDialog(dialog)} />
      <VideoPreview video={video} />
      <div className={`${SCRIPT_ID}-body`}>{renderBody()}</div>
      <DialogFooter
        video={video}
        selectedUser={selectedUser}
        showCloseOnly={Boolean(result)}
        onClose={() => closeDialog(dialog)}
        onSendingChange={setSending}
        onSendSuccess={setResult}
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
