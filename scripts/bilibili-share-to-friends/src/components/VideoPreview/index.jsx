import { useState } from "preact/hooks";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const VideoCover = ({ video }) => {
  const [loadFailed, setLoadFailed] = useState(false);
  if (!video?.pic || loadFailed) {
    return (
      <div className={`${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`}>
        {loadFailed ? "封面加载失败" : "读取中"}
      </div>
    );
  }
  return (
    <img
      className={`${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-img`}
      src={video.pic}
      alt=""
      referrerPolicy="no-referrer"
      onError={() => setLoadFailed(true)}
    />
  );
};

export const VideoPreview = ({ video }) => (
  <div className={`${SCRIPT_ID}-video`}>
    <VideoCover video={video} />
    <div>
      <p className={`${SCRIPT_ID}-video-title`}>{video?.title || "当前视频"}</p>
      <div className={`${SCRIPT_ID}-video-author`}>
        {video?.ownerName ? `UP主：${video.ownerName}` : ""}
      </div>
    </div>
  </div>
);
