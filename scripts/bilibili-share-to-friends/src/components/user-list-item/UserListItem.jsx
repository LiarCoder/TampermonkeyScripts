import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const isLinkTarget = (target) => target instanceof Element && Boolean(target.closest("a"));

export const UserListItem = ({ user, selected = false, onSelect }) => {
  const handleSelect = (event) => {
    if (isLinkTarget(event.target)) {
      return;
    }

    onSelect(event.currentTarget, user);
  };

  const handleKeyDown = (event) => {
    if (isLinkTarget(event.target) || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    onSelect(event.currentTarget, user);
  };

  return (
    <div
      className={`${SCRIPT_ID}-person`}
      role="button"
      tabIndex={0}
      aria-selected={String(selected)}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
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
          event.currentTarget.src = "https://static.hdslb.com/images/member/noface.gif";
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
