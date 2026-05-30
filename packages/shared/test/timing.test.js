import assert from "node:assert/strict";
import test from "node:test";

import { debounce } from "../src/index.js";

const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

test("debounce runs only the last scheduled call", async () => {
  const calls = [];
  const debounced = debounce((value) => calls.push(value), 5);

  debounced("first");
  debounced("second");
  await wait(10);

  assert.deepEqual(calls, ["second"]);
});

test("debounce cancel prevents a pending call", async () => {
  const calls = [];
  const debounced = debounce((value) => calls.push(value), 5);

  debounced("ignored");
  debounced.cancel();
  await wait(10);

  assert.deepEqual(calls, []);
});
