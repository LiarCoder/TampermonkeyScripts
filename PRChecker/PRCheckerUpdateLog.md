# PRChecker更新日志

在bitbucket中创建PR前强制给用户展示若干个检查项。

## 安装地址

> [Greasy Fork - PR 三思器](https://greasyfork.org/zh-CN/scripts/497933-pr%E4%B8%89%E6%80%9D%E5%99%A8)

## 功能介绍

- 在bitbucket中点击创建PR按钮时，会弹出一个dialog，里面有若干项检查项用来提醒用户。

效果预览：

![PRChecker V1.0效果预览](https://private-user-images.githubusercontent.com/79459348/339850917-6d38c91a-9b0c-42ad-832c-2b9110065c97.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTgzODc5MTUsIm5iZiI6MTcxODM4NzYxNSwicGF0aCI6Ii83OTQ1OTM0OC8zMzk4NTA5MTctNmQzOGM5MWEtOWIwYy00MmFkLTgzMmMtMmI5MTEwMDY1Yzk3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA2MTQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNjE0VDE3NTMzNVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTllMGZjOTBlODYzNWFiNWRlMWM4NThjZGQ4MzRkZTYyNmI5MjY0ZGE4MGUyMmNlNDI5ZTY4NTU3ZTE5Njc4MGMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.AblGE4GGGKJLSpQ9U92OHw08M-Y5Yma_3mucWKqc6nQ)

## 更新日志

### v1.2.3 (2026-02-04 23:29:34)

1. 将公共样式抽离出来，方便复用。
2. 优化：将创建 dialog 的逻辑抽离成一个函数，方便复用。
3. 优化 createElement 函数，
     a. 支持传入一个函数作为子元素。
     b. 支持传入一个事件对象作为事件处理函数。

### v1.2.2 (2025-02-16 12:34:34)

1. 优化：用createDocumentFragment 优化插入多个DOM元素的逻辑以提升渲染性能。
2. 优化：优化代码格式和解构语法。

### v1.2.1 (2024-07-22 12:34:34)

1. 新增：默认check项目里增加copy代码检查。

### v1.2.0 (2024-06-19 12:42:46)

1. 优化：优化脚本加载时机，只在创建PR的页面加载脚本。

### v1.1.0 (2024-06-15 03:12:32)

1. 修复：修复PRChecker的获取创建按钮的逻辑出错的问题。

> 因为创建PR的按钮是一个input标签，无法插入子元素，所以需要一个包装元素。

### v1.0.0 (2024-06-15 01:49:26)

1. 新增：在bitbucket中点击创建PR按钮时，会弹出一个dialog，里面有若干项检查项用来提醒用户。
2. 新增：脚本支持一些简单的自定义扩展功能：
     1. 脚本支持在浏览器控制台，通过 window.PrChecker.add('xxx') 的方式添加自定义check项
     2. 脚本支持通过 window.PrChecker.clear() 的方式清除所有自定义check项
