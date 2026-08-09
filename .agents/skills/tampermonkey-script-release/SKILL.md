---
name: tampermonkey-script-release
description: Standardize version upgrades and releases for completed Tampermonkey userscripts in this pnpm workspace, including SemVer recommendation, package and changelog edits, build artifact regeneration, validation, release commits, Chinese PRs, and auto-merge eligibility for release-only PRs. Use when a user asks to bump, package, release, publish, or prepare a completed script version.
---

# Tampermonkey 脚本版本发布

把已经完成开发的 Tampermonkey 脚本变更，安全地升级版本、生成发布产物、提交发布 PR，并在满足条件时自动合并。只处理发布阶段，不代替功能实现或产品验收。

## 硬性规则

1. 明确的目标版本是修改文件的前置条件
   - 用户给出完整目标版本（例如 `0.4.9`）时，校验它是合法 SemVer 且高于当前版本，然后继续
   - 用户没有给出完整目标版本时，只读取仓库并推荐一个版本号及理由，禁止修改 `package.json`、`CHANGELOG.md`、`dist`，禁止提交、推送、创建或合并 PR
   - “升一个 patch/minor”不算完整目标版本；先换算并推荐具体版本，等待确认
   - 目标版本等于或低于当前版本、格式非法或无法判断升级级别时，停止并说明原因
2. 不覆盖用户已有改动
   - 发布前检查 `git status --short` 和相对 base branch 的 diff
   - 发现无关改动、未完成的源代码改动或文件归属不清时，先停下并报告，不要清理、重置或覆盖
3. 纯版本升级 PR 默认可以自动合并
   - 只有 PR 相对 base branch 的完整 diff 仅包含目标脚本的 `package.json`、`CHANGELOG.md` 和生成的 `dist/<script>.user.js` 时，才标记为 release-only
   - release-only PR 在构建、lint、test 通过且无冲突、无未解决 review 后，默认开启 auto-merge
   - 只要包含 `src`、shared 工具、构建配置、依赖或其他脚本改动，就不按纯版本升级处理，不自动合并
   - 托管平台或权限不支持自动合并时，报告阻塞原因，不伪造已合并状态

## 发布流程

### 1. 定位脚本并做只读预检

从用户输入、根目录 `README.md`、`pnpm-workspace.yaml` 和 `scripts/*/package.json` 定位目标脚本及命令别名。读取目标脚本的：

- `package.json`
- `src/meta.js`
- `CHANGELOG.md`
- `README.md`
- 最近相关提交和当前生成产物

确认根目录使用 pnpm workspace，版本来源是目标脚本 `package.json`。`src/meta.js` 通常从该文件读取 `version`，不单独改元信息版本。根目录私有包版本保持不变。

### 2. 处理版本号闸门

读取当前版本后按变更性质推荐版本：

- 修复、文案调整或兼容性小改动：patch
- 向后兼容的新功能：minor
- 破坏兼容性的行为或接口变化：major

没有完整目标版本时，输出“当前版本、推荐版本、判断理由、将要修改的文件”，然后结束本次执行。目标版本明确后再继续。

### 3. 更新发布文件

只更新目标脚本的：

```text
scripts/<script>/package.json
scripts/<script>/CHANGELOG.md
```

在 `CHANGELOG.md` 顶部添加 `Vx.y.z`、发布日期和用户可见变更。单纯版本号变化不修改 `pnpm-lock.yaml`。只有实际依赖变化时才更新 lockfile。

### 4. 构建并验证产物

使用根目录对应命令，例如：

```powershell
pnpm build:bilibili
```

构建完成后检查：

- `scripts/<script>/dist/<script>.user.js` 已更新
- 产物 `@version` 与目标版本一致
- 产物包含当前源代码和正确的 userscript 元信息
- 没有把 `dist/dev` 或临时文件加入提交

然后运行：

```powershell
pnpm lint
pnpm test
pnpm build:<alias>
git diff --check
```

如果变更涉及 shared、构建配置或多个脚本，再运行 `pnpm build`。

### 5. 审查发布 diff

检查 `git diff --stat`、`git diff` 和 `git status --short`。发布提交通常只包含：

```text
scripts/<script>/package.json
scripts/<script>/CHANGELOG.md
scripts/<script>/dist/<script>.user.js
```

README 只有在安装地址、使用方式或发布说明变化时才加入。发现源码、依赖或其他脚本变更时，重新分类，不要继续走 release-only 自动合并路径。

### 6. 提交、PR 和合并

使用符合 Conventional Commits 的中文提交信息，例如：

```text
chore: bilibili-share-to-friends 发布 v0.4.9
```

推送分支并创建中文 PR，描述完整列出版本变更和验证结果。若完整 PR diff 满足 release-only 条件，检查通过后开启 auto-merge；否则保留人工 review 流程。

使用当前仓库已配置的托管平台连接器或 CLI 完成 PR 操作。不要声称没有实际执行的推送、PR 或合并已经完成。

### 7. 发布后冒烟验证

合并后从实际安装地址重新安装或触发 Tampermonkey 更新，确认：

- Tampermonkey 显示目标版本
- GitHub raw 产物可访问
- 核心功能仍然可用
- 若同步 Greasy Fork，则 Greasy Fork 版本和产物也一致

当前仓库没有看到自动同步 Greasy Fork 的发布配置；需要时明确说明并手动同步。
