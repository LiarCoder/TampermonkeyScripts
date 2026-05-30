import assert from "node:assert/strict";
import test from "node:test";

import { getCookie } from "../../src/utils/cookie.js";

const withDocumentCookie = (cookie, callback) => {
  const originalDocument = globalThis.document;
  globalThis.document = { cookie };

  try {
    callback();
  } finally {
    globalThis.document = originalDocument;
  }
};

test("读取 cookie 时会解码指定值", () => {
  withDocumentCookie("theme=dark; token=a%20b", () => {
    assert.equal(getCookie("token"), "a b");
  });
});

test("读取 cookie 时会忽略名称前后的空格", () => {
  withDocumentCookie("theme=dark; token=value", () => {
    assert.equal(getCookie("token"), "value");
  });
});

test("读取 cookie 找不到指定值时返回空字符串", () => {
  withDocumentCookie("theme=dark", () => {
    assert.equal(getCookie("token"), "");
  });
});

test("读取 cookie 时不会把同前缀名称当成命中项", () => {
  withDocumentCookie("token_extra=wrong; token=right", () => {
    assert.equal(getCookie("token"), "right");
  });
});
