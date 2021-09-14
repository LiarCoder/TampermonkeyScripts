// 封装 Node 中 fs 模块中的读写文件操作

const fs = require('fs');
const { resolve } = require('path');
const util = require('util');
const myReadFile = util.promisify(fs.readFile);
const myWriteFile = util.promisify(fs.writeFile);

myReadFile('./axios - 副本.md')
  .then(data => {
    let content = data.toString();
    // 替换高亮处，将 == 包裹的文本改为用 <mark></mark> 标签包裹
    // let reg = new RegExp('==[^==]*==','g');  // 这个正则表达式也是可以实现功能的，但下面的更通用
    let highLightReplace = content.match(/==(?:(?!(==)).)*==/g);
    // console.log(highLightReplace, `共有${highLightReplace.length}处高亮`);
    for (let i = 0; i < highLightReplace.length; i++) {
      highLightReplace[i] = '<mark>' + highLightReplace[i].substr(highLightReplace[i].indexOf('==') + 2, highLightReplace[i].lastIndexOf('==') - 2) + '</mark>';
    }
    for (let i = 0; i < highLightReplace.length; i++) {
      content = content.replace(/==(?:(?!(==)).)*==/, highLightReplace[i]);
    }

    // 替换图片链接格式，将 ![]() 包裹的图片改为用 <div align="center"><img src=""></div> 标签包裹 
    let imgReplace = content.match(/!\[.*\]\(.*\)/g);
    for (let i = 0; i < imgReplace.length; i++) {
      let imgLink = imgReplace[i].slice(imgReplace[i].indexOf('(') + 1, imgReplace[i].lastIndexOf(')'));
      imgReplace[i] = `<div align="center"><img src="${imgLink}"></div>`
    }

    for (let i = 0; i < imgReplace.length; i++) {
      content = content.replace(/!\[.*\]\(.*\)/, imgReplace[i]);
    }

    // 替换居中格式，将 <center></center> 包裹的内容改为用 <div align="center"></div> 标签包裹
    let centerReplace = content.match(/<center>.*<\/center>/g);
    for (let i = 0; i < centerReplace.length; i++) {
      let centerContent = centerReplace[i].slice(centerReplace[i].indexOf('>') + 1, centerReplace[i].lastIndexOf('<'));
      centerReplace[i] = `<div align="center">${centerContent}</div>`
    }

    for (let i = 0; i < centerReplace.length; i++) {
      content = content.replace(/<center>.*<\/center>/, centerReplace[i]);
    }
    // console.log(content);
    myWriteFile('./processed.md', content);
  }, error => {
    console.warn(error);
  })
  // .then(data => {

  //   // myWriteFile('./processed.md', data);
  // }, error => {
  //   console.warn(error);
  // });