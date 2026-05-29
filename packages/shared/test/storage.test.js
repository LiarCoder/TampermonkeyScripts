import assert from "node:assert/strict";
import test from "node:test";

import { compact, createJsonStorage, createTtlCache } from "../src/index.js";

const createMemoryStorage = () => {
  const values = new Map();
  return {
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
};

test("compact removes falsy entries and ignores non-arrays", () => {
  assert.deepEqual(compact([0, "a", false, "b", null]), ["a", "b"]);
  assert.deepEqual(compact(null), []);
});

test("json storage namespaces values", () => {
  const storage = createMemoryStorage();
  const jsonStorage = createJsonStorage({ namespace: "script", storage });

  jsonStorage.set("sessions", [{ id: 1 }]);

  assert.equal(storage.getItem("sessions"), null);
  assert.deepEqual(jsonStorage.get("sessions"), [{ id: 1 }]);
});

test("ttl cache returns fallback after expiry", () => {
  const storage = createMemoryStorage();
  const cache = createTtlCache({ namespace: "script", ttl: -1, storage });

  cache.set("sessions", ["expired"]);

  assert.deepEqual(cache.get("sessions", []), []);
});
