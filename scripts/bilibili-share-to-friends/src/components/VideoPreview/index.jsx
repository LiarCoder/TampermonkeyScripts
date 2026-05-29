import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const createCoverPlaceholder = (text) => {
  const placeholder = document.createElement("div");
  placeholder.className = `${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`;
  placeholder.innerText = text;
  return placeholder;
};

export const VideoCover = ({ video }) => {
  if (!video?.pic) {
    return <div className={`${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-placeholder`}>读取中</div>;
  }
  return (
    <img
      className={`${SCRIPT_ID}-cover ${SCRIPT_ID}-cover-img`}
      src={video.pic}
      alt=""
      referrerPolicy="no-referrer"
      onError={(event) => {
        event.currentTarget.replaceWith(createCoverPlaceholder("封面加载失败"));
      }}
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
