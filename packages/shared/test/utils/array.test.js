import assert from "node:assert/strict";
import test from "node:test";

import { compact, unique } from "../../src/utils/array.js";

test("数组压缩会移除数组中的假值", () => {
  assert.deepEqual(compact([0, 1, "", "a", false, true, null, undefined, Number.NaN]), [
    1,
    "a",
    true,
  ]);
});

test("数组压缩遇到非数组会返回空数组", () => {
  assert.deepEqual(compact(null), []);
  assert.deepEqual(compact(undefined), []);
  assert.deepEqual(compact("abc"), []);
  assert.deepEqual(compact({ length: 1 }), []);
});

test("数组压缩不会修改原数组", () => {
  const items = [0, "a", false, "b"];

  assert.deepEqual(compact(items), ["a", "b"]);
  assert.deepEqual(items, [0, "a", false, "b"]);
});

test("数组去重会保留第一次出现的顺序", () => {
  assert.deepEqual(unique(["a", "b", "a", "c", "b"]), ["a", "b", "c"]);
});

test("数组去重遇到非数组会返回空数组", () => {
  assert.deepEqual(unique(null), []);
  assert.deepEqual(unique("abc"), []);
});
