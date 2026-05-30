import { useEffect, useLayoutEffect, useRef } from "preact/hooks";

import { SCRIPT_ID } from "../../constants.js";
import "./style.css";

/**
 * Renders an IME-safe search input for filtering relation users.
 */
export const SearchBox = ({
  value,
  placeholder = "搜索用户昵称",
  notice = "",
  onCompositionStart = () => {},
  onInput,
}) => {
  const inputRef = useRef(null);
  const composingRef = useRef(false);
  const lastCommittedValueRef = useRef(value ?? "");
  const latestCallbacksRef = useRef({ onCompositionStart, onInput });

  latestCallbacksRef.current = { onCompositionStart, onInput };

  useLayoutEffect(() => {
    if (composingRef.current) {
      return;
    }
    const nextValue = value ?? "";
    if (inputRef.current && inputRef.current.value !== nextValue) {
      inputRef.current.value = nextValue;
      lastCommittedValueRef.current = nextValue;
    }
  }, [value]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) {
      return () => {};
    }

    let compositionCommitTimer = null;

    const clearCompositionCommit = () => {
      window.clearTimeout(compositionCommitTimer);
      compositionCommitTimer = null;
    };

    const commitValue = (nextValue, options) => {
      if (lastCommittedValueRef.current === nextValue) {
        return;
      }
      lastCommittedValueRef.current = nextValue;
      latestCallbacksRef.current.onInput(nextValue, options);
    };

    const commitCurrentValue = (options) => {
      clearCompositionCommit();
      commitValue(input.value, options);
    };

    const scheduleCompositionCommit = () => {
      clearCompositionCommit();
      compositionCommitTimer = window.setTimeout(() => {
        commitCurrentValue({ immediate: true });
      }, 0);
    };

    // 在油猴脚本环境中，Preact composition 事件可能拿不到 IME 提交后的最终值。
    // 这里改用原生事件，并直接读取 DOM value。
    const handleCompositionStart = () => {
      clearCompositionCommit();
      composingRef.current = true;
      latestCallbacksRef.current.onCompositionStart();
    };

    const handleCompositionEnd = () => {
      composingRef.current = false;
      // 等浏览器先提交组合输入文本，再通知父级搜索逻辑。
      scheduleCompositionCommit();
    };

    const handleInput = (event) => {
      if (composingRef.current || event.isComposing) {
        return;
      }
      if (compositionCommitTimer) {
        return;
      }
      commitCurrentValue();
    };

    const handleChange = () => {
      if (!composingRef.current) {
        commitCurrentValue();
      }
    };

    const handleKeyUp = (event) => {
      if (!composingRef.current && !event.isComposing) {
        commitCurrentValue({ immediate: true });
      }
    };

    input.addEventListener("compositionstart", handleCompositionStart);
    input.addEventListener("compositionend", handleCompositionEnd);
    input.addEventListener("input", handleInput);
    input.addEventListener("change", handleChange);
    input.addEventListener("keyup", handleKeyUp);

    return () => {
      clearCompositionCommit();
      input.removeEventListener("compositionstart", handleCompositionStart);
      input.removeEventListener("compositionend", handleCompositionEnd);
      input.removeEventListener("input", handleInput);
      input.removeEventListener("change", handleChange);
      input.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div className={`${SCRIPT_ID}-search`}>
      <input
        ref={inputRef}
        className={`${SCRIPT_ID}-search-input`}
        type="search"
        defaultValue={value}
        placeholder={placeholder}
      />
      {notice ? <div className={`${SCRIPT_ID}-search-notice`}>{notice}</div> : null}
    </div>
  );
};
