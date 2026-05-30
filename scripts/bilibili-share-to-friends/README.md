# bilibili-share-to-friends

在 Bilibili 视频播放页分享面板中新增“分享给 B站好友”入口，将当前视频以文本链接私信发送给最近聊天、关注或粉丝用户。

## 功能

- 在原生分享面板中追加“B站好友”分享方式。
- 默认展示最近聊天联系人，也可以切换到“全部好友”。
- “全部好友”支持选择“我的关注”或“我的粉丝”，并支持昵称搜索。
- 关注搜索优先使用 B 站关注搜索接口；粉丝搜索仅筛选当前已加载用户，继续滚动可扩大筛选范围。
- 用户列表支持滚动分页加载，加载失败时可重试。

## 目录

- `src/main.js`：脚本入口和页面注入逻辑。
- `src/api.js`：Bilibili 接口、WBI 签名、缓存和发送私信逻辑。
- `src/ui.js`：分享弹窗组装层和状态流转。
- `src/components/*`：分享弹窗组件，每个组件维护自己的 UI 和样式。
- `src/styles.css`：脚本全局样式。
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
2. 如果目标页面 CSP 或浏览器环境导致 dev server 注入不可用，运行 `pnpm shell:bilibili` 生成 `scripts/bilibili-share-to-friends/dist/*.local.user.js`。在 Tampermonkey 安装这个壳脚本，并在 Chrome/Edge 扩展详情中打开 Tampermonkey 的 “Allow access to file URLs”。之后配合 `pnpm watch:bilibili`，刷新目标页面即可加载本地 `dist/bilibili-share-to-friends.user.js`。
