# PRChecker更新日志

## V1.0

更新时间：2024年6月15日01:49:26

更新内容：

1、在bitbucket中点击创建PR按钮时，会弹出一个dialog，里面有若干项检查项用来提醒用户。

2、脚本支持一些简单的自定义扩展功能：

1. 脚本支持在浏览器控制台，通过 window.PrChecker.add('xxx') 的方式添加自定义check项
2. 脚本支持通过 window.PrChecker.clear() 的方式清除所有自定义check项

3、V1.0更新预览：

![PRChecker V1.0效果预览](https://private-user-images.githubusercontent.com/79459348/339850917-6d38c91a-9b0c-42ad-832c-2b9110065c97.png?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTgzODc5MTUsIm5iZiI6MTcxODM4NzYxNSwicGF0aCI6Ii83OTQ1OTM0OC8zMzk4NTA5MTctNmQzOGM5MWEtOWIwYy00MmFkLTgzMmMtMmI5MTEwMDY1Yzk3LnBuZz9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDA2MTQlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwNjE0VDE3NTMzNVomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTllMGZjOTBlODYzNWFiNWRlMWM4NThjZGQ4MzRkZTYyNmI5MjY0ZGE4MGUyMmNlNDI5ZTY4NTU3ZTE5Njc4MGMmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.AblGE4GGGKJLSpQ9U92OHw08M-Y5Yma_3mucWKqc6nQ)

## V1.1

更新时间：2024年6月15日03:12:32

更新内容：

1、修复PRChecker的获取创建按钮的逻辑出错的问题。

> 因为创建PR的按钮是一个input标签，无法插入子元素，所以需要一个包装元素。

## V1.2

更新时间：2024年6月19日12:42:46

更新内容：

1、优化脚本加载时机，只在创建PR的页面加载脚本。

## V1.2.1

更新时间：2024年7月22日12:34:34

更新内容：

1、默认check项目里增加copy代码检查。
