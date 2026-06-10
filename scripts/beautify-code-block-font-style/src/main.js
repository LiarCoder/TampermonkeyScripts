const STYLE_ELEMENT_ID = "beautify-code-block-font-style";

const SELECTOR_GROUPS = {
  csdn: [
    "span.token",
    ".prism-atom-one-dark .prism *",
    ".htmledit_views code ol li div.hljs-ln-code",
    ".htmledit_views code ol li div.hljs-ln-numbers",
    ".htmledit_views pre code",
    ".htmledit_views pre code div",
    ".htmledit_views pre code span",
  ],
  cnblogs: [
    ".syntaxhighlighter a",
    ".syntaxhighlighter div",
    ".syntaxhighlighter code",
    ".syntaxhighlighter table",
    ".syntaxhighlighter table td",
    ".syntaxhighlighter table tr",
    ".syntaxhighlighter table tbody",
    ".syntaxhighlighter table thead",
    ".syntaxhighlighter table caption",
    ".syntaxhighlighter textarea",
  ],
  leetcode: [".notranslate", "pre", ".inner-wrapper__1TvQ"],
  github: [
    ".blob-code-inner",
    ".blob-code-inner > *",
    ".CodeMirror pre > span",
    ".CodeMirror-linenumber",
  ],
  runoob: [".example_code", ".hl-main"],
  common: ["textarea", "blockquote", "code"],
};

const BASE_FONT_STACK = [
  "Source Code Pro",
  "DejaVu Sans Mono",
  "Ubuntu Mono",
  "Anonymous Pro",
  "Droid Sans Mono",
  "Menlo",
  "Monaco",
  "Consolas",
  "Inconsolata",
  "Courier",
  "monospace",
  "PingFang SC",
  "Microsoft YaHei",
  "sans-serif",
];

const FONT_STACK = ["Cascadia Code", "YaHei Consolas Hybrid", "Lucida Console", ...BASE_FONT_STACK];

// Monaco 编辑器 mtk3 token 使用 Cascadia Code 时容易出现光标和文字宽度不一致的问题。
const MONACO_TOKEN_FONT_STACK = ["YaHei Consolas Hybrid", ...BASE_FONT_STACK];
const MONACO_TOKEN_SELECTOR = "div.view-line > span > span.mtk3";

const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
]);

const getUniqueValues = (values) => [...new Set(values.filter(Boolean))];

const buildSelectorList = (selectorGroups) =>
  getUniqueValues(Object.values(selectorGroups).flat()).join(",\n");

const quoteFontFamily = (fontFamily) => {
  if (GENERIC_FONT_FAMILIES.has(fontFamily)) {
    return fontFamily;
  }

  return `"${fontFamily.replace(/"/g, '\\"')}"`;
};

const buildFontFamily = (fontStack) => getUniqueValues(fontStack).map(quoteFontFamily).join(", ");

const buildFontStyleRule = (selector, fontStack) => `${selector} {
  font-family: ${buildFontFamily(fontStack)} !important;
}`;

const buildFontStyle = () =>
  [
    buildFontStyleRule(buildSelectorList(SELECTOR_GROUPS), FONT_STACK),
    buildFontStyleRule(MONACO_TOKEN_SELECTOR, MONACO_TOKEN_FONT_STACK),
  ].join("\n\n");

const getStyleContainer = () => document.head ?? document.documentElement;

const applyStyle = () => {
  const styleContainer = getStyleContainer();
  if (!styleContainer || document.getElementById(STYLE_ELEMENT_ID)) {
    return;
  }

  const styleElement = document.createElement("style");
  styleElement.id = STYLE_ELEMENT_ID;
  styleElement.textContent = buildFontStyle();
  styleContainer.appendChild(styleElement);
};

applyStyle();
