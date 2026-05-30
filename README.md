# TampermonkeyScripts

油猴脚本练习

## 脚本列表

| 脚本                     | 功能描述                                                                                      | 安装地址                                                                                                                                                                | 相关资料                                                            | 子工程                                   |
| ------------------------ | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------- |
| 复制标题和地址           | 一键复制当前页面标题和地址为 Markdown 格式，并带上当前时间。                                  | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/483589-%E5%A4%8D%E5%88%B6%E6%A0%87%E9%A2%98%E5%92%8C%E5%9C%B0%E5%9D%80)                                              | [博客](https://blog.csdn.net/qq_44879358/article/details/118896682) | `scripts/copy-title-and-location`        |
| 掘金 Markdown 格式适配器 | 从本地导入 Markdown 文件，并对掘金编辑器中的文档格式做适配处理。                              | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/431632-%E6%8E%98%E9%87%91markdown%E6%A0%BC%E5%BC%8F%E9%80%82%E9%85%8D%E5%99%A8)                                      | [博客](https://blog.csdn.net/qq_44879358/article/details/120089878) | `scripts/juejin-markdown-formatter`      |
| 改变网页代码块的字体样式 | 将 LeetCode、CSDN、掘金、博客园等页面代码块字体调整为更适合阅读的字体。                       | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/483590-%E6%94%B9%E5%8F%98%E7%BD%91%E9%A1%B5%E4%BB%A3%E7%A0%81%E5%9D%97%E7%9A%84%E5%AD%97%E4%BD%93%E6%A0%B7%E5%BC%8F) | [博客](https://blog.csdn.net/qq_44879358/article/details/120412081) | `scripts/beautify-code-block-font-style` |
| JustJumpAhead            | 自动完成掘金、简书、知乎、百度贴吧、CSDN、Gitee 等跳转询问页面的继续访问操作。                | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/433155-justjumpahead)                                                                                                | [博客](https://blog.csdn.net/qq_44879358/article/details/120558187) | `scripts/just-jump-ahead`                |
| PR三思器                 | 在 Bitbucket 创建 PR 前展示检查项，降低遗漏风险。                                             | [Greasy Fork](https://greasyfork.org/zh-CN/scripts/497933-pr%E4%B8%89%E6%80%9D%E5%99%A8)                                                                                | -                                                                   | `scripts/pr-checker`                     |
| B站视频分享给好友        | 在 Bilibili 视频播放页分享面板中新增“B站好友”入口，将当前视频发送给最近聊天、关注或粉丝用户。 | 暂未发布                                                                                                                                                                | -                                                                   | `scripts/bilibili-share-to-friends`      |

## 工程化开发

当前仓库使用 pnpm workspace 管理脚本工程：

- `packages/shared`：跨脚本复用的 DOM、样式、路由和缓存工具。
- `scripts/*/src`：各脚本的 Vite 构建入口。
- `scripts/*/CHANGELOG.md`：各脚本的更新日志。
- `scripts/*/README.md`：脚本专属开发、调试或发布说明。
- `scripts/*/archive`、`scripts/*/fixtures`、`scripts/*/assets`、`scripts/*/tests`：仅在脚本确有历史版本、测试资料或素材时保留。

常用命令：

```shell
pnpm install
pnpm build
pnpm lint
pnpm test
```

单脚本开发命令：

| 脚本                     | dev                   | build                   | watch                   | 本地 file:// 壳脚本     |
| ------------------------ | --------------------- | ----------------------- | ----------------------- | ----------------------- |
| 改变代码块字体           | `pnpm dev:beautify`   | `pnpm build:beautify`   | `pnpm watch:beautify`   | `pnpm shell:beautify`   |
| B站视频分享给好友        | `pnpm dev:bilibili`   | `pnpm build:bilibili`   | `pnpm watch:bilibili`   | `pnpm shell:bilibili`   |
| 复制标题和地址           | `pnpm dev:copy-title` | `pnpm build:copy-title` | `pnpm watch:copy-title` | `pnpm shell:copy-title` |
| 掘金 Markdown 格式适配器 | `pnpm dev:juejin`     | `pnpm build:juejin`     | `pnpm watch:juejin`     | `pnpm shell:juejin`     |
| JustJumpAhead            | `pnpm dev:jump-ahead` | `pnpm build:jump-ahead` | `pnpm watch:jump-ahead` | `pnpm shell:jump-ahead` |
| PR三思器                 | `pnpm dev:pr-checker` | `pnpm build:pr-checker` | `pnpm watch:pr-checker` | `pnpm shell:pr-checker` |

日常开发优先用对应的 `pnpm dev:*`。如果目标页面 CSP 或浏览器环境导致 dev server 注入不可用，再用对应的 `pnpm shell:*` 生成 `dist/dev/*.local.user.js` 本地壳脚本，然后开对应的 `pnpm watch:*` 持续更新 `dist/*.user.js`。

prod 构建默认不压缩混淆，生成的 `scripts/<name>/dist/*.user.js` 可读，便于调试、提交到 GitHub 或同步到 Greasy Fork；`dist/dev/*` 仅保留本地开发用 meta 和壳脚本，不提交。

具体脚本的本地开发同步方式、调试步骤或注意事项放在对应子工程 README 中维护。
