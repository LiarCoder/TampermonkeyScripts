import assert from "node:assert/strict";
import test from "node:test";

import { buildQuery, getCookie, httpRequest, md5, normalizeImageUrl } from "../src/index.js";

test("getCookie reads and decodes document cookies", () => {
  const originalDocument = globalThis.document;
  globalThis.document = {
    cookie: "theme=dark; token=a%20b",
  };

  try {
    assert.equal(getCookie("token"), "a b");
    assert.equal(getCookie("missing"), "");
  } finally {
    globalThis.document = originalDocument;
  }
});

test("normalizeImageUrl upgrades protocol-relative and http image URLs", () => {
  assert.equal(normalizeImageUrl("//i0.hdslb.com/image.jpg"), "https://i0.hdslb.com/image.jpg");
  assert.equal(
    normalizeImageUrl("http://i0.hdslb.com/image.jpg"),
    "https://i0.hdslb.com/image.jpg"
  );
  assert.equal(
    normalizeImageUrl("https://i0.hdslb.com/image.jpg"),
    "https://i0.hdslb.com/image.jpg"
  );
  assert.equal(normalizeImageUrl(""), "");
});

test("buildQuery skips empty values and encodes query params", () => {
  assert.equal(
    buildQuery({
      keyword: "B 站",
      page: 1,
      empty: "",
      missing: null,
      optional: undefined,
    }),
    "keyword=B+%E7%AB%99&page=1"
  );
});

test("md5 returns lowercase hex digest", () => {
  assert.equal(md5("hello"), "5d41402abc4b2a76b9719d911017c592");
});

test("httpRequest parses JSON response from GM_xmlhttpRequest", async () => {
  const originalRequest = globalThis.GM_xmlhttpRequest;
  globalThis.GM_xmlhttpRequest = (options) => {
    assert.equal(options.method, "POST");
    assert.equal(options.url, "https://example.com/api");
    assert.equal(options.withCredentials, true);
    assert.equal(options.timeout, 15000);
    options.onload({ responseText: '{"code":0,"data":{"ok":true}}' });
  };

  try {
    await assert.doesNotReject(async () => {
      const result = await httpRequest({
        method: "POST",
        url: "https://example.com/api",
        data: "payload",
      });
      assert.deepEqual(result, { code: 0, data: { ok: true } });
    });
  } finally {
    globalThis.GM_xmlhttpRequest = originalRequest;
  }
});

test("httpRequest rejects invalid JSON responses", async () => {
  const originalRequest = globalThis.GM_xmlhttpRequest;
  globalThis.GM_xmlhttpRequest = (options) => {
    options.onload({ responseText: "not json" });
  };

  try {
    await assert.rejects(() => httpRequest({ url: "https://example.com/api" }), /响应解析失败/);
  } finally {
    globalThis.GM_xmlhttpRequest = originalRequest;
  }
});
