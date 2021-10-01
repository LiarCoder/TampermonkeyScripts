<!--
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-25 19:57:26
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-09-25 19:57:26
-->
# 美化网页的代码字体

脚本安装地址：

> 参考：[改变网页代码块的字体样式](https://greasyfork.org/zh-CN/scripts/432756-%E6%94%B9%E5%8F%98%E7%BD%91%E9%A1%B5%E4%BB%A3%E7%A0%81%E5%9D%97%E7%9A%84%E5%AD%97%E4%BD%93%E6%A0%B7%E5%BC%8F)

## 更新日志

### V0.1

更新时间：2021年9月20日23:04:41

更新功能：

1、改变LeetCode、CSDN、博客园、greasyfork嵌入的代码的显示样式（由原来的宋体改为个人更喜欢的Cascadia Code或YaHei Consolas Hybrid或Lucida Console字体（当然，<mark>前提是用户本地安装了相应的字体</mark>）。后面还可以加上诸如Monacc，monospace的候选补充。要是你要自己喜欢的其他字体，那就在 `font-family` 后面加上字体名称就可以了，注意字体名称是打开字体文件后所显示的字体名称。比如：

![](https://i.loli.net/2021/09/21/UwCoK3XvjYT5enG.png)

### V0.2

更新时间：2021年9月23日00:41:45

更新功能：

1、修复了在LeetCode编辑区选中文字时会出现因空格字符宽度变化而导致的闪跳和位移。

### V0.3

更新时间：2021年9月24日16:17:07

更新功能：

1、解决了（准确来说是避免了）LeetCode编辑区字体设置为YaHei Consolas Hybrid时出现的光标偏移问题。

2、将LeetCode问题描述区的字体也改为了 Cascadia Code 和 YaHei Consolas Hybrid。

### V0.4

更新时间：2021年9月25日19:53:36

更新功能：

1、增加对GitHub代码块字体的改变。

2、增加对LeetCode运行结果区的文字样式改变。

V0.4.1

更新时间：2021年10月1日17:43:14

更新功能：

1、增加了对CSDN部分网页的代码块元素的选择器。

![image-20211001174656928](https://i.loli.net/2021/10/01/5igyaz1lm8cnsvS.png)

> 适配目标网址：[【JavaScript】数组的sort方法排序原理详解_汪小穆的博客-CSDN博客_数组sort排序原理](https://wangxiaomu.blog.csdn.net/article/details/79540263)

