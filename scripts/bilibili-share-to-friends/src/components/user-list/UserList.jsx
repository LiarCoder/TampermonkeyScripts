import { SCRIPT_ID } from "../../constants.js";
import { UserListItem } from "../user-list-item/UserListItem.jsx";
import "./style.css";

/**
 * 渲染关系用户列表的分页状态底部区域。
 */
export const UserListFooter = ({ loadingMore, hasMore, moreError, footerText, onRetry }) => (
  <div className={`${SCRIPT_ID}-list-footer`}>
    {moreError ? (
      <button className={`${SCRIPT_ID}-list-retry`} type="button" onClick={onRetry}>
        {moreError}，点击重试
      </button>
    ) : (
      <div>{footerText || (loadingMore ? "正在加载更多..." : hasMore ? "" : "没有更多了")}</div>
    )}
  </div>
);

/**
 * 渲染可选择的 B 站用户列表，并可附带滚动分页底部区域。
 */
export const UserList = ({
  users,
  selectedMid = null,
  loadingMore = false,
  hasMore = false,
  moreError = "",
  footerText = "",
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
    {showFooter || footerText ? (
      <UserListFooter
        loadingMore={loadingMore}
        hasMore={hasMore}
        moreError={moreError}
        footerText={footerText}
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
