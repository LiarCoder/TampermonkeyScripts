import { addStyle, isTopWindow } from "@tampermonkey-scripts/shared";

import { initCreatePrChecker } from "./create-pr-checker.js";
import styles from "./styles.css?inline";
import { initTargetBranchChecker } from "./target-branch-checker.js";

const STYLE_ID = "pr-checker-style";

const init = () => {
  if (!isTopWindow()) {
    return;
  }

  addStyle(styles, { id: STYLE_ID });
  initTargetBranchChecker();
  initCreatePrChecker();
};

init();
