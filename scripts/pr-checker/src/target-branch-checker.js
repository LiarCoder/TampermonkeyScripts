import { debounce } from "@tampermonkey-scripts/shared";

const CONTINUE_BUTTON_ID = "show-create-pr-button";
const TARGET_BRANCH_INPUT_ID = "targetBranch-field";
const ILLEGAL_TARGET_BRANCHES = ["master", "main"];
const WARNING_TEXT_PREFIX = "目标分支不能为";
const CHECK_DELAY = 300;
const OBSERVER_DEBOUNCE_DELAY = 80;
const BLOCKED_DATA_KEY = "prCheckerTargetBranchBlocked";

const isIllegalTargetBranch = (targetBranch) =>
  ILLEGAL_TARGET_BRANCHES.some((illegalTargetBranch) => targetBranch.includes(illegalTargetBranch));

const getTargetBranchInput = () => document.getElementById(TARGET_BRANCH_INPUT_ID);

const getContinueButton = () => document.getElementById(CONTINUE_BUTTON_ID);

const getTargetBranch = () => getTargetBranchInput()?.value ?? "";

const showTargetBranchWarning = (targetBranch) => {
  const createPrButton = getContinueButton();
  if (!createPrButton) {
    return;
  }

  const warningTip = `目标分支不能为 ${targetBranch}`;
  const warningWrapper = document.querySelector(".pr-create-warning");
  const warningText = document.querySelector(".pr-create-warning-text");

  if (!createPrButton.hasAttribute("disabled")) {
    createPrButton.setAttribute("disabled", "");
  }
  if (createPrButton.getAttribute("title") !== warningTip) {
    createPrButton.setAttribute("title", warningTip);
  }
  createPrButton.dataset[BLOCKED_DATA_KEY] = "true";
  warningWrapper?.classList.remove("hidden");

  if (warningText && warningText.innerText !== warningTip) {
    warningText.innerText = warningTip;
  }
};

const clearTargetBranchWarning = () => {
  const createPrButton = getContinueButton();
  if (!createPrButton || createPrButton.dataset[BLOCKED_DATA_KEY] !== "true") {
    return;
  }

  createPrButton.removeAttribute("disabled");
  if (createPrButton.getAttribute("title")?.startsWith(WARNING_TEXT_PREFIX)) {
    createPrButton.removeAttribute("title");
  }
  delete createPrButton.dataset[BLOCKED_DATA_KEY];

  const warningWrapper = document.querySelector(".pr-create-warning");
  const warningText = document.querySelector(".pr-create-warning-text");
  if (warningText?.innerText.startsWith(WARNING_TEXT_PREFIX)) {
    warningText.innerText = "";
    warningWrapper?.classList.add("hidden");
  }
};

const checkTargetBranch = () => {
  const targetBranch = getTargetBranch();
  if (!targetBranch) {
    return;
  }

  if (isIllegalTargetBranch(targetBranch)) {
    showTargetBranchWarning(targetBranch);
    return;
  }

  clearTargetBranchWarning();
};

const triggerTargetBranchCheck = ({ immediate = false } = {}) => {
  window.setTimeout(
    () => {
      checkTargetBranch();
    },
    immediate ? 0 : CHECK_DELAY
  );
};

const observeTargetBranch = () => {
  if (typeof MutationObserver !== "function") {
    return;
  }

  const debouncedCheck = debounce(() => {
    triggerTargetBranchCheck();
  }, OBSERVER_DEBOUNCE_DELAY);
  const observer = new MutationObserver(() => {
    debouncedCheck();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "disabled", "title", "value"],
    childList: true,
    subtree: true,
  });
};

export const initTargetBranchChecker = () => {
  triggerTargetBranchCheck({ immediate: true });
  observeTargetBranch();
  document.addEventListener("input", () => triggerTargetBranchCheck());
  document.addEventListener("change", () => triggerTargetBranchCheck());
};
