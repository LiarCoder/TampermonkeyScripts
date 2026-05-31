import { DEFAULT_AVATAR_URL, SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * 渲染带用户主页链接的单个可选择用户行。
 */
export const UserListItem = ({ user, selected = false, onSelect }) => {
  return (
    <div
      className={`${SCRIPT_ID}-person`}
      data-selected={String(selected)}
      onClick={() => onSelect(user)}
    >
      <img
        className={`${SCRIPT_ID}-avatar`}
        src={user.avatar}
        alt=""
        referrerPolicy="no-referrer"
        onError={(event) => {
          if (event.currentTarget.dataset.fallbackApplied === "true") {
            return;
          }
          event.currentTarget.dataset.fallbackApplied = "true";
          event.currentTarget.src = DEFAULT_AVATAR_URL;
        }}
      />
      <div className={`${SCRIPT_ID}-person-main`}>
        <a
          className={`${SCRIPT_ID}-name`}
          href={`https://space.bilibili.com/${user.mid}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
        >
          {user.name}
        </a>
        <div className={`${SCRIPT_ID}-meta`}>{user.meta || `UID ${user.mid}`}</div>
      </div>
      <div className={`${SCRIPT_ID}-check`} />
    </div>
  );
};
