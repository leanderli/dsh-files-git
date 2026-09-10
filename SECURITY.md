# 安全策略

## 支持版本

| 版本 | 支持状态 |
| --- | --- |
| master | ✅ |

## 报告漏洞

**请勿通过公开 Issue 报告安全漏洞。**

请通过 [GitHub Security Advisories](https://github.com/leanderli/dsh-files-git/security/advisories/new)
提交，或开启一个仅维护者可见的私有安全公告。我们会在收到后尽快回复。

## 安全模型（本插件的信任边界）

本插件执行 `git` 命令与文件读写的位置是一个**独立服务进程**
（`lib/server/server.js`，由 host 半区按需拉起）；DSH 内的 host 半区只做
生命周期管理与回环代理，不直接执行 git。安全边界如下：

### 1. RPC 通道：仅回环可信

- `/git-api/*` 端点以 `authority: "loopback"` 注册，复用 DSH `/api` 通道的
  浏览器信任围栏；
- 仅回环来源（`127.0.0.1` / `localhost` / `[::1]`）可调用；从局域网 / 公网
  地址访问 WebUI 时，所有 `/git-api` 操作会被拒绝；
- 通道走 HTTP POST + 标准 client-request 信封，不额外向浏览器开放端口；
- **内部 sidecar 通道**：面板可经 `/git-api/service-info`（回环围栏内）取得
  服务端口与 token 后**直连** `127.0.0.1:<随机端口>`，也可走 host 代理；两条
  路径的每个请求都必须携带随机 Bearer token（401 拒绝无 token 请求）。token
  只存在于用户级临时目录的运行时文件 `{tmpdir}/dsh-files-git-service-<指纹>.json`
  （Windows 临时目录按用户隔离；文件名按配置指纹命名，不同配置的 DSH 实例
  各有独立服务）。服务端 CORS 仅对回环来源精确回显——局域网
  来源既拿不到 CORS 许可、也拿不到 token（`/git-api` 回环围栏先行拒绝），
  双重 fail-closed；
- **SSE 推送（/events）**：与 RPC 同一 token 围栏，只读推送 `git status`
  的结构化结果，不执行任何变更类操作；并发流上限 4，流断开即停止对应
  工作区的文件监视。

### 2. 文件访问：工作区包含校验

- `list` / `read` / `search` 与 `write` 的 `path`（相对路径）分支限定在当前
  会话工作区根目录内：`path.resolve` + `fs.realpath` **双重包含校验**，
  拒绝 `..` 穿越、绝对路径与符号链接逃逸；
- **显式信任的例外**：
  - `readPath`：按**绝对路径**只读（512KB 上限），不受工作区根约束；
  - `write` 的 `abs` 分支：按绝对路径写回（512KB 上限）。
  
  这两个端点只为「面板预览 / 编辑过的文件」服务：浏览器端只会传回 host
  刚刚读取过的真实文件路径（面板不会构造任意路径）。它们是「产物链接预览」
  功能（可读取工作区之外的产物文件）的必要妥协，默认能力边界 =
  面板里出现过的路径。

### 3. 命令执行：无 shell 注入面

- 所有 git 命令经 `spawn(gitPath, ["-C", repo, ...args])` 的 **argv 数组**
  执行，永不拼接 shell 字符串；提交信息、路径、分支名无法注入命令语法；
- `gitPath` 默认从 `PATH` 解析（跳过 `.git-ai` shim 目录），可经
  `cordis.patch.yml` 配置为绝对路径；
- 子进程设置 `GIT_TERMINAL_PROMPT=0`（凭据提示快速失败而非挂起）与
  `LC_ALL=C`（输出可解析）；单命令输出上限 512KB、超时
  （状态类 15s / 变更类 180s）后**进程树终止**（taskkill /T /F，防止
  git 辅助进程残留锁文件）；git 进程启动即崩溃（Windows 0xC0000142）时
  自动重试一次。

### 4. 输出与大小限制

- 单条命令捕获输出 ≤ 512KB；文本读取 ≤ 512KB（超出截断并标记）；
- diff 渲染带行数上限与词级高亮配对数上限，超大差异降级为行级着色。

### 5. 前端

- 面板经 `createPortal` 渲染于受控 dialog 层，焦点陷阱 + 滚动锁定，
  弹层不穿透；
- CodeMirror 6 编辑器核心与语言包从公共 CDN（esm.sh / jsdelivr）懒加载，
  仅在用户首次点击「编辑」时请求；若供应链风险不可接受，可在离线环境
  使用（编辑功能自动禁用，保留系统应用打开兜底）。

## 已知考量

- **回环外的 WebUI 暴露**：默认绑定（127.0.0.1）下，`/git-api` 对非回环
  来源 fail-closed。DSH 原生局域网模式（`dsh web --host 0.0.0.0`，控制台
  打印带 token 的 LAN URL，首次访问换发绑定 authority 的会话 Cookie，
  默认 30 天）下，`/git-api` 与 `/api` 共用部署级围栏（Host/Origin 信任
  + 会话鉴权）；本插件不放宽自身围栏，也无需放宽。此时面板在非回环来源
  自动降级为纯代理模式（不尝试直连、无 SSE 推送），sidecar 仍只绑服务器
  本机回环、随机端口不暴露。注意：启动 token 与会话 Cookie 授权的是
  整个 DSH harness（所有会话与插件，不只是 git 面板），LAN URL 应按密钥
  保管，勿入日志与聊天记录；
- **工作区即边界**：插件对工作区内的**任意** git 操作有完整权限（包括
  `reset --hard`、force push 等），危险操作有二次确认，但确认后即真实执行；
- **运行时文件**：`{tmpdir}/dsh-files-git-service-<指纹>.json` 记录服务端口与
  token，供同用户同机器、同配置的 host 半区复用服务（指纹=spawn 配置摘要，
  不同配置的实例各得一个文件与一个服务，互不杀伐）。它受用户临时目录 ACL
  保护（其他用户不可读）；删除它安全——下次请求会重新拉起服务并换发新
  token。服务空闲 30 分钟自退出并清理该文件。
