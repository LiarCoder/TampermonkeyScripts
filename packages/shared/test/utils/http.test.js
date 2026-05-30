import assert from "node:assert/strict";
import test from "node:test";

import { httpRequest } from "../../src/utils/http.js";

const withRequest = async (handler, callback) => {
  const originalRequest = globalThis.GM_xmlhttpRequest;
  globalThis.GM_xmlhttpRequest = handler;

  try {
    await callback();
  } finally {
    globalThis.GM_xmlhttpRequest = originalRequest;
  }
};

test("请求工具会传递请求配置并解析响应", async () => {
  await withRequest(
    (options) => {
      assert.equal(options.method, "POST");
      assert.equal(options.url, "https://example.com/api");
      assert.equal(options.data, "payload");
      assert.deepEqual(options.headers, { "Content-Type": "text/plain" });
      assert.equal(options.withCredentials, true);
      assert.equal(options.timeout, 15000);
      options.onload({ responseText: '{"code":0,"data":{"ok":true}}' });
    },
    async () => {
      const result = await httpRequest({
        method: "POST",
        url: "https://example.com/api",
        data: "payload",
        headers: { "Content-Type": "text/plain" },
      });

      assert.deepEqual(result, { code: 0, data: { ok: true } });
    }
  );
});

test("请求工具默认使用读取方法、空请求体和空请求头", async () => {
  await withRequest(
    (options) => {
      assert.equal(options.method, "GET");
      assert.equal(options.url, "https://example.com/api");
      assert.equal(options.data, null);
      assert.deepEqual(options.headers, {});
      options.onload({ responseText: '{"ok":true}' });
    },
    async () => {
      assert.deepEqual(await httpRequest({ url: "https://example.com/api" }), { ok: true });
    }
  );
});

test("请求工具遇到非法响应内容会拒绝", async () => {
  await withRequest(
    (options) => {
      options.onload({ responseText: "not json" });
    },
    async () => {
      await assert.rejects(() => httpRequest({ url: "https://example.com/api" }), /响应解析失败/);
    }
  );
});

test("请求工具遇到网络错误会拒绝", async () => {
  await withRequest(
    (options) => {
      options.onerror();
    },
    async () => {
      await assert.rejects(() => httpRequest({ url: "https://example.com/api" }), /网络请求失败/);
    }
  );
});

test("请求工具遇到超时会拒绝", async () => {
  await withRequest(
    (options) => {
      options.ontimeout();
    },
    async () => {
      await assert.rejects(() => httpRequest({ url: "https://example.com/api" }), /网络请求超时/);
    }
  );
});
