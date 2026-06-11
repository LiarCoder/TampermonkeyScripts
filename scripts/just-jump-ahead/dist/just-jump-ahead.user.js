// ==UserScript==
// @name         JustJumpAhead
// @namespace    http://tampermonkey.net/
// @version      0.3.5
// @author       LiarCoder
// @description  自动完成掘金、简书、知乎、百度贴吧、PC端QQ、CSDN、Gitee的跳转询问界面的点击工作，实现自动跳转
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA5LTI5VDE5OjA3OjU4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOS0yOVQxOToxMDowMSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOS0yOVQxOToxMDowMSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5YmVjOTEzMy1mMDQ2LWVlNDAtODNhOC03ZjIxY2ZmMTJkYWQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OWJlYzkxMzMtZjA0Ni1lZTQwLTgzYTgtN2YyMWNmZjEyZGFkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6OWJlYzkxMzMtZjA0Ni1lZTQwLTgzYTgtN2YyMWNmZjEyZGFkIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo5YmVjOTEzMy1mMDQ2LWVlNDAtODNhOC03ZjIxY2ZmMTJkYWQiIHN0RXZ0OndoZW49IjIwMjEtMDktMjlUMTk6MDc6NTgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4AP9QrAAADqUlEQVQ4y21Ta0xTZxh+Tlt6O1BuvTjbZDAlw+zi4jD+WKabhhimP/ihMwgSZoFOnbC4Zbosw8ifbTH7sQVIsTYTRvEyF4QRMdUxxiYBKbFYcUXHWOkcBeqEnl4obc+374M/+7Fz8ubLOXm/53ney8ONDLsxPT0Ng8GAcFhAYH4WCoUc1pa2Mdfo+BadPhccx4E9oihCIpGA59WLgiCQ4uKdF7kx130EAgFotSxRgnh8GYQTcevmwBuT3qkN9DtXKpUiTS5nwMtabU5ocGDI6p18pOB5FWTp6TxmZvy5sdiyTBRTRCZNg1QmxSubXx7YWrRlgECEz/cYTITBkIveH5zve70PFS+8WDgnCBEF3rV80JrOm0imJo9kZeaR7Ky1M02mJ5ue35acnQ0qPPe9tCQb9u45cJ5WQs6ebW747cFUsU5bkJBZW+21x47UdO3ZW9yzvJzgksnUKpuYEjmqLhZ8shB/6J3E1au9tlv93eZqc72jvq62saXF/hbNlUGtMpKWJvvbhBD8X3Q6LmHb1l02xnz4cF1HLJrEqZOfYuNzL1k2bigiEqVSgaWlkGHcPYE/pvyr3f790Z/w3HuAkBCFzdbROjL6Y3VV1fFOu/2rCrlcioWFBWh1utTqVBgLa5pSpcTcXADXuq7jvP0beDwefPJxY/NPA721FssJR8PpD8u7u3voKJPy17e/xka6BsAYKQinVqsRDAZx964bJqMR37Z/19rU/MXRysojF6zWLyuuXL6Ckx817N+9e78/Eo6xW3Gfz78GwNFXKpEiFBKg0aSj73r/uRvO72vLymo62tpa3hm67aL/nHSBNDlut0evVKgUZnOVt7S0pAfZWfnkzOnPTyQSKQwPuVD06g4rgz9YVuNg5cViSTrqeuzaWYId20sq857dTJq+tq9nKsLhJdYDgE/nF1dW4pLmZnuXa+xnS3m55aKj81w5U3f712G43W5kZGQwqZDLFQhHBNLX58T8fBAStuUqlSo+4/uLc97sL923r2qwo8N6cC7wD+6MuKHX5+DQoQrQ3UckEl31Bc/zZHFRwOidccgSyQQziFi4qSA1+MsNzmRaj8RKiiYLdHW1UCqVOHqsGoWFBWg889ljBkyBJJQUfv/fFCCRwL3xiYr2C5ezU6nUk3h8RU7ZNHLqyDUHEio7DevWGcRcrf7NsbEJZryk0fgMNKys4++dapLJdIT5ITszn/ogf/X8bzCfsODVJlJtrmuPxeKSaDSKp09D+BchHM1xGrj+SAAAAABJRU5ErkJggg==
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/just-jump-ahead/dist/just-jump-ahead.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/just-jump-ahead/dist/just-jump-ahead.user.js
// @match        *://link.juejin.cn/*
// @match        *://link.zhihu.com/*
// @match        *://www.jianshu.com/go-wild*
// @match        *://jump.bdimg.com/safecheck*
// @match        *://link.csdn.net/*
// @match        *://gitee.com/link?*
// @match        *://c.pc.qq.com/middlem.html*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const CLICK_REDIRECT_RULES = [
    // 匹配掘金的跳转拦截页面网址。
    {
      urlIncludes: "://link.juejin.cn/",
      selector: "#app > div > div > button"
    },
    // 匹配简书的跳转拦截页面网址。
    {
      urlIncludes: "://www.jianshu.com/go-wild",
      selector: "._3OuyzjzFBDdQwRGk08HXHz_0"
    },
    // 匹配知乎的跳转拦截页面网址。
    {
      urlIncludes: "://link.zhihu.com/",
      selector: "a.button"
    },
    // 匹配百度贴吧的跳转拦截页面网址。
    {
      urlIncludes: "://jump.bdimg.com/safecheck",
      selector: "div.warning_info.fl > a:nth-child(2)"
    },
    // 匹配 CSDN 的跳转拦截页面网址。
    {
      urlIncludes: "://link.csdn.net/",
      selector: "a.loading-btn"
    }
  ];
  const TEXT_REDIRECT_RULES = [
    // 匹配 PC 端 QQ 的跳转拦截页面网址。
    {
      urlIncludes: "://c.pc.qq.com/middlem.html",
      selector: "#url"
    }
  ];
  const QUERY_REDIRECT_RULES = [
    // 匹配 Gitee 的跳转拦截页面网址。
    {
      urlIncludes: "://gitee.com/link",
      parameterName: "target"
    }
  ];
  const getCurrentAddress = () => window.location.toString();
  const findMatchedRule = (rules, currentAddress) => rules.find(({ urlIncludes }) => currentAddress.includes(urlIncludes));
  const redirectTo = (targetAddress) => {
    if (!targetAddress) {
      return false;
    }
    window.location.assign(targetAddress);
    return true;
  };
  const clickRedirectButton = ({ selector }) => {
    const jumpBtn = document.querySelector(selector);
    if (!jumpBtn) {
      return false;
    }
    jumpBtn.click();
    return true;
  };
  const redirectByTextContent = ({ selector }) => {
    var _a;
    const targetElement = document.querySelector(selector);
    const targetAddress = (_a = targetElement == null ? void 0 : targetElement.innerText) == null ? void 0 : _a.trim();
    return redirectTo(targetAddress);
  };
  const getQueryParameter = (parameterName) => {
    var _a;
    try {
      return ((_a = new URL(window.location.href).searchParams.get(parameterName)) == null ? void 0 : _a.trim()) ?? "";
    } catch {
      return "";
    }
  };
  const redirectByQueryParameter = ({ parameterName }) => {
    const targetAddress = getQueryParameter(parameterName);
    return redirectTo(targetAddress);
  };
  const runMatchedRule = (rules, currentAddress, runner) => {
    const matchedRule = findMatchedRule(rules, currentAddress);
    if (!matchedRule) {
      return false;
    }
    return runner(matchedRule);
  };
  const init = () => {
    const currentAddress = getCurrentAddress();
    if (runMatchedRule(CLICK_REDIRECT_RULES, currentAddress, clickRedirectButton)) {
      return;
    }
    if (runMatchedRule(TEXT_REDIRECT_RULES, currentAddress, redirectByTextContent)) {
      return;
    }
    runMatchedRule(QUERY_REDIRECT_RULES, currentAddress, redirectByQueryParameter);
  };
  if (document.readyState === "complete") {
    init();
  } else {
    window.addEventListener("load", init, { once: true });
  }

})();