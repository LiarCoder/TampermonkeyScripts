<!--
 * @Descripttion: 
 * @version: 
 * @Author: LiarCoder
 * @Date: 2021-09-15 00:55:56
 * @LastEditors: LiarCoder
 * @LastEditTime: 2021-09-25 20:20:46
-->
# TampermonkeyScripts
油猴脚本练习

## 工程化开发

当前仓库使用 pnpm workspace 管理脚本工程：

- `packages/shared`：跨脚本复用的 DOM、样式、路由和缓存工具。
- `scripts/*/legacy`：原始脚本文件，保留历史和对照。
- `scripts/*/src`：各脚本的 Vite 构建入口。
- `scripts/bilibili-share-to-friends/src`：已按 API、UI、样式、元信息做首个深度拆分的试点。

常用命令：

```shell
pnpm install
pnpm dev:bilibili
pnpm build:bilibili
pnpm build
pnpm shell:bilibili
pnpm lint
pnpm test
```

开发同步有两种方式：

1. 推荐先运行 `pnpm dev:bilibili`，按 `vite-plugin-monkey` 打开的安装页安装开发版脚本。之后本地代码变更会通过 Vite dev server 加载，通常不需要再复制粘贴到 Tampermonkey 编辑器。
2. 如果目标页面 CSP 或浏览器环境导致 dev server 注入不可用，运行 `pnpm shell:bilibili` 生成 `scripts/bilibili-share-to-friends/dev/*.local.user.js`。在 Tampermonkey 安装这个壳脚本，并在 Chrome/Edge 扩展详情中打开 Tampermonkey 的 “Allow access to file URLs”。之后配合 `pnpm --filter @tampermonkey-scripts/bilibili-share-to-friends build:watch`，刷新目标页面即可加载本地 `dist/*.user.js`。

prod 构建默认不压缩混淆，生成的 `scripts/<name>/dist/*.user.js` 可读，便于调试和提交到 Greasy Fork。

为了方便在写提交信息时指明所修改的脚本，我特地把我写的脚本做以下编号：

## ①号脚本：

CopyTitleAndLocation.user.js

更新：2025-02-12 21:03:33

> 脚本安装地址：[复制标题和地址（myFirstScript）](https://greasyfork.org/zh-CN/scripts/483589-%E5%A4%8D%E5%88%B6%E6%A0%87%E9%A2%98%E5%92%8C%E5%9C%B0%E5%9D%80)
>
> 相关博客地址：[【油猴脚本编写初体验】一键复制网页标题和地址（copy-title-and-location）_赖念安的博客-CSDN博客](https://blog.csdn.net/qq_44879358/article/details/118896682)

## ②号脚本：

掘金Markdown格式适配器.user.3.3.js（JueJinMarkdownFormatter）

更新：2021年9月25日20:24:03

> 脚本安装地址：[掘金Markdown格式适配器](https://greasyfork.org/zh-CN/scripts/431632-%E6%8E%98%E9%87%91markdown%E6%A0%BC%E5%BC%8F%E9%80%82%E9%85%8D%E5%99%A8)
>
> 相关博客地址：[油猴脚本——掘金Markdown格式适配器知识点记录【油猴脚本、Markdown、浏览器文件读取、tooltip、SVG、、模拟用户输入、aria-xxxx属性、剪切板操作、】_赖念安的博客-CSDN博客](https://blog.csdn.net/qq_44879358/article/details/120089878)

## ③号脚本：

BeautifyCodeBlockFontStyle.user.js

更新：2025-02-12 22:17:44

> 脚本安装地址：[改变网页代码块的字体样式](https://greasyfork.org/zh-CN/scripts/483590-%E6%94%B9%E5%8F%98%E7%BD%91%E9%A1%B5%E4%BB%A3%E7%A0%81%E5%9D%97%E7%9A%84%E5%AD%97%E4%BD%93%E6%A0%B7%E5%BC%8F)
>
> 相关博客地址：[【油猴脚本】改变网页代码块的字体样式/美化LeetCode代码文字显示（CSS；设置@font-face和font-family）_赖念安的博客-CSDN博客](https://blog.csdn.net/qq_44879358/article/details/120412081)

## ④号脚本：

JustJumpAhead.user.js（自动继续跳转页面）

更新：2021年9月29日23:59:20

> 脚本安装地址：[JustJumpAhead](https://greasyfork.org/zh-CN/scripts/433155-justjumpahead)
>
> 相关博客地址：[【油猴脚本】自动继续访问页面JustJumpAhead（location；正则）_赖念安的博客-CSDN博客](https://blog.csdn.net/qq_44879358/article/details/120558187)

## ⑤ 号脚本：

PRChecker.user.js（PR三思器，在bitbucket中创建PR前强制给用户展示若干个检查项）

更新：2024年6月15日01:46:20

> 脚本安装地址：[PRChecker](https://greasyfork.org/zh-CN/scripts/497933-pr%E4%B8%89%E6%80%9D%E5%99%A8)

## ⑥ 号脚本：

BilibiliShareToFriends.user.js（在 Bilibili 视频播放页分享面板中新增“分享给 B站好友”功能）

更新：2026年5月29日
