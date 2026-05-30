import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const tabs = [
  { value: "recent", label: "最近聊天" },
  { value: "all", label: "全部好友" },
];

/**
 * Renders the recipient source tabs in the share dialog.
 */
export const RecipientTabs = ({ activeTab, onChange }) => (
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
  </div>
);
