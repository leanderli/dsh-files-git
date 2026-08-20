# 贡献指南

感谢你考虑为 dsh-files-git 贡献！🎉

## 报告问题（Issue）

- 提交前请先搜索[已有 Issue](https://github.com/leanderli/dsh-files-git/issues)，
  避免重复；
- 请包含：DSH 版本（`dsh --version`）、git 版本、操作系统与浏览器、
  复现步骤、预期与实际行为；如有报错，附上面板输出模块 / 浏览器控制台的
  错误文本；
- 安全漏洞请**勿**开公开 Issue，按 [SECURITY.md](SECURITY.md) 披露。

## 提交 Pull Request

1. Fork 本仓库并创建特性分支：
   ```sh
   git checkout -b feat/my-feature
   ```
2. **修改 `lib/src/` 下的源码片段**，不要手改 `lib/client.js`（它是构建产物）；
3. 重新拼装产物并验证：
   ```sh
   node lib/build.cjs --rebuild
   dsh web   # 重启后在实际 WebUI 中手动验证你的改动
   ```
   构建脚本会对片段首行标记做断言，若报 line mismatch，请先跑一次
   `node lib/build.cjs`（不带参数：按当前 bundle 重切分再拼装）刷新行号表；
4. 如改动影响界面文案，请同时更新 `lib/src/i18n.js` 的 **zh / en 两份字典**
   （双语强制平衡，缺一边会在加载时报错）；
5. 更新 README.md / README.en.md 中受影响的功能描述（两份保持同步）；
6. 提交信息请简洁描述动机与改动（中英文均可），发起 PR 并说明验证方式。

## 代码约定

- 源码片段共享同一工厂作用域（无 import/export），按 `lib/build.cjs` 中
  `PARTS` 表的依赖顺序拼装——新增片段需同步更新该表及 `HEADS`/`TAILS` 标记；
- 遵循现有风格：Tab 缩进、双引号字符串、中文注释说明意图；
- 保持 host 半区（`lib/index.js`）**零运行时依赖**（仅 Node 内置模块）；
- 涉及 RPC 端点变更时，同步更新 `lib/index.js` 头部注释与文档中的端点清单；
- 所有 git 命令必须走 argv 数组执行（无 shell 拼接），文件访问必须保持
  工作区包含校验——安全模型见 [SECURITY.md](SECURITY.md)，勿引入绕过。

## 许可

提交 PR 即表示你同意将贡献以 [MIT 许可证](LICENSE) 授权本仓库使用。
