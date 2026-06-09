import "./styles.css";

import { getVideoRouteKey } from "./api.js";
import { BANGUMI_SHARE_BUTTONS_SELECTOR, VIDEO_SHARE_BUTTONS_SELECTOR } from "./constants.js";
import { createEntryButton } from "./ui.jsx";

let currentVideoRouteKey = "";

const isBangumiPlayPage = () => location.pathname.startsWith("/bangumi/play/");

const findShareMethodContainer = () => {
  const selectors = isBangumiPlayPage()
    ? [BANGUMI_SHARE_BUTTONS_SELECTOR, VIDEO_SHARE_BUTTONS_SELECTOR]
    : [VIDEO_SHARE_BUTTONS_SELECTOR, BANGUMI_SHARE_BUTTONS_SELECTOR];

  for (const selector of selectors) {
    const container = document.querySelector(selector);
    if (container) {
      return container;
    }
  }

  return null;
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
  const nextVideoRouteKey = getVideoRouteKey();
  if (nextVideoRouteKey && nextVideoRouteKey !== currentVideoRouteKey) {
    currentVideoRouteKey = nextVideoRouteKey;
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
  currentVideoRouteKey = getVideoRouteKey();
  injectEntry();
  observePage();
};

init();
