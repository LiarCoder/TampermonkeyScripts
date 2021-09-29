/*
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-29 19:12:14
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-09-30 00:31:01
 */
// ==UserScript==
// @name         JustJumpAhead
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  自动完成掘金、简书、知乎的跳转询问界面的点击工作
// @author       LiarCoder
// @match        https://link.juejin.cn/*
// @match        https://link.zhihu.com/*
// @match        https://www.jianshu.com/go-wild*
// @match        http://jump.bdimg.com/safecheck*
// @match        https://c.pc.qq.com/middlem.html*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA5LTI5VDE5OjA3OjU4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOS0yOVQxOToxMDowMSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOS0yOVQxOToxMDowMSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5YmVjOTEzMy1mMDQ2LWVlNDAtODNhOC03ZjIxY2ZmMTJkYWQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OWJlYzkxMzMtZjA0Ni1lZTQwLTgzYTgtN2YyMWNmZjEyZGFkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWJlYzkxMzMtZjA0Ni1lZTQwLTgzYTgtN2YyMWNmZjEyZGFkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5YmVjOTEzMy1mMDQ2LWVlNDAtODNhOC03ZjIxY2ZmMTJkYWQiIHN0RXZ0OndoZW49IjIwMjEtMDktMjlUMTk6MDc6NTgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4AP9QrAAADqUlEQVQ4y21Ta0xTZxh+Tlt6O1BuvTjbZDAlw+zi4jD+WKabhhimP/ihMwgSZoFOnbC4Zbosw8ifbTH7sQVIsTYTRvEyF4QRMdUxxiYBKbFYcUXHWOkcBeqEnl4obc+374M/+7Fz8ubLOXm/53ney8ONDLsxPT0Ng8GAcFhAYH4WCoUc1pa2Mdfo+BadPhccx4E9oihCIpGA59WLgiCQ4uKdF7kx130EAgFotSxRgnh8GYQTcevmwBuT3qkN9DtXKpUiTS5nwMtabU5ocGDI6p18pOB5FWTp6TxmZvy5sdiyTBRTRCZNg1QmxSubXx7YWrRlgECEz/cYTITBkIveH5zve70PFS+8WDgnCBEF3rV80JrOm0imJo9kZeaR7Ky1M02mJ5ue35acnQ0qPPe9tCQb9u45cJ5WQs6ebW747cFUsU5bkJBZW+21x47UdO3ZW9yzvJzgksnUKpuYEjmqLhZ8shB/6J3E1au9tlv93eZqc72jvq62saXF/hbNlUGtMpKWJvvbhBD8X3Q6LmHb1l02xnz4cF1HLJrEqZOfYuNzL1k2bigiEqVSgaWlkGHcPYE/pvyr3f790Z/w3HuAkBCFzdbROjL6Y3VV1fFOu/2rCrlcioWFBWh1utTqVBgLa5pSpcTcXADXuq7jvP0beDwefPJxY/NPA721FssJR8PpD8u7u3voKJPy17e/xka6BsAYKQinVqsRDAZx964bJqMR37Z/19rU/MXRysojF6zWLyuuXL6Ckx817N+9e78/Eo6xW3Gfz78GwNFXKpEiFBKg0aSj73r/uRvO72vLymo62tpa3hm67aL/nHSBNDlut0evVKgUZnOVt7S0pAfZWfnkzOnPTyQSKQwPuVD06g4rgz9YVuNg5cViSTrqeuzaWYId20sq857dTJq+tq9nKsLhJdYDgE/nF1dW4pLmZnuXa+xnS3m55aKj81w5U3f712G43W5kZGQwqZDLFQhHBNLX58T8fBAStuUqlSo+4/uLc97sL923r2qwo8N6cC7wD+6MuKHX5+DQoQrQ3UckEl31Bc/zZHFRwOidccgSyQQziFi4qSA1+MsNzmRaj8RKiiYLdHW1UCqVOHqsGoWFBWg889ljBkyBJJQUfv/fFCCRwL3xiYr2C5ezU6nUk3h8RU7ZNHLqyDUHEio7DevWGcRcrf7NsbEJZryk0fgMNKys4++dapLJdIT5ITszn/ogf/X8bzCfsODVJlJtrmuPxeKSaDSKp09D+BchHM1xGrj+SAAAAABJRU5ErkJggg==
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  setTimeout(() => {
    let jumpBtn = null;
    // 匹配掘金的跳转拦截页面网址
    let juejinReg = /https:\/\/link.juejin.cn\//;
    // 匹配简书的跳转拦截页面网址
    let jianshuReg = /https:\/\/www.jianshu.com\/go-wild/;
    // 匹配知乎的跳转拦截页面网址
    let zhihuReg = /https:\/\/link.zhihu.com\//;
    // 匹配百度贴吧的跳转拦截页面网址
    let tiebaReg = /http:\/\/jump.bdimg.com\/safecheck/;
    // 匹配PC端QQ的跳转拦截页面网址
    let qqPCReg = /https:\/\/c.pc.qq.com\/middlem.html/;
    if (juejinReg.test(location.toString())) {
      jumpBtn = document.querySelector('#app > div > div > button');
    } else if (jianshuReg.test(location.toString())) {
      jumpBtn = document.querySelector('._3OuyzjzFBDdQwRGk08HXHz_0');
    } else if (zhihuReg.test(location.toString())) {
      jumpBtn = document.querySelector('a.button');
    } else if (tiebaReg.test(location.toString())) {
      jumpBtn = document.querySelector('div.warning_info.fl > a:nth-child(2)');
    } else if (qqPCReg.test(location.toString())) {
      let targetAddress = document.querySelector('#url').innerText;
      location = targetAddress;
      return;
    } else {
      return;
    }
    jumpBtn.click();
  }, 100);
})();
