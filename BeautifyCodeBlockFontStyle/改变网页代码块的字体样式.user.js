/*
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-21 00:11:42
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-09-21 01:14:29
 */
// ==UserScript==
// @name         改变网页代码块的字体样式
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       LiarCoder
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  let codeBlockStyle = document.createElement('style');
  codeBlockStyle.innerText = `code {
    font-family: 'Cascadia Code', 'YaHei Consolas Hybrid', monospace;
  }`;
  document.body.appendChild(codeBlockStyle);
  // Your code here...
})();