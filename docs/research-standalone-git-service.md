# 调研：独立 Git 通信服务方案

> 状态：已定案并全部实施——Phase 1（A1 代理 + B1 自动拉起 + C1）与 Phase 2（A2 直连 + SSE 推送）均已落地 · 2026-09
> 范围：为 dsh-files-git 面板的「浏览器 ↔ Git」通信引入一个独立运行的本地服务，替代"插件跑在 DSH 主进程里直接 spawn git"的形态。

## 0. 实现偏差勘误（2026-09 v0.6.x 复核）

本文是设计期调研记录，下述细节与最终实现不一致，以代码为准：

- **运行时文件位置**：设计为 `os.tmpdir()/dsh-files-git/service.json`（单文件、
  单实例）。实现为用户主目录 `~/.dsh-files-git/dsh-files-git-service-<指纹>.json`
  （0700 目录 / 0600 文件），**按配置指纹多实例**——不同配置的 DSH 实例各得
  一个服务，互不干扰（见 §3 风险表「多 DSH 实例并存」的落地面）；
- **陈旧文件双因子**：设计为「token 与 pid 双因子」（L178）。实现为
  **token + 版本**双因子——pid 只在日志中记录，不参与探活判定（pid 复用
  会让「pid 在但早已不是我们的服务」误判为活着；token 是随机会话密钥、
  version 决定轮换，二者组合即可判定「是我拉起的、且协议还兼容」）；
- **并发拉起竞态**：设计的「锁文件（wx 独占创建）+ 原子改名」（L93/L179）
  **未实现**。实际机制：并发拉起方各自探测 `/health`，确认已有健康同指纹
  服务后**输家进程自行 shutdown 退出**（每个服务 30 分钟空闲自退出兜底，
  竞态窗口内多活一个进程无害）；锁文件在跨机器 NFS 等场景才有必要性，
  本地单用户场景收益不成比例，故弃用；
- **B2 外接模式（`serviceUrl`）未实现**：推荐段落（L101）的「B1 默认 +
  B2 可选」只落地了 B1；`serviceUrl` 配置项不存在。待有真实多客户端需求
  再议（开放问题 2 维持开放）。

---

## 1. 背景与动机

### 1.1 现状链路

```text
浏览器面板 (lib/client.js)
   │  fetch("/git-api/<method>", POST, 同源相对路径)
   ▼
DSH Web 服务器（DSH 主进程）
   │  connection.register("git-api/*", { authority: "loopback" })   lib/index.js L828/L852
   ▼
插件 Host 半区（lib/index.js，运行在 DSH 主进程内）
   │  spawn(gitPath, ["-C", repo, ...args])                        lib/index.js L117
   ▼
git CLI（argv 数组，无 shell）
```

浏览器侧信封：`{ type: "client-request", rpcId, method, payload }` →
`{ type: "server-response", result: { ok, value | error } }`（lib/src/utils.js L20-62）。

### 1.2 已知的三个痛点（代码注释为证）

| # | 痛点 | 证据 |
|---|------|------|
| 1 | **DSH 主进程 event loop 饱和时，所有响应被卡住数秒**（连静态 404 都会被 park），读超时已被迫放宽到 20s | lib/src/utils.js L9-12 注释；`RPC_READ_TIMEOUT_MS = 20000` |
| 2 | Windows 下大量 git 进程并发 spawn 偶发 DLL 初始化失败（0xC0000142），host 端只能重试一次 | lib/index.js L62-75（taskkill 进程树）、README FAQ |
| 3 | Git 执行、文件 IO 全部寄生在 DSH 生命周期内：DSH 忙 = 面板卡；无法独立演进（watch、流式、大仓库索引等） | 架构节（README「开发指南」） |

### 1.3 独立服务能带来什么

- **延迟隔离**：git 执行与响应交付彻底脱离 DSH 主进程，痛点 1/2 从根上消失；
- **进程环境干净**：服务自己管理 git 子进程组、超时、并发上限，不再受 DSH 约束；
- **生命周期解耦**：DSH 重启面板状态可连续（轮询秒恢复），也可被其他客户端复用；
- **演进空间**：SSE 推送替代前端轮询、fs.watch 联动、长任务流式日志，都不再受 DSH 插件宿主限制。

