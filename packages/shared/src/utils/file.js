/**
 * 使用 FileReader 将文件读取为文本。
 *
 * @param {Blob} file 要读取的文件或 Blob。
 * @param {object} [options] 运行时依赖，主要用于测试。
 * @returns {Promise<string>} 文件文本内容。
 */
export const readFileAsText = (file, { fileReaderConstructor = globalThis.FileReader } = {}) =>
  new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("File is unavailable."));
      return;
    }
    if (typeof fileReaderConstructor !== "function") {
      reject(new Error("FileReader is unavailable."));
      return;
    }

    const reader = new fileReaderConstructor();
    reader.addEventListener("load", () => {
      resolve(String(reader.result ?? ""));
    });
    reader.addEventListener("error", () => {
      reject(reader.error ?? new Error("Failed to read file as text."));
    });
    reader.readAsText(file);
  });
