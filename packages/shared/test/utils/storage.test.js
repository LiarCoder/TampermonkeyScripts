import assert from "node:assert/strict";
import test from "node:test";

import { createJsonStorage, createTtlCache } from "../../src/utils/storage.js";

const createMemoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

test("结构化存储会使用命名空间隔离键", () => {
  const storage = createMemoryStorage();
  const jsonStorage = createJsonStorage({ namespace: "script", storage });

  jsonStorage.set("sessions", [{ id: 1 }]);

  assert.equal(storage.getItem("sessions"), null);
  assert.equal(storage.getItem("script.sessions"), '[{"id":1}]');
  assert.deepEqual(jsonStorage.get("sessions"), [{ id: 1 }]);
});

test("结构化存储没有命名空间时使用原始键", () => {
  const storage = createMemoryStorage();
  const jsonStorage = createJsonStorage({ storage });

  jsonStorage.set("enabled", true);

  assert.equal(storage.getItem("enabled"), "true");
  assert.equal(jsonStorage.get("enabled"), true);
});

test("结构化存储读取缺失键时返回兜底值", () => {
  const storage = createMemoryStorage();
  const jsonStorage = createJsonStorage({ storage });

  assert.deepEqual(jsonStorage.get("missing", []), []);
});

test("结构化存储读取非法内容时返回兜底值", () => {
  const storage = createMemoryStorage();
  storage.setItem("broken", "{");
  const jsonStorage = createJsonStorage({ storage });

  assert.equal(jsonStorage.get("broken", "fallback"), "fallback");
});

test("结构化存储会删除指定键", () => {
  const storage = createMemoryStorage();
  const jsonStorage = createJsonStorage({ namespace: "script", storage });

  jsonStorage.set("enabled", true);
  jsonStorage.remove("enabled");

  assert.equal(storage.getItem("script.enabled"), null);
});

test("限时缓存会在有效期内返回缓存值", () => {
  const storage = createMemoryStorage();
  const cache = createTtlCache({ namespace: "script", ttl: 1000, storage });

  cache.set("sessions", ["cached"]);

  assert.deepEqual(cache.get("sessions", []), ["cached"]);
});

test("限时缓存会在过期后返回兜底值", () => {
  const storage = createMemoryStorage();
  const cache = createTtlCache({ namespace: "script", ttl: -1, storage });

  cache.set("sessions", ["expired"]);

  assert.deepEqual(cache.get("sessions", []), []);
});

test("限时缓存支持单次写入自定义有效期", () => {
  const storage = createMemoryStorage();
  const cache = createTtlCache({ namespace: "script", ttl: -1, storage });

  cache.set("sessions", ["cached"], 1000);

  assert.deepEqual(cache.get("sessions", []), ["cached"]);
});

test("限时缓存遇到异常缓存结构时返回兜底值", () => {
  const storage = createMemoryStorage();
  storage.setItem("script.sessions", JSON.stringify({ value: ["cached"] }));
  const cache = createTtlCache({ namespace: "script", ttl: 1000, storage });

  assert.deepEqual(cache.get("sessions", []), []);
});

test("限时缓存会删除指定缓存", () => {
  const storage = createMemoryStorage();
  const cache = createTtlCache({ namespace: "script", ttl: 1000, storage });

  cache.set("sessions", ["cached"]);
  cache.remove("sessions");

  assert.deepEqual(cache.get("sessions", []), []);
});
