import { SCRIPT_ID } from "../../constants.js";
import { renderToElement } from "../../render.js";
import "./style.css";

const tabs = [
  { value: "recent", label: "最近聊天" },
  { value: "all", label: "全部好友" },
];

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

export const createRecipientTabs = ({ activeTab, onChange }) =>
  renderToElement(<RecipientTabs activeTab={activeTab} onChange={onChange} />);
