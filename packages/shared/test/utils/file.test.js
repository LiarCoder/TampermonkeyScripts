import assert from "node:assert/strict";
import test from "node:test";

import { readFileAsText } from "../../src/utils/file.js";

class FakeFileReader {
  constructor({ error = null, result = "" } = FakeFileReader.nextResult) {
    this.error = error;
    this.result = result;
    this.listeners = new Map();
  }

  addEventListener(name, handler) {
    this.listeners.set(name, handler);
  }

  readAsText(file) {
    this.file = file;
    const eventName = this.error ? "error" : "load";
    this.listeners.get(eventName)?.();
  }
}

test("读取文件文本成功时返回 FileReader 结果", async () => {
  FakeFileReader.nextResult = { result: "hello" };

  assert.equal(
    await readFileAsText({ name: "test.md" }, { fileReaderConstructor: FakeFileReader }),
    "hello"
  );
});

test("读取文件文本时会把空结果归一为空字符串", async () => {
  FakeFileReader.nextResult = { result: null };

  assert.equal(await readFileAsText({}, { fileReaderConstructor: FakeFileReader }), "");
});

test("读取文件文本失败时会拒绝", async () => {
  FakeFileReader.nextResult = { error: new Error("broken") };

  await assert.rejects(
    () => readFileAsText({}, { fileReaderConstructor: FakeFileReader }),
    /broken/
  );
});

test("读取文件文本缺少文件或 FileReader 时会拒绝", async () => {
  await assert.rejects(
    () => readFileAsText(null, { fileReaderConstructor: FakeFileReader }),
    /File is unavailable/
  );
  await assert.rejects(
    () => readFileAsText({}, { fileReaderConstructor: null }),
    /FileReader is unavailable/
  );
});
