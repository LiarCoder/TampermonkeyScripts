import { SCRIPT_ID } from "../../constants.js";
import { renderToElement } from "../../render.js";
import { UserListItem } from "../UserListItem/index.jsx";
import "./style.css";

export const UserListFooter = ({ loadingMore, hasMore, moreError, onRetry }) => (
  <div className={`${SCRIPT_ID}-list-footer`}>
    {moreError ? (
      <button className={`${SCRIPT_ID}-list-retry`} type="button" onClick={onRetry}>
        {moreError}，点击重试
      </button>
    ) : (
      <div>{loadingMore ? "正在加载更多..." : hasMore ? "" : "没有更多了"}</div>
    )}
  </div>
);

export const UserList = ({
  users,
  selectedMid = null,
  loadingMore = false,
  hasMore = false,
  moreError = "",
  showFooter = false,
  onRetry = () => {},
  onSelect,
}) => (
  <div className={`${SCRIPT_ID}-list-scroll`} data-bili-share-to-friends-list-scroll="true">
    <ul className={`${SCRIPT_ID}-list`}>
      {users.map((user) => (
        <li key={user.mid}>
          <UserListItem user={user} selected={user.mid === selectedMid} onSelect={onSelect} />
        </li>
      ))}
    </ul>
    {showFooter ? (
      <UserListFooter
        loadingMore={loadingMore}
        hasMore={hasMore}
        moreError={moreError}
        onRetry={onRetry}
      />
    ) : null}
    {showFooter && hasMore && !moreError ? (
      <div
        className={`${SCRIPT_ID}-list-sentinel`}
        data-bili-share-to-friends-list-sentinel="true"
      />
    ) : null}
  </div>
);

export const createUserList = (props) => renderToElement(<UserList {...props} />);
