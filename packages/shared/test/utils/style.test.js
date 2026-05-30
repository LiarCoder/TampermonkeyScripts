import assert from "node:assert/strict";
import test from "node:test";

import { addStyle } from "../../src/utils/style.js";

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.id = "";
    this.textContent = "";
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }
}

const withStyleGlobals = (globals, callback) => {
  const originalDocument = globalThis.document;
  const originalAddStyle = globalThis.GM_addStyle;
  globalThis.document = globals.document;
  if ("GM_addStyle" in globals) {
    globalThis.GM_addStyle = globals.GM_addStyle;
  } else {
    delete globalThis.GM_addStyle;
  }

  try {
    callback();
  } finally {
    globalThis.document = originalDocument;
    if (originalAddStyle === undefined) {
      delete globalThis.GM_addStyle;
    } else {
      globalThis.GM_addStyle = originalAddStyle;
    }
  }
};

test("样式注入在指定标识且节点已存在时会更新原节点", () => {
  const existing = new FakeElement("style");
  const target = new FakeElement("head");
  const document = {
    head: target,
    documentElement: new FakeElement("html"),
    getElementById: () => existing,
    createElement: () => new FakeElement("style"),
  };

  withStyleGlobals({ document }, () => {
    assert.equal(addStyle("body { color: red; }", { id: "app-style" }), existing);
  });

  assert.equal(existing.textContent, "body { color: red; }");
  assert.deepEqual(target.children, []);
});

test("样式注入在油猴接口可用时会调用油猴接口", () => {
  const document = {
    head: new FakeElement("head"),
    documentElement: new FakeElement("html"),
    getElementById: () => null,
    createElement: () => new FakeElement("style"),
  };
  let calledCss = "";

  withStyleGlobals(
    {
      document,
      GM_addStyle: (css) => {
        calledCss = css;
        return "gm-result";
      },
    },
    () => {
      assert.equal(addStyle(".app {}", { id: "app-style" }), "gm-result");
    }
  );

  assert.equal(calledCss, ".app {}");
});

test("样式注入会创建样式标签并追加到目标节点", () => {
  const target = new FakeElement("head");
  const document = {
    head: target,
    documentElement: new FakeElement("html"),
    getElementById: () => null,
    createElement: () => new FakeElement("style"),
  };

  withStyleGlobals({ document }, () => {
    const style = addStyle(".app {}", { id: "app-style", target });

    assert.equal(style.id, "app-style");
    assert.equal(style.textContent, ".app {}");
    assert.deepEqual(target.children, [style]);
  });
});

test("样式注入没有指定标识时不会查询已有节点", () => {
  const target = new FakeElement("head");
  let getElementByIdCalled = false;
  const document = {
    head: target,
    documentElement: new FakeElement("html"),
    getElementById: () => {
      getElementByIdCalled = true;
      return null;
    },
    createElement: () => new FakeElement("style"),
  };

  withStyleGlobals({ document }, () => {
    addStyle(".app {}", { target });
  });

  assert.equal(getElementByIdCalled, false);
  assert.equal(target.children.length, 1);
});
