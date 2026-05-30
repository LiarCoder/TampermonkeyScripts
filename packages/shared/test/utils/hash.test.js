import assert from "node:assert/strict";
import test from "node:test";

import { md5 } from "../../src/utils/hash.js";

test("哈希计算会返回小写十六进制摘要", () => {
  assert.equal(md5("hello"), "5d41402abc4b2a76b9719d911017c592");
});

test("哈希计算支持空字符串", () => {
  assert.equal(md5(""), "d41d8cd98f00b204e9800998ecf8427e");
});

test("哈希计算支持中文和多字节字符", () => {
  assert.equal(md5("你好，B站"), "5c28b7fdbc5f8dfcd04774dc9bd6598e");
});

test("哈希计算对长文本返回稳定摘要", () => {
  assert.equal(md5("abc".repeat(1000)), "8f33d0ecfe648a745b169baf8a77658b");
});
