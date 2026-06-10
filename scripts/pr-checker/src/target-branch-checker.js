const CONTINUE_BUTTON_ID = "show-create-pr-button";
const TARGET_BRANCH_INPUT_ID = "targetBranch-field";
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

const observeTargetBranch = (targetBranchInput) => {
  if (typeof MutationObserver !== "function") {
    return;
  }

  const observer = new MutationObserver(() => {
    const targetBranch = targetBranchInput.value;
    if (targetBranch) {
      triggerTargetBranchWarning(targetBranch);
    }
  });
  observer.observe(targetBranchInput, {
    attributes: true,
    attributeFilter: ["value"],
  });
};

export const initTargetBranchChecker = () => {
  const targetBranchInput = document.getElementById(TARGET_BRANCH_INPUT_ID);
  if (!targetBranchInput) {
    return;
  }

  triggerTargetBranchWarning(targetBranchInput.value, { immediate: true });
  observeTargetBranch(targetBranchInput);
};
