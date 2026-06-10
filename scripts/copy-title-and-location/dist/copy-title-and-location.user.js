// ==UserScript==
// @name         复制标题和地址
// @namespace    http://tampermonkey.net/
// @version      0.7.0
// @author       LiarCoder
// @description  一键复制标题和地址为Markdown格式并带上当前时间（myFirstScript）
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVQ4jY3TO0tcURQF4G/ixFdhCIg2qWysZPwDsUkXSJk2Qso0IpLOTtLERkGwEjQhXV5d0gkGK6v7E/IHgg9EHR0nHLLvzGHujGbB5pzLOXvttfc6twaNRiMta1g1GG28xJfyRlEU6rF/FskpjvA4o7nABD7gM17hY3lYEjzHOd4NqP8QW3gURA+wJzYJI2hV0rq4xtfsexdPcwW3EQmLaSw4wVCQr+M1DtDEJt7iVz1jLRUsB0GOn9iPymWRJ7mChOFY5ysNVFHrHaKwKWEGUyG1HZcnMY4/0UarH0Ez1u+Yq9T8h5tw5BTTg1p4EYfNnuR6WC3srCgo+/odcRdK+7ubrGIRvfeLq7hz3KsgESXPE97HDFKfOUazxLFegst4MAmf7pGfkP6NNNAOwTesYAM/YkgdrzOcYRYLeJMTHMbTTE926T8U7GAb/gI+kkP5n3CsvwAAAABJRU5ErkJggg==
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/copy-title-and-location/dist/copy-title-and-location.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/copy-title-and-location/dist/copy-title-and-location.user.js
// @match        *://*/*
// @grant        GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  var _GM_addStyle = /* @__PURE__ */ (() => typeof GM_addStyle != "undefined" ? GM_addStyle : void 0)();
  function createEle(eleName, text, attrs) {
    const ele = document.createElement(eleName);
    ele.innerText = text;
    for (const k in attrs) {
      ele.setAttribute(k, attrs[k]);
    }
    return ele;
  }
  const btnStyle = `
    #copy-title-and-location {
      position: fixed;
      top: 100px;
      left: -95px;
      opacity: 0.3;
      z-index: 2147483647;
      background-image: none;
      cursor: pointer;
      color: #fff;
      background-color: #0084ff !important;
      margin: 5px 0px;
      width: auto;
      border-radius: 3px;
      border: #0084ff;
      outline: none;
      padding: 3px 6px;
      height: 26px;
      font-family: Arial, sans-serif;
      font-size: 12px;
      transition: left, 0.5s;
    }

    #copy-title-and-location:hover {
      left: 0px;
      opacity: 1;
    }

    #copy-title-and-location svg {
      width: auto;
      vertical-align: middle;
      margin-left: 10px;
      border-style: none;
      text-align: center;
      display: inline-block !important;
      margin-bottom: 2px;
    }
  `;
  const iconSVG = '<?xml version="1.0" encoding="UTF-8"?><svg width="16" height="16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="48" height="48" fill="white" fill-opacity="0.01"/><path d="M8 6C8 4.89543 8.89543 4 10 4H30L40 14V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V6Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round"/><path d="M16 20H32" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 28H32" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const btn = createEle("button", "", { id: "copy-title-and-location" });
  btn.innerHTML = "复制标题和地址" + iconSVG;
  const date = /* @__PURE__ */ new Date();
  const timeStamp = `更新：${date.toLocaleDateString().replace("/", "年").replace("/", "月")}日${date.toLocaleTimeString("chinese", {
  hour12: false
})}`;
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.log("尝试使用备用复制方法：" + err);
      try {
        const textarea = document.createElement("textarea");
        textarea.style.cssText = "position:fixed;top:-999px;left:-999px;";
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      } catch (err2) {
        console.error("复制失败：", err2);
      }
    }
  };
  const getAddress = (hasQuote = true) => {
    const titleInfo = document.title;
    let address = `参考：[${titleInfo}](${location})`;
    const siteHandlers = {
      "mp.weixin.qq.com": () => {
        const officialAccount = document.getElementById("js_name");
        const publishDate = document.getElementById("publish_time");
        if (officialAccount && publishDate) {
          publishDate.click();
          return `参考：[【微信公众号：${officialAccount.innerText}${publishDate.innerText}】${titleInfo}](${location})`;
        }
        return address;
      }
      // 可在此处添加其他网站的特殊处理规则
    };
    const domain = location.hostname;
    for (const site in siteHandlers) {
      if (domain.includes(site)) {
        address = siteHandlers[site]();
        break;
      }
    }
    return hasQuote ? `
> ${address}` : address;
  };
  btn.addEventListener("click", async (e) => {
    await copyToClipboard(timeStamp + getAddress());
  });
  btn.addEventListener("contextmenu", async (e) => {
    e.preventDefault();
    await copyToClipboard(getAddress(false));
  });
  if (window.self === window.top) {
    if (document.querySelector("body")) {
      document.body.appendChild(btn);
      _GM_addStyle(btnStyle);
    } else {
      document.documentElement.appendChild(btn);
      _GM_addStyle(btnStyle);
    }
  }

})();