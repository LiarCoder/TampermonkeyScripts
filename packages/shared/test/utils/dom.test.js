import assert from "node:assert/strict";
import test from "node:test";

import { createElement, waitForElement } from "../../src/utils/dom.js";

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName.toUpperCase();
    this.innerText = "";
    this.innerHTML = "";
    this.className = "";
    this.attributes = new Map();
    this.dataset = {};
    this.children = [];
    this.listeners = new Map();
  }

  setAttribute(key, value) {
    this.attributes.set(key, value);
  }

  getAttribute(key) {
    return this.attributes.get(key);
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  addEventListener(name, handler, options) {
    this.listeners.set(name, { handler, options });
  }
}

const withDomGlobals = (globals, callback) => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  globalThis.document = globals.document;
  globalThis.window = globals.window;

  const restore = () => {
    globalThis.document = originalDocument;
    globalThis.window = originalWindow;
  };

  try {
    const result = callback();
    if (result && typeof result.then === "function") {
      return result.finally(restore);
    }
    restore();
    return result;
  } catch (error) {
    restore();
    throw error;
  }
};

test("创建元素时会应用文本、类名、属性和数据集", () => {
  const parent = new FakeElement("section");
  const child = new FakeElement("span");
  const document = {
    createElement: (tagName) => new FakeElement(tagName),
  };

  withDomGlobals({ document, window: {} }, () => {
    const element = createElement({
      parent,
      tagName: "button",
      text: "提交",
      className: "primary",
      attributes: {
        type: "button",
        ignored: null,
      },
      dataset: {
        id: 1,
        ignored: undefined,
      },
      children: [null, child],
      events: [{ name: "click", handler: () => "clicked", options: { once: true } }],
    });

    assert.equal(element.tagName, "BUTTON");
    assert.equal(element.innerText, "提交");
    assert.equal(element.className, "primary");
    assert.equal(element.getAttribute("type"), "button");
    assert.equal(element.getAttribute("ignored"), undefined);
    assert.equal(element.dataset.id, "1");
    assert.equal(element.dataset.ignored, undefined);
    assert.deepEqual(element.children, [child]);
    assert.deepEqual(parent.children, [element]);
    assert.equal(element.listeners.get("click").options.once, true);
  });
});

test("创建元素时会设置 HTML 内容", () => {
  const document = {
    createElement: (tagName) => new FakeElement(tagName),
  };

  withDomGlobals({ document, window: {} }, () => {
    const element = createElement({
      text: "纯文本",
      html: "<strong>HTML</strong>",
    });

    assert.equal(element.innerText, "纯文本");
    assert.equal(element.innerHTML, "<strong>HTML</strong>");
  });
});

test("创建元素时支持通过函数生成子节点", () => {
  const document = {
    createElement: (tagName) => new FakeElement(tagName),
  };

  withDomGlobals({ document, window: {} }, () => {
    const child = new FakeElement("span");
    const element = createElement({
      children: (created) => {
        assert.equal(created.tagName, "DIV");
        return [child];
      },
    });

    assert.deepEqual(element.children, [child]);
  });
});

test("等待元素时会立即返回已存在的元素", async () => {
  const existing = new FakeElement("div");
  const root = {
    querySelector: () => existing,
  };

  await assert.doesNotReject(async () => {
    assert.equal(await waitForElement(".target", { root }), existing);
  });
});

test("等待元素时会轮询等待后续出现的元素", async () => {
  const matched = new FakeElement("div");
  let calls = 0;
  const root = {
    querySelector: () => {
      calls += 1;
      return calls >= 3 ? matched : null;
    },
  };
  const window = {
    setInterval,
    clearInterval,
  };

  await withDomGlobals({ document: root, window }, async () => {
    assert.equal(await waitForElement(".target", { root, timeout: 50, interval: 1 }), matched);
  });
});

test("等待元素超时后会拒绝", async () => {
  const root = {
    querySelector: () => null,
  };
  const window = {
    setInterval,
    clearInterval,
  };

  await withDomGlobals({ document: root, window }, async () => {
    await assert.rejects(
      () => waitForElement(".missing", { root, timeout: 5, interval: 1 }),
      /Timed out waiting for element: \.missing/
    );
  });
});
