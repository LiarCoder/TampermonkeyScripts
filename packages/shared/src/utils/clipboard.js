const createCopyError = (fallbackError, clipboardError) => {
  if (clipboardError) {
    fallbackError.clipboardError = clipboardError;
  }
  return fallbackError;
};

const copyTextWithTextarea = (text, { documentRef }) => {
  if (!documentRef?.createElement) {
    throw new Error("Document is unavailable.");
  }

  const target = documentRef.body ?? documentRef.documentElement;
  if (!target?.appendChild) {
    throw new Error("Clipboard fallback target is unavailable.");
  }

  const textarea = documentRef.createElement("textarea");
  textarea.value = text;
  textarea.style.cssText = "position:fixed;top:-999px;left:-999px;";
  textarea.setAttribute("readonly", "");

  target.appendChild(textarea);
  try {
    textarea.select();
    const copied = documentRef.execCommand("copy");
    if (!copied) {
      throw new Error("Clipboard fallback copy command failed.");
    }
  } finally {
    target.removeChild(textarea);
  }
};

/**
 * 将文本复制到剪贴板；现代 Clipboard API 不可用或失败时回退到 textarea 复制。
 *
 * @param {string} text 要复制的文本。
 * @param {object} [options] 运行时依赖，主要用于测试。
 * @returns {Promise<void>}
 */
export const copyTextToClipboard = async (
  text,
  { navigatorRef = globalThis.navigator, documentRef = globalThis.document } = {}
) => {
  const normalizedText = String(text ?? "");
  const clipboard = navigatorRef?.clipboard;
  let clipboardError = null;

  if (typeof clipboard?.writeText === "function") {
    try {
      await clipboard.writeText(normalizedText);
      return;
    } catch (error) {
      clipboardError = error;
    }
  }

  try {
    copyTextWithTextarea(normalizedText, { documentRef });
  } catch (fallbackError) {
    throw createCopyError(fallbackError, clipboardError);
  }
};
