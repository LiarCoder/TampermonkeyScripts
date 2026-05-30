import assert from "node:assert/strict";
import test from "node:test";

import { debounce } from "../../src/utils/timing.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

test("防抖函数只会执行最后一次调度", async () => {
  const calls = [];
  const debounced = debounce((value) => calls.push(value), 5);

  debounced("first");
  debounced("second");
  await wait(10);

  assert.deepEqual(calls, ["second"]);
});

test("防抖函数会把参数透传给回调", async () => {
  const calls = [];
  const debounced = debounce((...args) => calls.push(args), 5);

  debounced("value", 1, true);
  await wait(10);

  assert.deepEqual(calls, [["value", 1, true]]);
});

test("防抖函数的取消方法会取消待执行回调", async () => {
  const calls = [];
  const debounced = debounce((value) => calls.push(value), 5);

  debounced("ignored");
  debounced.cancel();
  await wait(10);

  assert.deepEqual(calls, []);
});

test("防抖函数取消后仍可重新调度", async () => {
  const calls = [];
  const debounced = debounce((value) => calls.push(value), 5);

  debounced("ignored");
  debounced.cancel();
  debounced("next");
  await wait(10);

  assert.deepEqual(calls, ["next"]);
});
