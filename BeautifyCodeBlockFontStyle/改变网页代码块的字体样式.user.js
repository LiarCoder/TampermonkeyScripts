/*
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-21 00:11:42
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-09-21 18:02:43
 */
// ==UserScript==
// @name         改变网页代码块的字体样式
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  改变网页代码块的字体样式，LeetCode、CSDN、掘金、博客园的代码块字体全被设置为Cascadia Code这款字体，后面还有YaHei Consolas Hybrid和Lucida Console这两款字体做候选，最后由CSDN代码块的字体样式兜底
// @author       LiarCoder
// @match        *://*/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  let codeBlockStyle = document.createElement('style');
  let CSDNCodeBlockOriginalFont = 'Source Code Pro,DejaVu Sans Mono,Ubuntu Mono,Anonymous Pro,Droid Sans Mono,Menlo,Monaco,Consolas,Inconsolata,Courier,monospace,PingFang SC,Microsoft YaHei,sans-serif';
  let CSDNCodeBlockSelector = 'span.token, .prism-atom-one-dark .prism *';
  let cnblogCodeBlockSelector = '.syntaxhighlighter a, .syntaxhighlighter div, .syntaxhighlighter code, .syntaxhighlighter table, .syntaxhighlighter table td, .syntaxhighlighter table tr, .syntaxhighlighter table tbody, .syntaxhighlighter table thead, .syntaxhighlighter table caption, .syntaxhighlighter textarea';
  codeBlockStyle.innerText = `${CSDNCodeBlockSelector}, ${cnblogCodeBlockSelector}, blockquote, code{
    font-family: 'Cascadia Code', 'YaHei Consolas Hybrid', 'Lucida Console', ${CSDNCodeBlockOriginalFont} !important;
  }
  div.view-lines.monaco-mouse-cursor-text{
    font-family: 'YaHei Consolas Hybrid', ${CSDNCodeBlockOriginalFont} !important;
  }`;
  document.body.appendChild(codeBlockStyle);

  // 本来想在上面通过@font-face来指定GitHub上Cascadia Code的地址的，但是实验过后好像行不通，那就算了吧
  // font-family: 'Cascadia Code', 'YaHei Consolas Hybrid', monospace !important;
  // @font-face {
  //   font-family: 'testFont';
  //   src: url('https://github.com/microsoft/cascadia-code/blob/main/sources/vtt_data/CascadiaCode_VTT.ttf');
  // }
  // font-family: testFont, 'YaHei Consolas Hybrid', monospace !important;
})();