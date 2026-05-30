import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

export const SearchBox = ({
  value,
  placeholder = "搜索用户昵称",
  notice = "",
  onCompositionStart = () => {},
  onInput,
  composing = { value: false },
}) => {
  return (
    <div className={`${SCRIPT_ID}-search`}>
      <input
        className={`${SCRIPT_ID}-search-input`}
        type="search"
        value={value}
        placeholder={placeholder}
        onCompositionStart={() => {
          composing.value = true;
          onCompositionStart();
        }}
        onCompositionEnd={(event) => {
          composing.value = false;
          onInput(event.currentTarget.value);
        }}
        onInput={(event) => {
          if (composing.value || event.isComposing) {
            return;
          }
          onInput(event.currentTarget.value);
        }}
      />
      {notice ? <div className={`${SCRIPT_ID}-search-notice`}>{notice}</div> : null}
    </div>
  );
};
