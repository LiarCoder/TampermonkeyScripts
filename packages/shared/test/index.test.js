import assert from "node:assert/strict";
import test from "node:test";

import * as shared from "../src/index.js";

test("统一入口导出所有工具函数", () => {
  assert.equal(typeof shared.compact, "function");
  assert.equal(typeof shared.getCookie, "function");
  assert.equal(typeof shared.createElement, "function");
  assert.equal(typeof shared.waitForElement, "function");
  assert.equal(typeof shared.md5, "function");
  assert.equal(typeof shared.httpRequest, "function");
  assert.equal(typeof shared.buildQuery, "function");
  assert.equal(typeof shared.onUrlChange, "function");
  assert.equal(typeof shared.createJsonStorage, "function");
  assert.equal(typeof shared.createTtlCache, "function");
  assert.equal(typeof shared.addStyle, "function");
  assert.equal(typeof shared.debounce, "function");
  assert.equal(typeof shared.normalizeImageUrl, "function");
});
