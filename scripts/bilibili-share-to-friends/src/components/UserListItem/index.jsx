import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const UserListItem = ({ user, selected = false, onSelect }) => (
  <button
    className={`${SCRIPT_ID}-person`}
    type="button"
    aria-selected={String(selected)}
    onClick={(event) => onSelect(event.currentTarget, user)}
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
    <div>
      <div className={`${SCRIPT_ID}-name`}>{user.name}</div>
      <div className={`${SCRIPT_ID}-meta`}>{user.meta || `UID ${user.mid}`}</div>
    </div>
    <div className={`${SCRIPT_ID}-check`} />
  </button>
);