---

## 2. 方案空间（三个正交维度 + 协议）

三个维度互相独立，可组合；先列全选项再给推荐组合。

### 2.1 维度 A：通信拓扑（浏览器如何到达服务）

#### A1 · DSH 代理模式（浏览器零改动）

```text
浏览器 → /git-api（DSH 同源） → host 半区 → http://127.0.0.1:<port> → 独立服务 → git
```

- 优点：面板零改动（信封原样转发即可）；保留 DSH 的 loopback authority 围栏；无 CORS、无 token 分发问题。
- 缺点：**仍穿过 DSH 主进程**——痛点 1 只解决一半（git 执行不再占 DSH，但响应交付仍受主循环 park 影响）；两跳。
- 定位：**迁移期的第一步**，也是直连模式的引导与回退通道。

#### A2 · 浏览器直连（彻底方案）

```text
浏览器 → http://127.0.0.1:<port>/<method> → 独立服务 → git
```

- 优点：彻底绕开 DSH 主进程，痛点 1 完全解决；服务独立演进；可支撑 SSE 流式。
- 缺点与对策：
  - **跨域**：服务需返回 CORS 头（精确回显回环 Origin，预检 OPTIONS 应答）；DSH GUI 是 `http://127.0.0.1:3080` 非 HTTPS，直连 HTTP 回环**无 mixed content 问题**；
  - **token 分发**：host 半区保留一个引导端点 `/git-api/service-info`（仍走 loopback 围栏）返回 `{ port, token, version }`，面板启动时取一次再直连；
  - **可用性回退**：直连失败自动降级走 A1 代理。
- 定位：**目标形态**。

#### A3 · Named pipe / UDS

最安全（不暴露 TCP 端口），但浏览器无法直达，必然退化为 A1 代理形态；Windows 上 Node 可 `server.listen('\\\\.\\pipe\\...')`。只有当服务只被 host 半区消费时才值得，与 A2 冲突。**不推荐作为主通道**。

#### 2.1.x 为什么进程内优化（worker_threads 等）不行

worker_threads 有独立事件循环，能隔离 git spawn，但 **HTTP socket 属于 DSH 主进程**——响应仍由主线程写出，主循环 park 时照样卡交付。凡不把服务移出 DSH 进程的变体，痛点 1 都无解。这是"必须独立进程"的核心理由。

### 2.2 维度 B：服务生命周期（谁来启动/守护）

#### B1 · 插件拉起 sidecar（推荐默认）

host 半区首次需要时 spawn `process.execPath server/server.js`（复用 DSH 同一个 Node，无 PATH 依赖）：

- 单例协议：`os.tmpdir()/dsh-files-git/service.json` 记录 `{ pid, port, token, version, startedAt }`；启动前读文件 + `/health` 探活，活着就复用，僵死（pid 不在/token 不符/版本不匹配）就杀掉重启；
- 空闲自杀：服务 30 分钟无请求自行退出，避免常驻孤儿；
- 版本协商：握手版本不匹配 → 服务自杀，由新 host 重新拉起（插件升级后自然换代）。

优点：用户零操作；离线可装（服务同样只用 Node 内置模块，满足零依赖承诺）。
缺点：进程管理复杂度（孤儿、端口冲突、并发拉起竞态——用「锁文件 + 原子改名」解决）。

#### B2 · 用户手动独立启动（外接模式）

`node server/server.js` 或全局命令启动；服务写端口文件，插件发现即连，不在线则面板提示「服务未启动」。
优点：生命周期最干净、与 DSH 重启完全无关、可多客户端复用。
缺点：多一个手动步骤。

**推荐：B1 默认 + B2 可选**——在 cordis.patch.yml 现有配置（`gitPath`/`defaultRoot`）旁增加 `serviceUrl`：配置了就直连外部服务（B2），否则自动拉起（B1）。两种模式共用同一套协议。

