# bilibili-share-to-friends

在 Bilibili 视频播放页分享面板中新增“分享给 B站好友”入口。

## 目录

- `src/main.js`：脚本入口和页面注入逻辑。
- `src/api.js`：Bilibili 接口、WBI 签名、缓存和发送私信逻辑。
- `src/ui.js`：分享入口和弹窗 UI。
- `src/styles.css`：脚本样式。
- `src/meta.js`：Tampermonkey 元信息。
- `CHANGELOG.md`：更新日志。

## 开发

```shell
pnpm dev:bilibili
pnpm build:bilibili
pnpm shell:bilibili
```

开发同步有两种方式：

1. 推荐先运行 `pnpm dev:bilibili`，按 `vite-plugin-monkey` 打开的安装页安装开发版脚本。之后本地代码变更会通过 Vite dev server 加载，通常不需要再复制粘贴到 Tampermonkey 编辑器。
2. 如果目标页面 CSP 或浏览器环境导致 dev server 注入不可用，运行 `pnpm shell:bilibili` 生成 `scripts/bilibili-share-to-friends/dev/*.local.user.js`。在 Tampermonkey 安装这个壳脚本，并在 Chrome/Edge 扩展详情中打开 Tampermonkey 的 “Allow access to file URLs”。之后配合 `pnpm watch:bilibili`，刷新目标页面即可加载本地 `dist/bilibili-share-to-friends.user.js`。
