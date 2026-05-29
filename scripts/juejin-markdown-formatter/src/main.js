/**
   * @description: 该函数用于创建一个<eleName k="attrs[k]">text</eleName>样式的页面元素
   * @param {string} eleName DOM元素标签类型
   * @param {string} text  DOM元素内部文本
   * @param {object} attrs DOM元素属性配置
   * @return {HTMLElement} 返回一个DOM节点
   */
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

  /**
   * @description: 该函数用于截取目标字符串 target 中在指定的开始子串 startStr 和 结束子串 endStr 之间的字符串
   * @param {string} target  目标字符串
   * @param {string} startStr  开始子串
   * @param {string} endStr 结束子串
   * @return {string} 所截取的子串
   */
  function getSubStr(target, startStr, endStr) {
    let startPos = target.indexOf(startStr) + startStr.length;
    let endPos;
    if (startStr === endStr) {
      endPos = target.lastIndexOf(endStr);
    } else {
      endPos = target.indexOf(endStr);
    }
    return target.substring(startPos, endPos);
  }

  /**
   * @description: 该函数封装了替换原Markdown文档中相关文本的功能
   * @param {string} target  待处理的目标文本内容
   * @param {string} reg 正则表达式
   * @param {string} wrapperHead 预期的包装头
   * @param {string} wrapperTail 预期的包装尾
   * @param {string} startStr  截取内容时的开始子串
   * @param {string} endStr  截取内容时的结束子串
   * @return {string} 返回处理过的文档内容
   */
  function replaceText(target, reg, wrapperHead, wrapperTail, startStr, endStr) {
    let replacement = target.match(new RegExp(reg, 'g'));
    if (!replacement) {
      return target;
    }
    for (let i = 0; i < replacement.length; i++) {
      let content = getSubStr(replacement[i], startStr, endStr);
      let imgDescription = '';
      // 判断当前匹配的是否为Markdown中的图片
      if (reg === '!\\[.*\\]\\(.*\\)') {
        imgDescription = `<div align="center" color="gray">${getSubStr(replacement[i], '[', ']')}</div><br>`;
      }
      replacement[i] = wrapperHead + content + wrapperTail + imgDescription;
    }
    for (let i = 0; i < replacement.length; i++) {
      target = target.replace(new RegExp(reg), replacement[i]);
    }
    // 【更新：2021年9月2日00:53:08】一定要返回处理结果！！！！
    return target;
  }

  const inputTag = createEle('input', '', {
    id: 'juejin-formatter-import-md-file',
    accept: '.md',
    type: 'file',
    style: 'display: none'
  });

  const importLabel = createEle('label', '', {
    for: 'juejin-formatter-import-md-file',
    class: 'bytemd-toolbar-icon',
    'data-title': '导入Markdown文档'
  });

  let tooltipStyle = `label[for="juejin-formatter-import-md-file"] {
      vertical-align: middle;
      cursor: pointer;
    }

    [data-title] {
      position: relative;
      overflow: visible;
    }

    label[for="juejin-formatter-import-md-file"]:before,
    label[for="juejin-formatter-import-md-file"]:after {
      display: block;
      position: fixed;
      opacity: 0;
      transition: .15s .15s;
      visibility: hidden;
    }

    label[for="juejin-formatter-import-md-file"]:before {
      content: attr(data-title);
      z-index: 2;
      transform: translate(-53px, -36px);
      border-radius: 5px;
      padding: 5px 10px;
      line-height: 16px;
      text-align:center;
      background-color: #333333;
      color: #fff;
      font-size: 12px;
      font-style: normal;
      white-space: nowrap;
    }

    label[for="juejin-formatter-import-md-file"]:after {
      content: '';
      z-index: 1;
      transform: translate(2px, -38px);
      width: 0;
      height: 0;
      margin-bottom: -12px;
      overflow: hidden;
      border: 10px solid transparent;
      border-top-color: #333333;
    }

    label[for="juejin-formatter-import-md-file"]:hover:before,
    label[for="juejin-formatter-import-md-file"]:hover:after {
      visibility: visible;
      opacity: 1;
    }`;

  const tooltipStyleTag = createEle('style', tooltipStyle, {
    type: "text/css"
  });

  // 把原本的图片换成了 svg ，这样就能和原本的其他图标一样适应白天模式和暗黑模式
  importLabel.innerHTML = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="12" height="12" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" fill="white" fill-opacity="0.01"></rect>
      <path d="M6 24.0083V42H42V24" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M33 23L24 32L15 23" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M23.9917 6V32" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
    </svg>`;

  // 设置定时器是为了防止文档中还未加载出相关的元素而导致无法获取相应DOM元素
  setTimeout(() => {
    let btnGroup = document.querySelector('#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-toolbar > div.bytemd-toolbar-right');
    btnGroup.style.position = 'relative';
    btnGroup.insertBefore(inputTag, btnGroup.firstChild);
    btnGroup.insertBefore(importLabel, btnGroup.firstChild);
    btnGroup.insertBefore(tooltipStyleTag, btnGroup.firstChild);
    let titleInput = document.querySelector('#juejin-web-editor > div.edit-draft > div > header > input');

    //#region 
    // titleInput.addEventListener('input', function () {
    //   console.log('The value is now ' + titleInput.value);
    // });
    // let event = document.createEvent('UIEvents');
    // event.initEvent("keyup", false, true);
    //#endregion

    // 本来是想直接把处理好的文本内容放到编辑器中对应的节点的，虽然确实可以把文本塞进去，但是似乎没法达到预期的效果
    // const inputCase = document.querySelector('#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-body > div.bytemd-editor > div > div.CodeMirror-scroll > div.CodeMirror-sizer > div > div > div > div.CodeMirror-code > pre');
    if (window.FileList && window.File && window.FileReader) {
      document.getElementById('juejin-formatter-import-md-file').addEventListener('change', event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.addEventListener('load', event => {
          let content = event.target.result;

          // 替换高亮处，将 == 包裹的文本改为用 <mark></mark> 标签包裹
          // 更新：2021年9月1日17:08:05，用 ==.*?== 这个正则表达式也能达到相同的效果
          // let reg = new RegExp('==[^==]*==','g');  // 这个正则表达式也是可以实现功能的，但下面的更通用

          content = replaceText(content, '==.*?==', '<mark>', '</mark>', '==', '==');

          // 替换图片链接格式，将 ![]() 包裹的图片改为用 <div align="center"><img src=""></div> 标签包裹 

          content = replaceText(content, '!\\[.*\\]\\(.*\\)', '<div align="center"><img src="', '"></div>', '(', ')');

          // 替换居中格式，将 <center></center> 包裹的内容改为用 <div align="center"></div> 标签包裹

          content = replaceText(content, '<center>.*<\\/center>', '<div align="center">', '</div>', '<center>', '</center>');

          // inputCase.innerText = content;
          // 因为直接往上面的 inputCase 里放文本内容的话，掘金的Markdown编辑器没法儿按预期效果解析，所以直接把处理好的内容放到剪切板里
          navigator.clipboard.writeText(content);
          // navigator.clipboard.writeText('ceshi');

          // 在标题输入框自动填入标题
          let contentTitle = content.match(/#\s.*/g);
          if (contentTitle) {
            titleInput.value = contentTitle[0].substr(2) + ' ';
          } else {
            // 如果文档中没有一级标题，则截取文档的前10个字符作为标题
            titleInput.value = content.substring(0, 10) + ' ';
          }
          titleInput.focus();

          // let site = location.toString();
          // let draftId = site.substr(site.lastIndexOf('/') + 1);

          //#region 
          // axios({
          //   //请求方法
          //   method : 'POST',
          //   //url
          //   url: 'https://api.juejin.cn/content_api/v1/article_draft/update',
          //   //url参数
          //   // params: {
          //   //     vip:10,
          //   //     level:30
          //   // },
          //   //头信息
          //   headers: {
          //     cookie: '_ga=GA1.2.2021047263.1607591300; passport_csrf_token_default=b868153db8984259b48a37cef01b9bdb; passport_csrf_token=b868153db8984259b48a37cef01b9bdb; sid_guard=e515729ebb137003b7a09788476b7f59%7C1626359813%7C5184000%7CMon%2C+13-Sep-2021+14%3A36%3A53+GMT; uid_tt=8fd6a17e8dd84563a4c3e62e994202fd; uid_tt_ss=8fd6a17e8dd84563a4c3e62e994202fd; sid_tt=e515729ebb137003b7a09788476b7f59; sessionid=e515729ebb137003b7a09788476b7f59; sessionid_ss=e515729ebb137003b7a09788476b7f59; n_mh=vGLajkPe1EhNvDx0-4pj7kl73g15TZuLHOKOpZJGxZo; MONITOR_WEB_ID=e9557ff4-b917-4c6f-bad5-8f8a7cbb8a72; _tea_utm_cache_2608={%22utm_source%22:%22infinitynewtab.com%22}; _gid=GA1.2.529467815.1630120666; _gat=1',
          //     referer: 'https://juejin.cn/editor/drafts/7003406308921573389',
          //     'sec-fetch-dest': 'empty',
          //     'sec-fetch-mode': 'cors',
          //     'sec-fetch-site': 'same-site',
          //     'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
          //   },
          //   //请求体参数
          //   data: {
          //     id:draftId, 
          //     title:contentTitle[0].substr(2)
          //   }
          // }).then(response=>{
          //     //响应状态码
          //     console.log(response.status);
          //     //响应状态字符串
          //     // console.log(response.statusText);
          //     //响应头信息
          //     // console.log(response.headers);
          //     //响应体
          //     console.log(response);
          // }).catch(error => {
          //   console.log(error);
          // });
          //#endregion

          //#region 
          // $.ajax({
          //   //url
          //   url: 'https://api.juejin.cn/content_api/v1/article_draft/update',
          //   //参数
          //   data: {
          //     id:draftId, 
          //     title:contentTitle[0].substr(2)
          //   },
          //   //请求类型
          //   type: 'POST',
          //   //响应体结果
          //   dataType: 'json',
          //   //成功的回调
          //   success: function(data){
          //       console.log(data);
          //   },
          //   //超时时间
          //   // timeout: 2000,
          //   //失败的回调
          //   error: function(){
          //       console.log('出错啦!!');
          //   }
          //   //头信息
          //   // headers: {
          //   //     c:300,
          //   //     d:400
          //   // }
          // });
          //#endregion

          // setInterval(() => {
          //   titleInput.dispatchEvent(event);
          // }, 1000);

          alert('文档处理完毕，删除标题尾部空格，然后在编辑区按下 Ctrl + V 粘贴内容');
        });
        // reader.readAsDataURL(file);
        reader.readAsText(file);
        // 2021年8月30日01:05:44成功实现读取文件并修改的操作。
      });
    }
  }, 2000);
