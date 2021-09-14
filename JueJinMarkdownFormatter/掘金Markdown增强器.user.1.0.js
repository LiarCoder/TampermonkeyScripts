// ==UserScript==
// @name         掘金Markdown增强器
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  掘金Markdown编辑器增强脚本：从本地导入Markdown文件，并对文档做一些处理：居中图片、居中图片标注的文字、解决==无法高亮的问题
// @author       LiarCoder
// @match        https://juejin.cn/editor/*
// @icon         data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFHGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA4LTMwVDE2OjMwOjUzKzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wOC0zMFQxNjozMjozNiswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6MGIwNjE2ODItMWZiMy0zODQzLTlmMmUtNzBmNjUxODY4MmUzIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowYjA2MTY4Mi0xZmIzLTM4NDMtOWYyZS03MGY2NTE4NjgyZTMiIHN0RXZ0OndoZW49IjIwMjEtMDgtMzBUMTY6MzA6NTMrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz5n1ZAhAAACMElEQVQ4y2P8//8/MwNh8BdKE1TLRIRh/69du6Z/+fJlIxCbkGJGAi4Eu8zY2Pj9t2/fBK5fv85IyKXEuJCBlZX1PxsbGzFKGViIUcTOzv79379/nMSoJcqFpACqGwjzMij2/kEtYERKJsQkIxS9MBf+Q6L/v3r1ShqYTPRguoHhxwTCMD4wGek+e/ZMDskwuBkgRf9u3bqlHRAQsPnChQtmIP6kSZPq9PT0Lm7dujUMGim/gTEN1nDgwAFPbW3tS93d3W0gtTdu3ND28fHZcu7cOUuwocB0yLBs2bJYkG1z5swpAvGvXLmiJy8v/xUktmHDBq+IiIhDQAuvbt++3QUkJi4u/vf8+fPGILVLly4F6509e3YxiA/2Bicn5zcQzc3N/RlEg1xw9OhRHTk5ue9Ag7Y+ffpU9927dzL+/v67xcTEGIByugYGBmdBarm4uMB6eXh4PsEjhZGR8T8yDQpsaWnp+ydPntSwt7e/funSJQFmZmYGkGFHjhxRA7r+NjRC/qLrxZdsmCUkJB7t379fQ0hI6DswHP/u27dPG8kwsnIKs5SU1OMTJ06o//nzhxXIvkeoxEExUERE5DlaOgMDoFcfY0mDMLknsIIGbuCvX7/YQGEE9J7nly9fQGHBRmTG+AVManYgvb9//2aFZBFgVG/bts0LmkjJxmvWrIkGmQUqD5l+/vzJtmPHDv+PHz9yA4spRlLyLtBl/4HJ7Zu7u/tmIP0dVsD+pVLZwAwA0KEB2b6h03UAAAAASUVORK5CYII=
// @grant        none
// ==/UserScript==

(function () {
	'use strict';
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

	const inputTag = createEle('input', '', {
		id: 'juejin-enhancer-import-md-file',
		accept: '.md',
		type: 'file',
		style: 'display: none'
	});

	const importLabel = createEle('label', '', {
		for: 'juejin-enhancer-import-md-file',
		title: '导入Markdown文件',
		style: `display: inline-block;
			width: 14px;
			height: 14px;
			cursor: pointer;
			margin: 5px 10px;
      background-image: url(https://i.loli.net/2021/08/30/SH5kMUjyAFqDn2V.png);
			background-size: 14px 14px;
			background-color: white !important;
			border-radius: 2px;`
	});


	// 设置定时器是为了防止文档中还未加载出相关的元素
	setTimeout(() => {
		let btnGroup = document.querySelector('#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-toolbar > div.bytemd-toolbar-right');
		// console.log(btnGroup);
		btnGroup.insertBefore(inputTag, btnGroup.firstChild);
		btnGroup.insertBefore(importLabel, btnGroup.firstChild);
		// 本来是想直接把处理好的文本内容放到编辑器中对应的节点的，虽然确实可以把文本塞进去，但是似乎没法达到预期的效果
		// const inputCase = document.querySelector('#juejin-web-editor > div.edit-draft > div > div > div > div.bytemd-body > div.bytemd-editor > div > div.CodeMirror-scroll > div.CodeMirror-sizer > div > div > div > div.CodeMirror-code > pre');
		if (window.FileList && window.File && window.FileReader) {
			document.getElementById('juejin-enhancer-import-md-file').addEventListener('change', event => {
				const file = event.target.files[0];
				const reader = new FileReader();
				reader.addEventListener('load', event => {
					let content = event.target.result;
					// console.log(typeof event.target.result);

					// 2021年8月30日19:36:05，下面这几个操作有重复性，应该考虑封装为函数
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
						imgReplace[i] = `<div align="center"><img src="${imgLink}"></div>`;
					}

					for (let i = 0; i < imgReplace.length; i++) {
						content = content.replace(/!\[.*\]\(.*\)/, imgReplace[i]);
					}

					// 替换居中格式，将 <center></center> 包裹的内容改为用 <div align="center"></div> 标签包裹
					let centerReplace = content.match(/<center>.*<\/center>/g);
					for (let i = 0; i < centerReplace.length; i++) {
						let centerContent = centerReplace[i].slice(centerReplace[i].indexOf('>') + 1, centerReplace[i].lastIndexOf('<'));
						centerReplace[i] = `<div align="center">${centerContent}</div>`;
					}
					for (let i = 0; i < centerReplace.length; i++) {
						content = content.replace(/<center>.*<\/center>/, centerReplace[i]);
					}
					// inputCase.innerText = content;
					// 因为直接往上面的 inputCase 里放文本内容的话，掘金的Markdown编辑器没法儿按预期效果解析，所以直接把处理好的内容放到剪切板里
					navigator.clipboard.writeText(content);
				});
				// reader.readAsDataURL(file);
				reader.readAsText(file);
				// 2021年8月30日01:05:44成功实现读取文件并修改的操作。
			});
		}
	}, 2000);
})();