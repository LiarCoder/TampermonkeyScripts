import assert from "node:assert/strict";
import test from "node:test";

import { onUrlChange } from "../../src/utils/route.js";

const createRouteGlobals = (initialUrl = "https://example.com/a") => {
  const listeners = new Map();
  const originalMethods = {};
  const location = { href: initialUrl };
  const history = {
    pushState(...args) {
      originalMethods.pushState?.(...args);
    },
    replaceState(...args) {
      originalMethods.replaceState?.(...args);
    },
  };
  const window = {
    addEventListener(name, handler) {
      listeners.set(name, handler);
    },
    removeEventListener(name, handler) {
      if (listeners.get(name) === handler) {
        listeners.delete(name);
      }
    },
    setTimeout(callback) {
      callback();
      return 1;
    },
  };

  return {
    history,
    listeners,
    location,
    originalMethods,
    window,
  };
};

const withRouteGlobals = (globals, callback) => {
  const originalHistory = globalThis.history;
  const originalLocation = globalThis.location;
  const originalWindow = globalThis.window;
  globalThis.history = globals.history;
  globalThis.location = globals.location;
  globalThis.window = globals.window;

  try {
    callback();
  } finally {
    globalThis.history = originalHistory;
    globalThis.location = originalLocation;
    globalThis.window = originalWindow;
  }
};

test("地址变化订阅可在订阅时立即触发", () => {
  const globals = createRouteGlobals();
  const calls = [];

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange((event) => calls.push(event), { fireImmediately: true });
    cleanup();
  });

  assert.deepEqual(calls, [{ url: "https://example.com/a", previousUrl: "" }]);
});

test("地址变化订阅会监听新增历史记录导致的地址变化", () => {
  const globals = createRouteGlobals();
  const calls = [];

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange((event) => calls.push(event));
    globals.location.href = "https://example.com/b";
    history.pushState({}, "", "/b");
    cleanup();
  });

  assert.deepEqual(calls, [{ url: "https://example.com/b", previousUrl: "https://example.com/a" }]);
});

test("地址变化订阅会监听替换历史记录导致的地址变化", () => {
  const globals = createRouteGlobals();
  const calls = [];

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange((event) => calls.push(event));
    globals.location.href = "https://example.com/c";
    history.replaceState({}, "", "/c");
    cleanup();
  });

  assert.deepEqual(calls, [{ url: "https://example.com/c", previousUrl: "https://example.com/a" }]);
});

test("地址变化订阅会监听前进后退和哈希变化", () => {
  const globals = createRouteGlobals();
  const calls = [];

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange((event) => calls.push(event));
    globals.location.href = "https://example.com/back";
    globals.listeners.get("popstate")();
    globals.location.href = "https://example.com/back#hash";
    globals.listeners.get("hashchange")();
    cleanup();
  });

  assert.deepEqual(calls, [
    { url: "https://example.com/back", previousUrl: "https://example.com/a" },
    { url: "https://example.com/back#hash", previousUrl: "https://example.com/back" },
  ]);
});

test("地址变化订阅在地址未变化时不会触发回调", () => {
  const globals = createRouteGlobals();
  const calls = [];

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange((event) => calls.push(event));
    history.pushState({}, "", "/a");
    globals.listeners.get("popstate")();
    cleanup();
  });

  assert.deepEqual(calls, []);
});

test("地址变化订阅清理后会还原历史方法并移除监听器", () => {
  const globals = createRouteGlobals();
  const originalPushState = globals.history.pushState;
  const originalReplaceState = globals.history.replaceState;

  withRouteGlobals(globals, () => {
    const cleanup = onUrlChange(() => {});
    cleanup();
  });

  assert.equal(globals.history.pushState, originalPushState);
  assert.equal(globals.history.replaceState, originalReplaceState);
  assert.equal(globals.listeners.size, 0);
});
