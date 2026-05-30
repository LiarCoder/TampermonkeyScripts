// ==UserScript==
// @name         掘金Markdown格式适配器
// @namespace    http://tampermonkey.net/
// @version      0.3.3
// @author       LiarCoder
// @description  掘金Markdown编辑器适配脚本：从本地导入Markdown文件，并对文档做一些处理：居中图片、居中图片标注的文字、解决==无法高亮的问题、自动填充标题
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA4LTMwVDE2OjMwOjUzKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHN0RXZ0OndoZW49IjIwMjEtMDgtMzBUMTY6MzA6NTMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5n1ZAhAAACMElEQVQ4y2P8//8/MwNh8BdKE1TLRIRh/69du6Z/+fJlIxCbkGJGAi4Eu8zY2Pj9t2/fBK5fv85IyKXEuJCBlZX1PxsbGzFKGViIUcTOzv79379/nMSoJcqFpACqGwjzMij2/kEtYERKJsQkIxS9MBf+Q6L/v3r1ShqYTPRguoHhxwTCMD4wGek+e/ZMDskwuBkgRf9u3bqlHRAQsPnChQtmIP6kSZPq9PT0Lm7dujUMGim/gTEN1nDgwAFPbW3tS93d3W0gtTdu3ND28fHZcu7cOUuwocB0yLBs2bJYkG1z5swpAvGvXLmiJy8v/xUktmHDBq+IiIhDQAuvbt++3QUkJi4u/vf8+fPGILVLly4F6509e3YxiA/2Bicn5zcQzc3N/RlEg1xw9OhRHTk5ue9Ag7Y+ffpU9927dzL+/v67xcTEGIByugYGBmdBarm4uMB6eXh4PsEjhZGR8T8yDQpsaWnp+ydPntSwt7e/funSJQFmZmYGkGFHjhxRA7r+NjRC/qLrxZdsmCUkJB7t379fQ0hI6DswHP/u27dPG8kwsnIKs5SU1OMTJ06o//nzhxXIvkeoxEExUERE5DlaOgMDoFcfY0mDMLknsIIGbuCvX7/YQGEE9J7nly9fQGHBRmTG+AVManYgvb9//2aFZBFgVG/bts0LmkjJxmvWrIkGmQUqD5l+/vzJtmPHDv+PHz9yA4spRlLyLtBl/4HJ7Zu7u/tmIP0dVsD+pVLZwAwA0KEB2b6h03UAAAAASUVORK5CYII=
// @downloadURL  https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/juejin-markdown-formatter/dist/juejin-markdown-formatter.user.js
// @updateURL    https://raw.githubusercontent.com/LiarCoder/TampermonkeyScripts/main/scripts/juejin-markdown-formatter/dist/juejin-markdown-formatter.user.js
// @match        https://juejin.cn/editor/*
// @require      http://code.jquery.com/jquery-1.11.0.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/axios/0.21.1/axios.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function createEle(eleName, text, attrs) {
    let ele = document.createElement(eleName);
    ele.innerText = text;
    for (let k in attrs) {
      ele.setAttribute(k, attrs[k]);
    }
    return ele;
  }
  function getSubStr(target, startStr, endStr) {
    let startPos = target.indexOf(startStr) + startStr.length;
    let endPos;
    if (startStr === endStr) {
      endPos = target.lastIndexOf(endStr);
    } else {
      endPos = target.indexOf(endStr);
    }
    return target.substring(startPos, endPos);
  }
  function replaceText(target, reg, wrapperHead, wrapperTail, startStr, endStr) {
    let replacement = target.match(new RegExp(reg, "g"));
    if (!replacement) {
      return target;
    }
    for (let i = 0; i < replacement.length; i++) {
      let content = getSubStr(replacement[i], startStr, endStr);
      let imgDescription = "";
      if (reg === "!\\[.*\\]\\(.*\\)") {
        imgDescription = `<div align="center" color="gray">${getSubStr(replacement[i], "[", "]")}</div><br>`;
      }
      replacement[i] = wrapperHead + content + wrapperTail + imgDescription;
    }
    for (let i = 0; i < replacement.length; i++) {
      target = target.replace(new RegExp(reg), replacement[i]);
    }
    return target;
  }
  const inputTag = createEle("input", "", {
    id: "juejin-formatter-import-md-file",
    accept: ".md",
    type: "file",
    style: "display: none"
  });
  const importLabel = createEle("label", "", {
    for: "juejin-formatter-import-md-file",
    class: "bytemd-toolbar-icon",
    "data-title": "导入Markdown文档"
  });
  let tooltipStyle = `label[for="juejin-formatter-import-md-file"] {
      vertical-align: middle;
      cursor: pointer;
    }

    [data-title] {
      position: relative;
      overflow: visible;
    }

    label[for="juejin-formatter-import-md-file"]:before,
    label[for="juejin-formatter-import-md-file"]:after {
      display: block;
      position: fixed;
      opacity: 0;
      transition: .15s .15s;
      visibility: hidden;
    }

    label[for="juejin-formatter-import-md-file"]:before {
      content: attr(data-title);
      z-index: 2;
      transform: translate(-53px, -36px);
      border-radius: 5px;
      padding: 5px 10px;
      line-height: 16px;
      text-align:center;
      background-color: #333333;
      color: #fff;
      font-size: 12px;
      font-style: normal;
      white-space: nowrap;
    }

    label[for="juejin-formatter-import-md-file"]:after {
      content: '';
      z-index: 1;
      transform: translate(2px, -38px);
      width: 0;
      height: 0;
      margin-bottom: -12px;
      overflow: hidden;
      border: 10px solid transparent;
      border-top-color: #333333;
    }

    label[for="juejin-formatter-import-md-file"]:hover:before,
    label[for="juejin-formatter-import-md-file"]:hover:after {
      visibility: visible;
      opacity: 1;
    }`;
  const tooltipStyleTag = createEle("style", tooltipStyle, {
    type: "text/css"
  });
  importLabel.innerHTML = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
      <path d="M6 24.0083V42H42V24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M33 23L24 32L15 23" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M23.9917 6V32" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;
  setTimeout(() => {
    let btnGroup = document.querySelector(
      "#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-toolbar > div.bytemd-toolbar-right"
    );
    btnGroup.style.position = "relative";
    btnGroup.insertBefore(inputTag, btnGroup.firstChild);
    btnGroup.insertBefore(importLabel, btnGroup.firstChild);
    btnGroup.insertBefore(tooltipStyleTag, btnGroup.firstChild);
    let titleInput = document.querySelector(
      "#juejin-web-editor > div.edit-draft > div > header > input"
    );
    if (window.FileList && window.File && window.FileReader) {
      document.getElementById("juejin-formatter-import-md-file").addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener("load", (event2) => {
          let content = event2.target.result;
          content = replaceText(content, "==.*?==", "<mark>", "</mark>", "==", "==");
          content = replaceText(
            content,
            "!\\[.*\\]\\(.*\\)",
            '<div align="center"><img src="',
            '"></div>',
            "(",
            ")"
          );
          content = replaceText(
            content,
            "<center>.*<\\/center>",
            '<div align="center">',
            "</div>",
            "<center>",
            "</center>"
          );
          navigator.clipboard.writeText(content);
          let contentTitle = content.match(/#\s.*/g);
          if (contentTitle) {
            titleInput.value = contentTitle[0].substr(2) + " ";
          } else {
            titleInput.value = content.substring(0, 10) + " ";
          }
          titleInput.focus();
          alert("文档处理完毕，删除标题尾部空格，然后在编辑区按下 Ctrl + V 粘贴内容");
        });
        reader.readAsText(file);
      });
    }
  }, 2e3);

})();