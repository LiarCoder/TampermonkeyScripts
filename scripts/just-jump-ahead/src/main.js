// CLICK_REDIRECT_RULES 存储了相应拦截页面与其中的【继续访问】按钮的 CSS 选择器映射关系。
const CLICK_REDIRECT_RULES = [
  // 匹配掘金的跳转拦截页面网址。
  {
    urlIncludes: "://link.juejin.cn/",
    selector: "#app > div > div > button",
  },
  // 匹配简书的跳转拦截页面网址。
  {
    urlIncludes: "://www.jianshu.com/go-wild",
    selector: "._3OuyzjzFBDdQwRGk08HXHz_0",
  },
  // 匹配知乎的跳转拦截页面网址。
  {
    urlIncludes: "://link.zhihu.com/",
    selector: "a.button",
  },
  // 匹配百度贴吧的跳转拦截页面网址。
  {
    urlIncludes: "://jump.bdimg.com/safecheck",
    selector: "div.warning_info.fl > a:nth-child(2)",
  },
  // 匹配 CSDN 的跳转拦截页面网址。
  {
    urlIncludes: "://link.csdn.net/",
    selector: "a.loading-btn",
  },
];

// TEXT_REDIRECT_RULES 存储了相应拦截界面与其中的需要用户手动复制的网址的 CSS 选择器映射关系。
const TEXT_REDIRECT_RULES = [
  // 匹配 PC 端 QQ 的跳转拦截页面网址。
  {
    urlIncludes: "://c.pc.qq.com/middlem.html",
    selector: "#url",
  },
];

// QUERY_REDIRECT_RULES 存储了通过 URL 参数携带目标地址的跳转拦截页面规则。
const QUERY_REDIRECT_RULES = [
  // 匹配 Gitee 的跳转拦截页面网址。
  {
    urlIncludes: "://gitee.com/link",
    parameterName: "target",
  },
];

const getCurrentAddress = () => window.location.toString();

const findMatchedRule = (rules, currentAddress) =>
  rules.find(({ urlIncludes }) => currentAddress.includes(urlIncludes));

const redirectTo = (targetAddress) => {
  if (!targetAddress) {
    return false;
  }

  window.location.assign(targetAddress);
  return true;
};

const clickRedirectButton = ({ selector }) => {
  // jumpBtn 是各个跳转页面中的类似于【继续访问】的按钮，用户可以点击按钮以继续访问被拦截的链接。
  const jumpBtn = document.querySelector(selector);
  if (!jumpBtn) {
    return false;
  }

  jumpBtn.click();
  return true;
};

const redirectByTextContent = ({ selector }) => {
  const targetElement = document.querySelector(selector);
  // targetAddress 是针对像在 PC 端 QQ 中的拦截页面中需要用户手动复制的目标链接。
  const targetAddress = targetElement?.innerText?.trim();

  return redirectTo(targetAddress);
};

const getQueryParameter = (parameterName) => {
  try {
    return new URL(window.location.href).searchParams.get(parameterName)?.trim() ?? "";
  } catch {
    return "";
  }
};

const redirectByQueryParameter = ({ parameterName }) => {
  const targetAddress = getQueryParameter(parameterName);

  return redirectTo(targetAddress);
};

const runMatchedRule = (rules, currentAddress, runner) => {
  const matchedRule = findMatchedRule(rules, currentAddress);
  if (!matchedRule) {
    return false;
  }

  return runner(matchedRule);
};

const init = () => {
  // currentAddress 是当前拦截页面的完整网址。
  const currentAddress = getCurrentAddress();

  // 开始逐个遍历 CLICK_REDIRECT_RULES 中的规则，若有匹配上的，则获取相应按钮元素并自动点击完成跳转。
  if (runMatchedRule(CLICK_REDIRECT_RULES, currentAddress, clickRedirectButton)) {
    return;
  }

  // 开始逐个遍历 TEXT_REDIRECT_RULES 中的规则，若有匹配上的，则自动将浏览器的 location 指向目标网站完成跳转。
  if (runMatchedRule(TEXT_REDIRECT_RULES, currentAddress, redirectByTextContent)) {
    return;
  }

  runMatchedRule(QUERY_REDIRECT_RULES, currentAddress, redirectByQueryParameter);
};

if (document.readyState === "complete") {
  init();
} else {
  window.addEventListener("load", init, { once: true });
}
