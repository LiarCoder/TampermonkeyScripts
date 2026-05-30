import { buildRawScriptUrl } from "@tampermonkey-scripts/shared";

import packageJson from "../package.json";

const rawScriptUrl = buildRawScriptUrl(packageJson.scriptName);

export const userscript = {
  name: "复制标题和地址",
  namespace: "http://tampermonkey.net/",
  version: "0.7",
  description: "一键复制标题和地址为Markdown格式并带上当前时间（myFirstScript）",
  author: "LiarCoder",
  updateURL: rawScriptUrl,
  downloadURL: rawScriptUrl,
  match: "*://*/*",
  grant: "GM_addStyle",
  icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVQ4jY3TO0tcURQF4G/ixFdhCIg2qWysZPwDsUkXSJk2Qso0IpLOTtLERkGwEjQhXV5d0gkGK6v7E/IHgg9EHR0nHLLvzGHujGbB5pzLOXvttfc6twaNRiMta1g1GG28xJfyRlEU6rF/FskpjvA4o7nABD7gM17hY3lYEjzHOd4NqP8QW3gURA+wJzYJI2hV0rq4xtfsexdPcwW3EQmLaSw4wVCQr+M1DtDEJt7iVz1jLRUsB0GOn9iPymWRJ7mChOFY5ysNVFHrHaKwKWEGUyG1HZcnMY4/0UarH0Ez1u+Yq9T8h5tw5BTTg1p4EYfNnuR6WC3srCgo+/odcRdK+7ubrGIRvfeLq7hz3KsgESXPE97HDFKfOUazxLFegst4MAmf7pGfkP6NNNAOwTesYAM/YkgdrzOcYRYLeJMTHMbTTE926T8U7GAb/gI+kkP5n3CsvwAAAABJRU5ErkJggg==",
};
