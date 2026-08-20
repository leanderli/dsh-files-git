# dsh-files-git

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![dsh plugin](https://img.shields.io/badge/dsh-plugin-web%20profile-6c5ce7.svg)](#安装)
[![i18n](https://img.shields.io/badge/i18n-%E4%B8%AD%E6%96%87-English-2ea44f.svg)](#国际化i18n)

**[English](README.en.md) | 简体中文**

DSH Web UI 的**文件与变更**面板插件：为当前会话的工作区目录提供一体化的
**文件浏览 / 搜索 / 预览 / 编辑**与 **Git 操作**（状态、暂存、提交、拉取、推送、
分支、历史、diff 等），在浏览器里以居中模态面板呈现，无需离开 WebUI 即可完成
日常文件与版本控制操作。

- 零运行时依赖（host 半区仅 Node 内置模块），离线可装；
- 界面文案跟随 DSH 语言设置，内置**中文 / English** 双语；
- 安全面收敛：RPC 仅回环可信，文件浏览限定工作区根目录。

---

## 目录

- [功能特性](#功能特性)
- [环境要求](#环境要求)
- [安装（标准接入流程）](#安装标准接入流程)
- [快速上手](#快速上手)
- [配置](#配置)
- [国际化（i18n）](#国际化i18n)
- [安全模型](#安全模型)
- [开发指南](#开发指南)
- [卸载](#卸载)
- [常见问题](#常见问题)
- [贡献](#贡献)
- [许可证](#许可证)

## 功能特性

### 文件浏览与预览

- **懒加载文件树**：目录展开 / 收起，显示文件大小与 Git 状态角标
  （已暂存 / 已修改 / 未跟踪 / 冲突）；
- **全工作区搜索**：git 仓库经 `git ls-files --cached --others --exclude-standard`
  索引整个工作区（自动排除 `.gitignore` 忽略项），非 git 目录退化为当前目录过滤；
  搜索结果扁平列表、双击直接预览（深层子目录文件同样可预览）；
- **搜索历史**：输入关键词停顿 1 秒（或 Enter / 失焦）自动记录，下拉一键回溯、可清空；
- **内容预览**：文本文件纯文本全量显示（512KB 内不截断）；「预览 / 源码」切换：
  预览视图对 Markdown 直接渲染、对代码做语法高亮（30KB 分块异步渐进渲染，
  大文件不阻塞主线程）；默认打开为源码视图；
- **面板内编辑**：CodeMirror 6 编辑器，按文件类型自动匹配 16 种语言包
  （js/ts/jsx/tsx/vue/json/md/py/java/go/rs/c/cpp/php/sql/yaml/scss 等），
  主题跟随 DSH 亮 / 暗色；保存写回磁盘后自动刷新 Git 状态；核心与语言包
  从 CDN 懒加载（esm.sh 优先、jsdelivr 兜底、失败重试），零 bundle 体积增量；
- **快捷操作**：悬停任意条目可**打开目录**（系统文件资源管理器）、**复制路径**、
  **复制名称**；面包屑导航各段可点击跳转，最右侧「打开目录」按钮直达当前目录。

### Git 操作

- **信息栏**：当前分支、领先 / 落后（待推送 ⬆ / 待拉取 ⬇ 高对比胶囊）；
- **操作栏**：拉取（可选 `--rebase` 变基）、推送、获取（fetch）、强推
  （`--force-with-lease`，二次确认）；每次操作显示命令输出模块——执行中进度条、
  成功绿色、失败红色，保留至手动关闭；
- **分支选择器**：按当前 → 本地 → 远程分组列出全部分支（可搜索），支持
  检出 / 合并 / 从所选分支新建 / 更新 / 重命名；
- **变更列表**：冲突 / 已暂存 / 未暂存 / 未跟踪分组，目录树展示（聚合数、整目录
  暂存 / 取消暂存 / 取消跟踪 / 跟踪 / 忽略）；未跟踪目录自动展开为真实文件列表；
  单文件暂存 / 取消暂存 / 一键加入 `.gitignore`；状态徽章按变更类型着色；
  **查看全部差异**支持未暂存 / 已暂存切换；
- **差异预览**：点击变更行右侧展开 diff（左 3 : 右 7 分栏、分隔条可拖动、
  双击恢复默认），词级高亮（LCS）+ 行级着色，超大差异自动降级；未跟踪文件按
  新增文件 diff 展示；
- **提交**：提交选中 / 提交全部、可选 `--amend`，`Ctrl+Enter` 快捷提交；
- **提交历史**：默认折叠为横向条（IDEA 风格），展开内部滚动；点击进入
  **提交详情视图**（变更文件列表 + 单文件 diff，左 3 : 右 7）；行菜单支持
  **查看变更** / **回滚此提交**（revert）/ **重置到此提交**（soft / hard，危险操作二次确认）；
- **自动刷新**：Git 状态每 5 秒静默轮询（页面可见且无操作进行时），快照去重，
  外部改动不打断当前操作。

### 面板体验

- **模态面板**：与设置弹窗同款交互；标题栏支持一键全屏（默认全屏，可在设置页
  改为非全屏并持久化）；
- **挂起（暂存退出）**：「挂起」按钮或鼠标移出面板自动滑出视口，仅留顶部磨砂
  把手，滑过即恢复全部状态（标签页、预览、滚动位置、搜索词）；关闭（× / Esc）
  才真正卸载；面板同时只属于一个工作区，切换工作区自动关闭；
- **产物链接 → 面板预览**（设置页可开，默认关）：开启后点击对话中的产物文件 /
  文件提及不再调用本地应用，而是打开本面板预览——工作区内文件导航到所在目录；
  工作区外文件按绝对路径只读内联预览（512KB 上限）；
- **磨砂玻璃视觉**：面板 86% 底色 + `blur(30px)`，弹层（搜索历史、分支列表、
  右键菜单）同样磨砂；主题自适应文字颜色，亮 / 暗皮肤下均清晰可读；
- **焦点陷阱与滚动锁定**：面板打开时 Tab 循环锁定在面板内、滚轮不穿透；
  弹层打开期间仅弹层内可滚动；
- **双入口智能切换**：已进入会话时按钮位于标题栏右侧（Session log 左侧）；
  新建工作区尚无对话（blank 会话）时自动切换到输入框上方工作区行最右侧的
  幽灵按钮，与顶栏显示 / 隐藏严格同步，不会同时出现。

### 性能

- 输入隔离：提交信息打字只重渲染提交卡，不重建列表 / 历史 / diff；
- 引用稳定 + `React.memo`：`useGit` 返回值、变更行 / 文件行 / 历史块 / diff 卡 /
  面板外壳均按内容比较，勾选单文件或 5 秒轮询刷新只重建受影响行；
- 懒加载：CodeMirror 编辑器核心 + 语言包首点「编辑」才从 CDN 拉取；
- 语法高亮 / markdown 渲染结果按预览内容 `useMemo` 缓存，拖拽分隔条不重算；
- 滚动隔离：列表 / 预览 / diff 容器 `contain: content`，滚动不牵连整页；
- host 端目录枚举并行化 + 前端 RPC 网络失败自动重试（2 次、20s 超时）。

## 环境要求

| 依赖 | 说明 |
| --- | --- |
| [DSH](https://www.npmjs.com/package/@deepseek-ai/dsh) | `dsh web`（Web UI 模式，`--profile web`） |
| Git | 系统 `PATH` 中可用的 `git`（或经 [配置](#配置) 指定绝对路径），版本建议 2.30+（`--force-with-lease` / `restore --staged`） |
| 浏览器 | Chromium 系 / Firefox / Safari 现代版本（面板使用 `backdrop-filter`、`color-mix`） |
| 网络（可选） | 仅「面板内编辑」首次使用时需访问 esm.sh / jsdelivr 加载 CodeMirror；离线时保留「在编辑器中打开」兜底 |

## 安装（标准接入流程）

### 1. 获取插件

```sh
# 方式一：克隆本仓库
git clone https://github.com/leanderli/dsh-files-git.git
# 放到 dsh 插件目录（示例，任意固定路径均可）
mkdir -p ~/.dsh/plugins
mv dsh-files-git ~/.dsh/plugins/
```

> Windows 下 `~` 即 `%USERPROFILE%`（如 `C:\Users\you\.dsh\plugins\dsh-files-git`）。
> 路径仅作示例，可放在任意**不会被删除 / 移动**的目录（见下方注意事项）。

### 2. 注册到 web profile

```sh
dsh plugin --profile web add ~/.dsh/plugins/dsh-files-git
```

安装后 `dsh.profile.bundles` 会追加 `dsh-files-git`，其 `cordis.patch.yml`
（bundle patch）在下次启动时自动挂载插件行 `files-git`。

### 3. 重启 dsh web

```sh
dsh web
```

### 4. 验证

1. 打开 WebUI，进入（或新建）任意工作区会话；
2. 已进入会话 → 标题栏右侧 **Session log** 左侧出现 **文件与变更** 按钮；
3. 新建工作区尚无对话 → 输入框上方工作区 / 模式标签行最右侧出现幽灵按钮；
4. 点击打开面板，「文件」标签应列出当前工作区目录；git 仓库内「Git」标签可用。

> ⚠️ **安装后不要删除或移动插件源目录**：profile 里是符号链接
> （`link:绝对路径`），源目录丢失会让 `dsh web` 启动失败。需要卸载时用
> `dsh plugin --profile web remove dsh-files-git`，不要直接删目录。

## 快速上手

1. **打开面板**：点击 **文件与变更** 按钮（入口见上）；面板自动指向当前会话的
   工作区目录（无需手动填写路径），切换会话 / 工作区后自动跟随。
2. **文件标签**：点击目录展开；点击文件预览内容；预览区可切换「预览 / 源码」、
   「编辑」（CodeMirror）、「在编辑器中打开」（系统默认应用）；`.git` 目录默认隐藏。
3. **Git 标签**：
   - 暂存：勾选变更文件（或目录行 / 全选）→ 提交全部 / 提交选中；
   - 拉取 / 推送 / 获取 / 变基：操作栏一键执行，输出实时展示；
   - 查看差异：点击变更行右侧展开 diff，分隔条可拖动；
   - 历史：点击底部折叠条展开 → 点击提交进入详情 → 行菜单 revert / reset。
4. **挂起**：点头部「↑」或把鼠标移出面板即滑出，滑过顶部把手立即恢复。

> 没有可用工作区时面板提示「暂无当前工作区」；非 Git 目录自动隐藏 Git 标签。

## 配置

默认开箱即用。如需覆盖，在 profile 的 `cordis.patch.yml` 中覆盖 `files-git` 行：

```yaml
- id: files-git
  config:
    gitPath: /usr/bin/git        # git 可执行文件绝对路径（默认自动从 PATH 解析，跳过 .git-ai 目录）
    defaultRoot: /path/to/repo   # 客户端未传仓库时的兜底（一般用不到，面板总是发送会话工作区）
```

面板内设置（⚙ 设置标签页，持久化于浏览器 localStorage）：

| 设置项 | 默认 | 说明 |
| --- | --- | --- |
| 打开时默认全屏 | 全屏 | 面板打开时的默认尺寸 |
| 点击产物文件 / 文件链接时 | 关闭 | 开启后对话中的产物文件在面板内预览，而非调用系统应用 |

## 国际化（i18n）

- 界面文案**跟随 DSH 语言设置**（设置 → 常规 → Language），当前支持
  **中文 / English** 双语，切换语言即时生效（无需刷新或重开面板）；
- 已知边界：host 端 RPC 错误消息保持中文原文（host 无法感知浏览器语言）；
  git 命令输出本身为英文 / 本地区域化混合。

## 安全模型

- **回环围栏**：`/git-api` 通道以 `authority: "loopback"` 注册，走与 `/api`
  相同的浏览器信任围栏，仅回环来源（127.0.0.1 / localhost）可调用；从局域网
  地址访问时操作会被拒绝；
- **工作区约束**：文件浏览（`list` / `read` / `write` 相对路径分支）限定在
  工作区根目录内——`resolve` + `realpath` 双重包含校验，`..`、绝对路径、
  符号链接逃逸一律拒绝；
- **无 shell 注入**：所有 git 命令通过 argv 数组执行（无 shell 拼接），提交
  信息 / 路径无法注入命令语法；
- **快速失败**：`GIT_TERMINAL_PROMPT=0`，需要凭据时快速失败而不是挂起；
  Windows 凭据管理器（GCM）仍可正常弹窗；
- **显式信任的例外端点**：`readPath`（按绝对路径只读，512KB 上限）与 `write`
  的 `abs` 分支不受工作区根约束——它们只为面板预览 / 编辑过的文件服务，
  浏览器端只会传回它刚读过的真实文件路径；详见 [SECURITY.md](SECURITY.md)。

## 开发指南

### 架构

- **Host 半区**（`lib/index.js`）：经共享 `connection` 通道注册 `POST /git-api/*`
  RPC 端点，执行 git 命令与文件浏览，零运行时依赖；
- **Browser 半区**（`lib/client.js`）：自包含 React 面板，注册进
  `conversation.session.header.utilities`（顶栏按钮）、
  `conversation.input.dock`（blank 会话按钮）、`shell.overlay`（模态层）。

### 源码结构

dsh 的客户端模块加载器每个插件只接受**一个** bundle，且 `require` 不支持相对
路径——源码以可读片段维护在 `lib/src/`（共享同一工厂作用域），由构建脚本拼装：

```text
lib/
  client.js       ← 交付产物（勿手改，由 build.cjs 生成）
  build.cjs       ← 拼接脚本：node build.cjs（按当前 bundle 重切分 + 拼装）
                    node build.cjs --rebuild（仅从 src/ 重拼装）
  src/            ← 源码片段（共享同一工厂作用域，按依赖顺序拼装）
    styles.js     CSS（DSH token 驱动）
    icons.js      SVG 图标
    store.js      overlay/hidden 全局状态
    i18n.js       zh/en 双语字典（跟随 DSH locale）
    utils.js      RPC + 通用 UI 原子（btn/chip/lbtn/link/fmtSize）
    triggers.js   顶栏按钮 + blank 会话触发胶囊
    hooks.js      useGit（状态/操作/轮询）
    diffutil.js   diff 解析 + LCS 词级高亮
    editor.js     CodeMirror 6 编辑器（CDN 懒加载：核心 + 16 语言包 + one-dark）
    ui.js         memoized 子视图（变更行/历史/差异面板等）
    gitview.js    分支选择器/确认对话框/Git 标签
    filebrowser.js 文件浏览/搜索/预览/设置页
    overlay.js    FilePanelBody + FilePanelOverlay（挂起/自动挂起）
    index.js      apply()/inject 入口
```

### 本地开发流程

```sh
git clone https://github.com/leanderli/dsh-files-git.git
cd dsh-files-git

# 1. 以 link 方式注册到本地 web profile（只需一次）
dsh plugin --profile web add "$PWD/dsh-files-git"   # 或指向已克隆目录

# 2. 改代码：编辑 lib/src/ 下的片段
# 3. 重新拼装产物 bundle
node lib/build.cjs --rebuild

# 4. 重启 dsh web（客户端 bundle 在启动时加载）
dsh web
```

`lib/client.js` 产物已含 `#region` 分区注释，可直接阅读。

> ⚠️ 插槽选型：面板**不能**注册进 `details` 插槽——那是单例插槽，已被内置
> `dsh-client-ui-conversation` 工具详情面板占用；第二个条目会抛异常并导致整个
> Web 客户端启动失败。面板使用 `shell.overlay`（列表插槽，允许多条目）。

## 卸载

```sh
dsh plugin --profile web remove dsh-files-git   # 官方方式；不要直接删源目录
```

## 常见问题

**Q：点击按钮面板没反应 / Web UI 启动失败？**
检查插件源目录是否被移动或删除（profile 里是符号链接），以及是否误用了
`details` 等单例插槽；用 `dsh plugin --profile web remove dsh-files-git`
回滚后再排查。

**Q：Windows 下 git 操作偶发报错（退出码 0xC0000142）？**
已知 Windows 大量 git 进程并发时的 DLL 初始化偶发失败，host 端已内置自动重试
一次；若仍频繁出现，可经 [配置](#配置) 显式指定 `gitPath`。

**Q：局域网其他设备访问 WebUI 时 Git 操作被拒绝？**
预期行为——`/git-api` 仅信任回环来源。请在本机浏览器访问，或为远端访问配置
SSH 隧道等回环转发。

**Q：编辑按钮点不动 / 加载失败？**
「面板内编辑」依赖 CDN（esm.sh / jsdelivr）懒加载 CodeMirror，离线时不可用；
保留「在编辑器中打开」兜底。二进制与超 512KB 只读截断的文件不提供编辑。

## 贡献

欢迎 Issue 与 PR！参与方式见 [CONTRIBUTING.md](CONTRIBUTING.md)；
安全漏洞请勿公开 Issue，按 [SECURITY.md](SECURITY.md) 披露。

## 许可证

[MIT](LICENSE) © leanderli
