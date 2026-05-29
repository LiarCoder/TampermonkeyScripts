/**
   * 网站代码块选择器配置
   */
  const siteSelectors = {
    // CSDN代码块
    csdn: "span.token, .prism-atom-one-dark .prism *, .htmledit_views code ol li div.hljs-ln-code, .htmledit_views code ol li div.hljs-ln-numbers, .htmledit_views pre code, .htmledit_views pre code div, .htmledit_views pre code span",

    // 博客园代码块
    cnblogs:
      ".syntaxhighlighter a, .syntaxhighlighter div, .syntaxhighlighter code, .syntaxhighlighter table, .syntaxhighlighter table td, .syntaxhighlighter table tr, .syntaxhighlighter table tbody, .syntaxhighlighter table thead, .syntaxhighlighter table caption, .syntaxhighlighter textarea",

    // LeetCode代码块
    leetcode: ".notranslate, pre, .inner-wrapper__1TvQ",

    // GitHub代码块
    github:
      ".blob-code-inner, .blob-code-inner > *, .CodeMirror pre > span, .CodeMirror-linenumber",

    // 菜鸟教程代码块
    runoob: ".example_code, .hl-main",

    // 通用代码块
    common: "textarea, blockquote, code",
  };

  /**
   * 字体配置
   */
  const fontConfig = {
    primary: "Cascadia Code",
    fallback: ["YaHei Consolas Hybrid", "Lucida Console"],
    base: "Source Code Pro,DejaVu Sans Mono,Ubuntu Mono,Anonymous Pro,Droid Sans Mono,Menlo,Monaco,Consolas,Inconsolata,Courier,monospace,PingFang SC,Microsoft YaHei,sans-serif",
  };

  /**
   * 生成字体样式
   */
  const generateFontStyle = () => {
    const allSelectors = Object.values(siteSelectors).join(", ");
    const fontFamily = `'${fontConfig.primary}', '${fontConfig.fallback.join(
      "', '"
    )}', ${fontConfig.base}`;

    return `
      ${allSelectors} {
        font-family: ${fontFamily} !important;
      }
      div.view-line>span>span.mtk3 {
        font-family: '${fontConfig.fallback[0]}', ${fontConfig.base} !important;
      }
    `;
  };

  /**
   * 应用样式到页面
   */
  const applyStyle = () => {
    const styleElement = document.createElement("style");
    styleElement.textContent = generateFontStyle();
    document.body.appendChild(styleElement);
  };

  // 本来想在上面通过@font-face来指定GitHub上Cascadia Code的地址的，但是实验过后好像行不通，那就算了吧
  // font-family: 'Cascadia Code', 'YaHei Consolas Hybrid', monospace !important;
  // @font-face {
  //   font-family: 'testFont';
  //   src: url('https://github.com/microsoft/cascadia-code/blob/main/sources/vtt_data/CascadiaCode_VTT.ttf');
  // }
  // font-family: testFont, 'YaHei Consolas Hybrid', monospace !important;

  // 执行样式应用
  applyStyle();
