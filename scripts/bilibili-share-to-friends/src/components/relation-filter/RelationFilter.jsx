import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

const relationOptions = [
  { value: "following", label: "我的关注" },
  { value: "followers", label: "我的粉丝" },
];

/**
 * Renders the following/follower relation switch.
 */
export const RelationFilter = ({ activeRelation, onChange }) => (
  <div className={`${SCRIPT_ID}-relation-filter`}>
    {relationOptions.map((option) => (
      <label key={option.value} className={`${SCRIPT_ID}-relation-option`}>
        <input
          type="radio"
          name={`${SCRIPT_ID}-relation`}
          value={option.value}
          checked={activeRelation === option.value}
          onChange={() => onChange(option.value)}
        />
        <span>{option.label}</span>
      </label>
    ))}
  </div>
);
