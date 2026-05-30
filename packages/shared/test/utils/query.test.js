import assert from "node:assert/strict";
import test from "node:test";

import { buildQuery } from "../../src/utils/query.js";

test("查询构建会编码查询参数", () => {
  assert.equal(buildQuery({ keyword: "B 站", page: 1 }), "keyword=B+%E7%AB%99&page=1");
});

test("查询构建会跳过空字符串、空值和未定义值", () => {
  assert.equal(
    buildQuery({
      keyword: "test",
      empty: "",
      nil: null,
      optional: undefined,
    }),
    "keyword=test"
  );
});

test("查询构建会保留数字零和布尔假值", () => {
  assert.equal(buildQuery({ page: 0, enabled: false }), "page=0&enabled=false");
});

test("查询构建会按对象键顺序输出参数", () => {
  assert.equal(buildQuery({ b: 2, a: 1 }), "b=2&a=1");
});
