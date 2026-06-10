import {
  addStyle,
  copyTextToClipboard,
  createElement,
  createSvgElement,
  isTopWindow,
} from "@tampermonkey-scripts/shared";

const BUTTON_ID = "copy-title-and-location";
const STYLE_ID = `${BUTTON_ID}-style`;
const BUTTON_TEXT = "复制标题和地址";

const BUTTON_STYLE = `
  #${BUTTON_ID} {
    position: fixed;
    top: 100px;
    left: -95px;
    opacity: 0.3;
    z-index: 2147483647;
    background-image: none;
    cursor: pointer;
    color: #fff;
    background-color: #0084ff !important;
    margin: 5px 0;
    width: auto;
    border-radius: 3px;
    border: #0084ff;
    outline: none;
    padding: 3px 6px;
    height: 26px;
    font-family: Arial, sans-serif;
    font-size: 12px;
    transition: left, 0.5s;
  }

  #${BUTTON_ID}:hover {
    left: 0;
    opacity: 1;
  }

  #${BUTTON_ID} svg {
    width: auto;
    vertical-align: middle;
    margin-left: 10px;
    border-style: none;
    text-align: center;
    display: inline-block !important;
    margin-bottom: 2px;
  }
`;

const SITE_REFERENCE_HANDLERS = [
  {
    matches: ({ hostname }) => hostname.includes("mp.weixin.qq.com"),
    buildReference: ({ baseReference, href, title }) => {
      const officialAccount = document.getElementById("js_name");
      const publishDate = document.getElementById("publish_time");

      if (!officialAccount || !publishDate) {
        return baseReference;
      }

      publishDate.click();
      return `参考：[【微信公众号：${officialAccount.innerText}${publishDate.innerText}】${title}](${href})`;
    },
  },
];

const getMountTarget = () => document.body ?? document.documentElement;

const createButtonIcon = () => {
  const icon = createSvgElement("svg", {
    width: 16,
    height: 16,
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
      d: "M8 6C8 4.89543 8.89543 4 10 4H30L40 14V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V6Z",
      fill: "none",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linejoin": "round",
    }),
    createSvgElement("path", {
      d: "M16 20H32",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
    createSvgElement("path", {
      d: "M16 28H32",
      stroke: "#333",
      "stroke-width": 4,
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    })
  );
  return icon;
};

const createTimestamp = () => {
  const date = new Date();
  const dateText = date.toLocaleDateString().replace("/", "年").replace("/", "月");
  const timeText = date.toLocaleTimeString("chinese", {
    hour12: false,
  });

  return `更新：${dateText}日${timeText}`;
};

const buildReference = ({ href, title }) => `参考：[${title}](${href})`;

const getReference = () => {
  const context = {
    hostname: window.location.hostname,
    href: window.location.href,
    title: document.title,
  };
  const baseReference = buildReference(context);
  const handler = SITE_REFERENCE_HANDLERS.find(({ matches }) => matches(context));

  if (!handler) {
    return baseReference;
  }

  return handler.buildReference({
    ...context,
    baseReference,
  });
};

const getAddress = ({ hasQuote = true } = {}) => {
  const reference = getReference();
  return hasQuote ? `\n> ${reference}` : reference;
};

const copyText = async (text) => {
  try {
    await copyTextToClipboard(text);
  } catch (error) {
    console.error("复制失败：", error);
  }
};

const createCopyButton = () =>
  createElement({
    tagName: "button",
    text: BUTTON_TEXT,
    attributes: {
      id: BUTTON_ID,
      type: "button",
    },
    children: [createButtonIcon()],
    events: [
      {
        name: "click",
        handler: async () => {
          await copyText(`${createTimestamp()}${getAddress()}`);
        },
      },
      {
        name: "contextmenu",
        handler: async (event) => {
          event.preventDefault();
          await copyText(getAddress({ hasQuote: false }));
        },
      },
    ],
  });

const init = () => {
  if (!isTopWindow() || document.getElementById(BUTTON_ID)) {
    return;
  }

  const mountTarget = getMountTarget();
  if (!mountTarget) {
    return;
  }

  mountTarget.appendChild(createCopyButton());
  addStyle(BUTTON_STYLE, { id: STYLE_ID });
};

init();
