import assert from "node:assert/strict";
import test from "node:test";

import { buildRawScriptUrl, normalizeImageUrl } from "../../src/utils/url.js";

test("图片地址归一化会把协议相对地址补成安全协议", () => {
  assert.equal(normalizeImageUrl("//i0.hdslb.com/image.jpg"), "https://i0.hdslb.com/image.jpg");
});

test("图片地址归一化会把普通协议地址升级为安全协议", () => {
  assert.equal(
    normalizeImageUrl("http://i0.hdslb.com/image.jpg"),
    "https://i0.hdslb.com/image.jpg"
  );
});

test("图片地址归一化会保留安全协议地址", () => {
  assert.equal(
    normalizeImageUrl("https://i0.hdslb.com/image.jpg"),
    "https://i0.hdslb.com/image.jpg"
  );
});

test("图片地址归一化输入为空时返回空字符串", () => {
  assert.equal(normalizeImageUrl(""), "");
  assert.equal(normalizeImageUrl(null), "");
  assert.equal(normalizeImageUrl(undefined), "");
});

test("图片地址归一化会保留非网页协议地址", () => {
  assert.equal(normalizeImageUrl("data:image/png;base64,abc"), "data:image/png;base64,abc");
});

test("脚本发布地址会使用脚本名称拼接 GitHub Raw 路径", () => {
  assert.equal(
    buildRawScriptUrl("bilibili-share-to-friends"),
    "https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/bilibili-share-to-friends/dist/bilibili-share-to-friends.user.js"
  );
});

test("脚本发布地址会保留传入脚本名称的原始格式", () => {
  assert.equal(
    buildRawScriptUrl("JustJumpAhead"),
    "https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/JustJumpAhead/dist/JustJumpAhead.user.js"
  );
});
