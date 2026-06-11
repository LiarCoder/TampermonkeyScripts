import { observeAttributeChange } from "@tampermonkey-scripts/shared";

const CONTINUE_BUTTON_ID = "show-create-pr-button";
const TARGET_BRANCH_INPUT_ID = "targetBranch-field";
const SOURCE_BRANCH_INPUT_ID = "sourceBranch-field";
const ILLEGAL_TARGET_BRANCHES = ["master", "main"];

const isIllegalTargetBranch = (targetBranch) =>
  ILLEGAL_TARGET_BRANCHES.some((illegalTargetBranch) => targetBranch.includes(illegalTargetBranch));

const showTargetBranchWarning = (targetBranch) => {
  const createPrButton = document.getElementById(CONTINUE_BUTTON_ID);
  if (!createPrButton || !isIllegalTargetBranch(targetBranch)) {
    return;
  }

  const warningTip = `目标分支不能为 ${targetBranch}`;
  const warningWrapper = document.querySelector(".pr-create-warning");
  const warningText = document.querySelector(".pr-create-warning-text");

  createPrButton.setAttribute("disabled", "");
  createPrButton.setAttribute("title", warningTip);
  warningWrapper?.classList.remove("hidden");

  if (warningText) {
    warningText.innerText = warningTip;
  }
};

const triggerTargetBranchWarning = (targetBranch, { immediate = false } = {}) => {
  window.setTimeout(
    () => {
      showTargetBranchWarning(targetBranch);
    },
    immediate ? 0 : 300
  );
};

const getTargetBranch = () => document.getElementById(TARGET_BRANCH_INPUT_ID)?.value ?? "";

const triggerCurrentTargetBranchWarning = ({ immediate = false } = {}) => {
  const targetBranch = getTargetBranch();
  if (targetBranch) {
    triggerTargetBranchWarning(targetBranch, { immediate });
  }
};

const observeInputValueChange = (input, onChange) => {
  observeAttributeChange(input, "value", () => {
    onChange(input.value);
  });
};

export const initTargetBranchChecker = () => {
  const targetBranchInput = document.getElementById(TARGET_BRANCH_INPUT_ID);
  const sourceBranchInput = document.getElementById(SOURCE_BRANCH_INPUT_ID);
  if (!targetBranchInput) {
    return;
  }

  triggerCurrentTargetBranchWarning({ immediate: true });
  observeInputValueChange(targetBranchInput, (targetBranch) => {
    if (targetBranch) {
      triggerTargetBranchWarning(targetBranch);
    }
  });

  if (sourceBranchInput) {
    observeInputValueChange(sourceBranchInput, () => {
      triggerCurrentTargetBranchWarning();
    });
  }
};