#### B3 · OS 级常驻（NSSM / 计划任务 / systemd）

本地单用户开发面板，无常驻必要。**不推荐**。

### 2.3 维度 C：Git 引擎（服务内部怎么操作 git）

| 选项 | 结论 | 理由 |
|------|------|------|
| **C1 · spawn git CLI（现状平移）** | ✅ 推荐 | argv 数组无注入、`GIT_TERMINAL_PROMPT=0` 快速失败、**Windows GCM 凭据弹窗 / SSH agent / 用户全局 config 全保留**；现有 dispatch 的 20+ 命令直接搬运，零依赖承诺不破 |
| C2 · isomorphic-git（纯 JS） | ❌ | 免装 git 但代价大：GCM 交互弹窗无法天然保留（`onAuth` 编程式给凭据，理论可用 `git credential fill` 曲线救国但复杂化）；大仓库性能与完整度弱（见参考链接 PkgPulse 2026 对比） |
| C3 · nodegit（libgit2 绑定） | ❌ | 原生模块预编译追 Node 版本、Windows 安装坑、维护活跃度低 |
| C4 · dugite（打包便携 git） | ❌ | 只解决"机器没装 git"，而本插件的用户必然装了 git；白背一个 git 发行版体积 |
| C5 · 现成 Git 服务器（Gitea / Forgejo / soft-serve / git-http-backend） | ❌ 层次不对 | 这些是**仓库传输协议**服务（对 bare repo 做 clone/fetch/push），不提供工作树操作（status/暂存/本地 diff/commit）；面板操作的是本地工作副本。未来若做"浏览任意远端仓库"才是它们的地盘 |

注：simple-git（~10.8M/周）本质也是 shell out 到系统 git，但引入运行时依赖违背零依赖；自己维护约 150 行 spawn 封装（`runGit` 已有雏形）即可。

### 2.4 协议选择

| 通道 | 结论 |
|------|------|
| **HTTP POST（沿用现有信封）** | ✅ 最小迁移面；服务按 `{type:"client-request"}` 信封应答，浏览器半区 Phase 1 零改动 |
| **SSE（Server-Sent Events）** | ✅ 后续演进：`node:http` 原生可写、零依赖；做 status 自动推送（fs.watch + 防抖）替代前端轮询 |
| WebSocket | ❌ Node 没有内置 WS 服务端，引依赖破坏零承诺；SSE 已覆盖推送需求 |
| 超时语义 | 沿用：读 20s / 变更 300s、**mutation 永不盲重试**（lib/src/utils.js L5-14 的规则原样保留） |

---

## 3. 对比矩阵

| 组合 | 痛点1(DSH卡顿) | 痛点2(DLL失败) | 面板改动 | 安全围栏 | 复杂度 | 结论 |
|------|:---:|:---:|:---:|------|:---:|------|
| 不动（进程内优化） | ✗ | △ 重试缓解 | 无 | loopback（现状） | 低 | 不解决根因 |
| A1+B1+C1 | △ 缓解 | ✓ | **零** | loopback + DSH 围栏 | 中 | **Phase 1** |
| A2+B1+C1 | ✓ | ✓ | 中（fetch 层+引导） | token + CORS + 回环绑定 | 中高 | **Phase 2（目标）** |
| A2+B2+C1 | ✓ | ✓ | 中 | 同上 | 中 | 可选外接模式 |
| A3 pipe | ✗ | ✓ | 零 | 最强 | 中 | 不取 |
| C2/C3/C4 任一引擎 | — | — | — | — | — | 均劣于 C1 |
| Gitea 类现成服务 | — | — | — | — | — | 层次不符 |

---

## 4. 推荐路线（两阶段）

### Phase 1：抽服务 + 插件拉起（A1 + B1 + C1）

1. 把 `lib/index.js` 的 `dispatch`/`runGit`/进程树管理等平移为 `server/server.js`：零依赖 `node:http`，绑 `127.0.0.1`，端口 0（系统分配）+ 随机 token，写端口文件，`/health` + 空闲自杀 + 版本协商；
2. host 半区瘦身为「生命周期管理器 + HTTP 转发代理」：探活复用 → spawn → 转发 `/git-api/*` 请求体到 `http://127.0.0.1:<port>`；
3. 浏览器半区**零改动**。

