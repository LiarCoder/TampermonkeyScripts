import "./styles.css";

import { getBvidFromLocation } from "./api.js";
import { SHARE_BUTTONS_SELECTOR } from "./constants.js";
import { createEntryButton } from "./ui.jsx";

let currentBvid = "";

const findShareMethodContainer = () => {
  return document.querySelector(SHARE_BUTTONS_SELECTOR);
};

const injectEntry = () => {
  const container = findShareMethodContainer();
  if (!container) {
    return;
  }
  document.querySelectorAll("[data-bili-share-to-friends-entry]").forEach((entry) => {
    if (!container.contains(entry)) {
      entry.remove();
    }
  });
  if (container.querySelector("[data-bili-share-to-friends-entry]")) {
    return;
  }
  const entry = createEntryButton();
  container.appendChild(entry);
};

const handleRouteChange = () => {
  const nextBvid = getBvidFromLocation();
  if (nextBvid && nextBvid !== currentBvid) {
    currentBvid = nextBvid;
    injectEntry();
  }
};

const observePage = () => {
  const observer = new MutationObserver(() => {
    injectEntry();
    handleRouteChange();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  window.addEventListener("popstate", handleRouteChange);
  window.addEventListener("hashchange", handleRouteChange);
};

const init = () => {
  if (window.self !== window.top) {
    return;
  }
  currentBvid = getBvidFromLocation();
  injectEntry();
  observePage();
};

init();
