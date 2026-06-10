import { addStyle } from "@tampermonkey-scripts/shared";

import { initCreatePrChecker } from "./create-pr-checker.js";
import styles from "./styles.css?inline";
import { initTargetBranchChecker } from "./target-branch-checker.js";

const STYLE_ID = "pr-checker-style";

const isTopWindow = () => {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
};

const init = () => {
  if (!isTopWindow()) {
    return;
  }

  addStyle(styles, { id: STYLE_ID });
  initTargetBranchChecker();
  initCreatePrChecker();
};

init();