收益：痛点 2 根治（独立进程组、独立并发上限）；痛点 1 缓解（git 执行不再占 DSH，仅剩轻量转发）；安全模型（工作区约束、argv 无 shell、512KB 读限、loopback 围栏）原样平移。

### Phase 2：浏览器直连 + SSE（A2）

1. host 半区新增 `/git-api/service-info` 引导端点，返回 `{ port, token, version }`；
2. 面板 fetch 层改造：先取 service-info → 直连服务（带 `Authorization: Bearer`），失败降级走 Phase 1 代理；
3. 服务加 SSE `/events`：fs.watch 工作区 + git status 防抖推送，前端轮询逐步替换为推送。

收益：痛点 1 根治；面板状态实时化。

---

## 5. 关键设计细节与风险

### 安全

- 服务只绑 `127.0.0.1`；**token 是主围栏**（crypto 随机 32B，每实例轮换），CORS 仅精确回显回环 Origin（浏览器侧辅助防线，不是安全边界）；
- token 经 DSH loopback 围栏的引导端点下发，端口文件放 `os.tmpdir()` 用户目录（Windows 下天然按用户隔离）；
- 局域网访问被拒的现状不变：DSH loopback 围栏 + 服务回环绑定双重拦截。

### 生命周期边界情况

| 场景 | 处理 |
|------|------|
| DSH 崩溃 | sidecar 成为孤儿 → 30 分钟空闲自杀；期间若新 DSH 起来则版本/健康检查通过直接复用 |
| 插件升级（版本变化） | 握手协商失败 → 服务自杀重启换代 |
| 端口文件陈旧/被伪造 | 探活 `/health` 校验 token 与 pid 双因子；不符即按僵死处理 |
| 并发拉起竞态 | 锁文件（`wx` 独占创建）+ 原子改名写端口文件，输家转投胎为客户端 |
| Windows git DLL 失败 | 服务内保留现有重试 + taskkill 进程树逻辑，并发上限可加队列 |

### 兼容与回退

- Phase 1 期间面板零改动，出问题回滚 = 插件回退版本，无数据迁移；
- Phase 2 直连失败自动降级代理，服务不在线时面板提示并保留只读能力（走 DSH 通道）。

### 成本预估

| 阶段 | 主要工作 | 规模 |
|------|---------|------|
| Phase 1 | server.js（平移为主）+ host 半区改造 | 新增 ~400 行，改 ~150 行 |
| Phase 2 | 引导端点 + fetch 层 + SSE | 新增 ~300 行，改 ~100 行 |

---

## 6. 待拍板决策点

1. **是否走两阶段**（先 A1+B1 再 A2），还是直接上 A2 直连？（直接 A2 省一次改造，但首版就背 CORS/token/回退三件事）
2. **B2 外接模式**是否进首版（`serviceUrl` 配置项），还是留到有真实多客户端需求再做？
3. SSE 推送（Phase 2）的优先级：status 轮询目前可用，是否值得提前？

## 7. 参考

- [PkgPulse：simple-git vs isomorphic-git vs Dugite (2026)](https://www.pkgpulse.com/guides/simple-git-vs-isomorphic-git-vs-dugite-2026) —— 三类引擎的定位与取舍
- [npm-compare：nodegit vs isomorphic-git vs simple-git](https://npm-compare.com/isomorphic-git,nodegit,simple-git)
- [isomorphic-git credentialManager 插件文档](https://isomorphic-git.org/docs/en/0.78.0/plugin_credentialManager) —— 编程式凭据（无 GCM 弹窗）的佐证
- 本仓库代码锚点：`lib/index.js` L117 `runGit` / L828+L852 路由注册；`lib/src/utils.js` L5-14 超时与重试语义 / L20-62 RPC 信封；README「安全模型」「架构」节
