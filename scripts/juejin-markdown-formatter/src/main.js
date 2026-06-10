import {
  addStyle,
  copyTextToClipboard,
  createElement,
  createSvgElement,
  isTopWindow,
  waitForElement,
} from "@tampermonkey-scripts/shared";

import styles from "./styles.css?inline";

const SCRIPT_ID = "juejin-markdown-formatter";
const STYLE_ID = `${SCRIPT_ID}-style`;
const FILE_INPUT_ID = `${SCRIPT_ID}-import-md-file`;
const TOOLBAR_SELECTOR =
  "#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-toolbar > div.bytemd-toolbar-right";
const TITLE_INPUT_SELECTOR = "#juejin-web-editor > div.edit-draft > div > header > input";
const IMPORT_LABEL_TITLE = "导入Markdown文档";

const createImportIcon = () => {
  const icon = createSvgElement("svg", {
    width: 12,
    height: 12,
    viewBox: "0 0 48 48",
    fill: "none",
  });

  icon.append(
    createSvgElement("rect", {
      width: 48,
      height: 48,
      fill: "white",
      "fill-opacity": "0.01",
    }),
    createSvgElement("path", {
      d: "M6 24.0083V42H42V24",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
    createSvgElement("path", {
      d: "M33 23L24 32L15 23",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
    createSvgElement("path", {
      d: "M23.9917 6V32",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })
  );

  return icon;
};

const createFileInput = (onChange) =>
  createElement({
    tagName: "input",
    attributes: {
      id: FILE_INPUT_ID,
      accept: ".md",
      type: "file",
    },
    events: [
      {
        name: "change",
        handler: onChange,
      },
    ],
  });

const createImportLabel = () =>
  createElement({
    tagName: "label",
    className: "bytemd-toolbar-icon",
    attributes: {
      for: FILE_INPUT_ID,
    },
    dataset: {
      title: IMPORT_LABEL_TITLE,
    },
    children: [createImportIcon()],
  });

const formatHighlight = (content) => content.replace(/==([\s\S]*?)==/g, "<mark>$1</mark>");

const formatImages = (content) =>
  content.replace(
    /!\[([^\]]*)\]\(([^)]*)\)/g,
    (_, description, src) =>
      `<div align="center"><img src="${src}"></div><div align="center" color="gray">${description}</div><br>`
  );

const formatCenterTags = (content) =>
  content.replace(/<center>([\s\S]*?)<\/center>/g, '<div align="center">$1</div>');

const formatMarkdown = (content) => formatCenterTags(formatImages(formatHighlight(content)));

const getArticleTitle = (content) => {
  const heading = content.match(/^#\s.*$/m);
  if (heading) {
    // 保留旧行为：标题末尾追加空格，提示用户处理后再粘贴正文。
    return `${heading[0].slice(2)} `;
  }

  return `${content.substring(0, 10)} `;
};

const readFileAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      resolve(String(reader.result ?? ""));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("读取 Markdown 文件失败。"));
    });
    reader.readAsText(file);
  });

const updateTitleInput = (titleInput, content) => {
  titleInput.value = getArticleTitle(content);
  titleInput.focus();
};

const handleImportError = (error) => {
  console.error("导入 Markdown 文档失败：", error);
};

const createFileChangeHandler = (titleInput) => async (event) => {
  const [file] = event.target.files ?? [];
  if (!file) {
    return;
  }

  try {
    const rawContent = await readFileAsText(file);
    const content = formatMarkdown(rawContent);

    // ByteMD 直接写入 CodeMirror DOM 不会稳定触发编辑器状态更新，仍沿用剪贴板导入流程。
    await copyTextToClipboard(content);
    updateTitleInput(titleInput, content);
    alert("文档处理完毕，删除标题尾部空格，然后在编辑区按下 Ctrl + V 粘贴内容");
  } catch (error) {
    handleImportError(error);
  } finally {
    event.target.value = "";
  }
};

const supportsFileImport = () => Boolean(window.FileList && window.File && window.FileReader);

const injectImportButton = ({ toolbar, titleInput }) => {
  if (document.getElementById(FILE_INPUT_ID)) {
    return;
  }

  toolbar.style.position = "relative";
  toolbar.insertBefore(createFileInput(createFileChangeHandler(titleInput)), toolbar.firstChild);
  toolbar.insertBefore(createImportLabel(), toolbar.firstChild);
};

const init = async () => {
  // 导入按钮只需要在顶层编辑页出现，避免 iframe 中重复初始化。
  if (!isTopWindow() || !supportsFileImport()) {
    return;
  }

  try {
    const [toolbar, titleInput] = await Promise.all([
      waitForElement(TOOLBAR_SELECTOR),
      waitForElement(TITLE_INPUT_SELECTOR),
    ]);

    addStyle(styles, { id: STYLE_ID });
    injectImportButton({ toolbar, titleInput });
  } catch (error) {
    handleImportError(error);
  }
};

init();
