import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const tabs = [
  { value: "recent", label: "最近聊天" },
  { value: "all", label: "全部好友" },
];

/**
 * 渲染分享弹窗中的接收人来源标签页。
 */
export const RecipientTabs = ({ activeTab, onChange, hasSelection = false, onClearSelection }) => (
  <div className={`${SCRIPT_ID}-tabs`}>
    {tabs.map((tab) => (
      <button
        key={tab.value}
        className={`${SCRIPT_ID}-tab`}
        type="button"
        aria-selected={String(activeTab === tab.value)}
        onClick={() => onChange(tab.value)}
      >
        {tab.label}
      </button>
    ))}
    <button
      className={`${SCRIPT_ID}-clear-selection`}
      type="button"
      disabled={!hasSelection}
      onClick={onClearSelection}
    >
      清空所选
    </button>
  </div>
);
