/** @param {string} file */
const isDistUserScript = (file) => /[/\\]dist[/\\].+\.user\.js$/i.test(file);

export default {
  "*.{js,jsx}": (files) => {
    const filtered = files.filter((file) => !isDistUserScript(file));
    if (filtered.length === 0) {
      return [];
    }
    const paths = filtered.map((file) => `"${file}"`).join(" ");
    return [`eslint --fix --no-warn-ignored ${paths}`, `prettier --write ${paths}`];
  },
  "*.{json,md,yml,yaml,css,html}": "prettier --write",
};
