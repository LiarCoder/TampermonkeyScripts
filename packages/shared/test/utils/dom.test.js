import assert from "node:assert/strict";
import test from "node:test";

import {
  createElement,
  createSvgElement,
  getDocumentMountTarget,
  isTopWindow,
  observeAttributeChange,
  waitForElement,
} from "../../src/utils/dom.js";

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
    this.observerOptions = null;
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

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
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

test("创建 SVG 元素时会应用属性并忽略空值", () => {
  const document = {
    createElementNS: (namespace, tagName) => {
      const element = new FakeElement(tagName);
      element.namespace = namespace;
      return element;
    },
  };

  withDomGlobals({ document, window: {} }, () => {
    const element = createSvgElement("path", {
      d: "M0 0H10",
      "stroke-width": 4,
      ignored: null,
    });

    assert.equal(element.tagName, "PATH");
    assert.equal(element.namespace, "http://www.w3.org/2000/svg");
    assert.equal(element.getAttribute("d"), "M0 0H10");
    assert.equal(element.getAttribute("stroke-width"), "4");
    assert.equal(element.getAttribute("ignored"), undefined);
  });
});

test("判断顶层窗口时会识别当前窗口", () => {
  const topWindow = {};
  const childWindow = {
    self: {},
    top: topWindow,
  };
  topWindow.self = topWindow;
  topWindow.top = topWindow;

  assert.equal(isTopWindow(topWindow), true);
  assert.equal(isTopWindow(childWindow), false);
});

test("判断顶层窗口时会处理跨域访问异常", () => {
  const windowRef = {
    self: {},
    get top() {
      throw new Error("Permission denied");
    },
  };

  assert.equal(isTopWindow(windowRef), false);
});

test("获取文档挂载目标时优先返回 body", () => {
  const body = new FakeElement("body");
  const documentElement = new FakeElement("html");

  assert.equal(getDocumentMountTarget({ body, documentElement }), body);
});

test("获取文档挂载目标时会回退到 documentElement", () => {
  const documentElement = new FakeElement("html");

  assert.equal(getDocumentMountTarget({ body: null, documentElement }), documentElement);
  assert.equal(getDocumentMountTarget(null), null);
});

test("观察属性变化时会调用回调并返回清理函数", () => {
  const input = new FakeElement("input");
  input.setAttribute("value", "main");
  let observedCallback = null;
  let disconnected = false;
  class FakeMutationObserver {
    constructor(callback) {
      observedCallback = callback;
    }

    observe(element, options) {
      element.observerOptions = options;
    }

    disconnect() {
      disconnected = true;
    }
  }
  let nextValue = "";

  const cleanup = observeAttributeChange(
    input,
    "value",
    (value, element) => {
      nextValue = value;
      assert.equal(element, input);
    },
    { observerConstructor: FakeMutationObserver }
  );

  assert.deepEqual(input.observerOptions, {
    attributes: true,
    attributeFilter: ["value"],
  });
  input.setAttribute("value", "develop");
  observedCallback();
  assert.equal(nextValue, "develop");

  cleanup();
  assert.equal(disconnected, true);
});

test("观察属性变化缺少依赖时返回空清理函数", () => {
  assert.doesNotThrow(() => observeAttributeChange(null, "value", () => {})());
  assert.doesNotThrow(() =>
    observeAttributeChange(new FakeElement("input"), "value", () => {}, {
      observerConstructor: null,
    })()
  );
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
