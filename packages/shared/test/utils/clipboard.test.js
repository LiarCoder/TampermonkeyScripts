import assert from "node:assert/strict";
import test from "node:test";

import { copyTextToClipboard } from "../../src/utils/clipboard.js";

class FakeTextarea {
  constructor() {
    this.value = "";
    this.style = {
      cssText: "",
    };
    this.attributes = new Map();
    this.selected = false;
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }

  select() {
    this.selected = true;
  }
}

class FakeTarget {
  constructor() {
    this.children = [];
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    this.children = this.children.filter((item) => item !== child);
    return child;
  }
}

const createDocument = ({ execCommand = () => true, body = new FakeTarget() } = {}) => {
  const createdTextareas = [];
  const documentRef = {
    body,
    documentElement: new FakeTarget(),
    createElement: (tagName) => {
      assert.equal(tagName, "textarea");
      const textarea = new FakeTextarea();
      createdTextareas.push(textarea);
      return textarea;
    },
    execCommand,
  };

  return {
    createdTextareas,
    documentRef,
  };
};

test("现代 Clipboard API 可用时直接写入剪贴板", async () => {
  let copiedText = "";
  const navigatorRef = {
    clipboard: {
      writeText: async (text) => {
        copiedText = text;
      },
    },
  };
  const { createdTextareas, documentRef } = createDocument();

  await copyTextToClipboard("hello", { navigatorRef, documentRef });

  assert.equal(copiedText, "hello");
  assert.equal(createdTextareas.length, 0);
});

test("现代 Clipboard API 失败后会回退到 textarea 复制", async () => {
  const clipboardError = new Error("permission denied");
  const navigatorRef = {
    clipboard: {
      writeText: async () => {
        throw clipboardError;
      },
    },
  };
  const { createdTextareas, documentRef } = createDocument();

  await copyTextToClipboard("fallback text", { navigatorRef, documentRef });

  assert.equal(createdTextareas.length, 1);
  assert.equal(createdTextareas[0].value, "fallback text");
  assert.equal(createdTextareas[0].selected, true);
  assert.deepEqual(documentRef.body.children, []);
});

test("没有现代 Clipboard API 时会使用 textarea 复制", async () => {
  const { createdTextareas, documentRef } = createDocument();

  await copyTextToClipboard("legacy", { navigatorRef: {}, documentRef });

  assert.equal(createdTextareas.length, 1);
  assert.equal(createdTextareas[0].value, "legacy");
  assert.deepEqual(documentRef.body.children, []);
});

test("fallback 复制失败时仍会清理临时 textarea", async () => {
  const { documentRef } = createDocument({
    execCommand: () => {
      throw new Error("copy command failed");
    },
  });

  await assert.rejects(
    () => copyTextToClipboard("cleanup", { navigatorRef: {}, documentRef }),
    /copy command failed/
  );
  assert.deepEqual(documentRef.body.children, []);
});

test("所有复制方式失败时会拒绝并保留现代 API 错误", async () => {
  const clipboardError = new Error("clipboard failed");
  const navigatorRef = {
    clipboard: {
      writeText: async () => {
        throw clipboardError;
      },
    },
  };
  const { documentRef } = createDocument({
    execCommand: () => false,
  });

  await assert.rejects(
    async () => {
      await copyTextToClipboard("failed", { navigatorRef, documentRef });
    },
    (error) => {
      assert.match(error.message, /Clipboard fallback copy command failed/);
      assert.equal(error.clipboardError, clipboardError);
      return true;
    }
  );
  assert.deepEqual(documentRef.body.children, []);
});
