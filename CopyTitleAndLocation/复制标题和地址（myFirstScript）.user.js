// ==UserScript==
// 脚本名称
// @name         复制标题和地址（myFirstScript）
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  一键复制标题和地址为Markdown格式并带上当前时间（myFirstScript）
// @author       LiarCoder
// 在哪些页面生效, 支持通配符
// @match        *://*/*
// @grant        none
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVQ4jY3TO0tcURQF4G/ixFdhCIg2qWysZPwDsUkXSJk2Qso0IpLOTtLERkGwEjQhXV5d0gkGK6v7E/IHgg9EHR0nHLLvzGHujGbB5pzLOXvttfc6twaNRiMta1g1GG28xJfyRlEU6rF/FskpjvA4o7nABD7gM17hY3lYEjzHOd4NqP8QW3gURA+wJzYJI2hV0rq4xtfsexdPcwW3EQmLaSw4wVCQr+M1DtDEJt7iVz1jLRUsB0GOn9iPymWRJ7mChOFY5ysNVFHrHaKwKWEGUyG1HZcnMY4/0UarH0Ez1u+Yq9T8h5tw5BTTg1p4EYfNnuR6WC3srCgo+/odcRdK+7ubrGIRvfeLq7hz3KsgESXPE97HDFKfOUazxLFegst4MAmf7pGfkP6NNNAOwTesYAM/YkgdrzOcYRYLeJMTHMbTTE926T8U7GAb/gI+kkP5n3CsvwAAAABJRU5ErkJggg==
// ==/UserScript==

(function () {
  'use msgict';

  // 该函数用于创建一个<eleName k="attrs[k]">text</eleName>样式的页面元素
  function createEle(eleName, text, attrs) {
    let ele = document.createElement(eleName);
    // innerText 也就是 <p>text会被添加到这里</p>
    ele.innerText = text;
    // attrs 的类型是一个 map
    for (let k in attrs) {
      // 遍历 attrs, 给节点 ele 添加我们想要的属性
      ele.setAttribute(k, attrs[k]);
    }
    // 返回节点
    return ele;
  }

  // 【更新：2021年9月13日00:04:08】因为原生的alert弹框里的文本不能复制，所以我决定自己实现一个弹框以便我们手动复制结果
  function myAlert(msg) {
    if (document.getElementById('alert-box-iVBORw0KGg')) {
      return;
    }
    let alertBox = createEle('div', '本网页不支持操作剪切板，请手动复制下方内容：', {
      id: 'alert-box-iVBORw0KGg',
      style: `position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
        border-radius: 4px; padding: 20px 20px; width: 450px; height: 160px;
        background: #292A2D; color: #ffffff; line-height: 20px; z-index: 300;
        font-size: 12px; font-family: Microsoft YaHei;
    `});

    let msgBox = createEle('textarea', '', {
      style: `width: 445px; height: 80px; font-size: 12px !important; margin: 15px 0; resize: none;
    `});
    msgBox.innerHTML = msg;

    let closeBtn = createEle('button', '关闭', {
      style: `width: 64px; height: 32px; float: right; border: #799dd7; border-radius: 4px; background: #799dd7;
    `});

    closeBtn.onclick = function () {
      alertBox.parentNode.removeChild(alertBox);
    }
    alertBox.appendChild(msgBox);
    alertBox.appendChild(closeBtn);
    document.body.appendChild(alertBox);
  }

  let btnStyle = `
  #copy-title-and-location {
    position: fixed; top: 100px; left: -100px; opacity: 0.5; z-index: 2147483647; 
    background-image: none; cursor:pointer; color: #fff; background-color: #0084ff !important; 
    margin: 5px 0px; width: auto; border-radius: 3px; border: 1px solid; padding: 3px 6px; height: 26px;
    font-family: Arial, sans-serif; font-size: 12px; line-height: 17px; transition: left, 0.5s;
    }
  #copy-title-and-location:hover {
    left: 0px; opacity: 1;
  }`;
  let styleTag = createEle('style', btnStyle, { type: "text/css" });

  // let icon = 'https://i.loli.net/2021/07/27/duC5UMTYJeDILv2.png';
  let icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABTklEQVQ4jY3TO0tcURQF4G/ixFdhCIg2qWysZPwDsUkXSJk2Qso0IpLOTtLERkGwEjQhXV5d0gkGK6v7E/IHgg9EHR0nHLLvzGHujGbB5pzLOXvttfc6twaNRiMta1g1GG28xJfyRlEU6rF/FskpjvA4o7nABD7gM17hY3lYEjzHOd4NqP8QW3gURA+wJzYJI2hV0rq4xtfsexdPcwW3EQmLaSw4wVCQr+M1DtDEJt7iVz1jLRUsB0GOn9iPymWRJ7mChOFY5ysNVFHrHaKwKWEGUyG1HZcnMY4/0UarH0Ez1u+Yq9T8h5tw5BTTg1p4EYfNnuR6WC3srCgo+/odcRdK+7ubrGIRvfeLq7hz3KsgESXPE97HDFKfOUazxLFegst4MAmf7pGfkP6NNNAOwTesYAM/YkgdrzOcYRYLeJMTHMbTTE926T8U7GAb/gI+kkP5n3CsvwAAAABJRU5ErkJggg==';
  let imgTag = createEle('img', '', {
    src: icon,
    style: "width: auto; vertical-align: middle; margin-left: 10px; border-style: none;text-align: center;display: inline-block;margin-bottom: 2px"
  });
  let btn = createEle('button', '复制标题和地址', { id: "copy-title-and-location" });
  btn.appendChild(imgTag);

  btn.addEventListener('click', () => {
    let date = new Date();
    let timeStamp = date.toLocaleDateString().replace('\/', '年').replace('\/', '月') + '日' + date.toLocaleTimeString('chinese', { hour12: false });
    let titleTag = document.querySelector('title');
    let result = '更新：' + timeStamp + '\n> 参考：[' + titleTag.innerText + ']' + '(' + location + ')';
    // 匹配微信公众号的文章地址
    let regWeChat = /https:\/\/mp.weixin.qq.com\//;
    if (regWeChat.test(location.toString())) {
      let officialAccount = document.getElementById('js_name');
      let publishDate = document.getElementById('publish_time');
      publishDate.click();
      result = '更新：' + timeStamp + '\n> 参考：[【微信公众号：' + officialAccount.innerText + ' ' + publishDate.innerText + '】' + titleTag.innerText + ']' + '(' + location + ')';
    }
    // 【更新：2021年9月12日22:48:36】添加了一个try catch来应对当前页面不能访问 navigator.clipboard 对象的问题
    try {
      navigator.clipboard.writeText(result);
    } catch (err) {
      console.log('当前页面不支持访问 navigator.clipboard 对象：' + err);
      myAlert(result);
    }
  });

  // document.body.appendChild(style); // 这种写法会导致脚本在<iframe>标签的html文档的body标签也被选中
  // self === top 是用来判断当前页面是否是在<iframe>标签内，如果为true则表示不<iframe>标签内
  if (window.self === window.top) {
    if (document.querySelector('body')) {
      document.body.appendChild(btn);
      document.body.appendChild(styleTag);
    } else {
      document.documentElement.appendChild(btn);
      document.documentElement.appendChild(styleTag);
    }
  }
})();