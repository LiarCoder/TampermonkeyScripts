<!--
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-29 19:17:01
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-11-18 13:22:34
-->

# 自动继续访问页面

## 脚本安装地址
> 参考：[greasyfork：JustJumpAhead](https://greasyfork.org/zh-CN/scripts/433155-justjumpahead)

## 前言

在掘金、简书、知乎等平台，如果页面中有一些指向其他网站的外部链接，可能会出现类似下面这种的链接跳转拦截页面来提示我们将离开本站，要注意财产安全。这个时候就需要我们手动点击继续访问才能继续跳转。这种设计本意是好的，但是有些指向GitHub或技术论坛的链接也会被拦截，总感觉很不友好。于是我就写了这个脚本。

![掘金的跳转提示页面](https://i.loli.net/2021/09/29/lkEoUTq5IuXrsSa.png)

脚本功能比较简单，就是当遇到像上面的跳转提示页面时，自动点击【继续访问】按钮。目前只适配掘金、简书、知乎的跳转拦截页面。

## 更新日志

### V0.1

更新时间：2021年9月29日19:29:16

更新功能：

1、当遇到掘金、简书、知乎的跳转拦截页面时，自动点击【继续访问】按钮。

### V0.2

更新时间：2021年9月29日23:47:46

更新功能：

1、增加对PC端QQ的跳转拦截页面的适配。

2、增加对百度贴吧跳转拦截页面的适配。

### V0.3

更新时间：2021年9月30日15:25:16

更新功能：

1、未增加额外功能，只是对代码结构进行了调整。

### V0.3.1

更新时间：2021年10月4日14:12:36

更新功能：

1、增加对CSDN跳转拦截页面的适配（终于蹲到它了，本来最开始就想着把它加进适配名单的，但是苦于没找到测试网址）。

### V0.3.2

更新时间：2021年10月4日17:16:09

更新功能：

1、对网页的适配正则进行了一点小小的修改，用来应对有些拦截页面的协议可以是http也可能是https协议的情况。

## 有关参考
> 更新：2021年9月30日15:27:05

> 参考：[Map - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map)

> 参考：[String.prototype.indexOf() - JavaScript | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf)

### V0.3.3

更新时间：2021年11月18日13:20:42

更新功能：

1、将原来放在setTimeout定时器中的逻辑改为了window.onload回调函数内容。逻辑显得更加清晰。