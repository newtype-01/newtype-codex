<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# newtype for Codex

**Multi-Agent Content Team — newtype OS 的 Codex 插件版**

由 [huangyihe（黄益贺）](https://x.com/huangyihe) 创作。

---

## 这是什么

newtype for Codex 是把 newtype OS 核心内容工作流封装成 Codex 插件的版本。

newtype OS 的内核是一套 **8 Agent 内容团队系统**，专为内容生产场景打造。你可以把它理解为：**一个驻扎在 AI 编程环境里的内容团队**。Chief 负责与你对话、执行 Codex 层面的调度和最终整合；Deputy 负责规划、拆解和路由建议；专家 Agent 分别处理调研、核查、检索、提取、撰写和编辑。

```text
你 ↔ Chief（主编）
      ├─ Deputy（规划 / 路由建议）
      └─ Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor（执行）
```

这个仓库是 **Codex 插件版**。它保留 newtype 的内容团队工作流，但使用 Codex 原生能力：

- 用 Codex plugin 分发。
- 用一个 Codex Skill 承载团队操作说明和编排入口。
- 用 Codex custom agents 承载专家角色。
- 用项目内 `.newtype/knowledge/` 和 `.newtype/workbench/` 约定管理知识与任务状态。

它不会原样包含 OpenCode 整合版里的能力，例如 OpenCode TUI、OpenCode plugin runtime、provider/auth 定制、postinstall、内置 MCP 自动注入和 OpenCode session client 工具。

## 对比

|              | newtype for Codex          | @newtype-os/cli（CLI）           | @newtype-os/plugin（插件）   |
| ------------ | -------------------------- | -------------------------------- | ---------------------------- |
| **性质**     | Codex 插件 + Agent 模板    | 独立终端应用                     | OpenCode 插件                |
| **安装**     | `codex plugin marketplace add` | `npm install -g @newtype-os/cli` | `bun add @newtype-os/plugin` |
| **依赖**     | 需要 Codex                 | 自包含，无需其他依赖             | 需要 OpenCode                |
| **启动**     | Codex                      | `nt`                             | `opencode`                   |
| **配置目录** | `~/.codex/`、`.codex/`     | `~/.config/newtype/`             | `~/.config/opencode/`        |
| **项目目录** | `.codex/`、`.newtype/`     | `.newtype/`                      | `.opencode/`                 |

### 核心差异

`@newtype-os/cli` 是完整整合版产品。它把 OpenCode 作为底层引擎整合进 `nt` 终端应用，包含 TUI、模型供应商连接、CLI 命令、记忆系统、MCP 集成和微信桥接。

`@newtype-os/plugin` 是 OpenCode 插件版，会把 newtype agent 团队注入到现有 OpenCode 安装中。

newtype for Codex 则更克制。插件会自动安装一个 `newtype-chief` Skill，内置安装脚本负责把八个可选 custom-agent 模板写入 Codex 配置目录。

## 安装

步骤 1：把这个仓库作为 Codex marketplace 添加：

```bash
codex plugin marketplace add newtype-01/newtype-codex
```

然后在 Codex 的 `/plugins` 中安装 **newtype**。

步骤2：正常调用Chief。第一次显式使用时，Chief会检查可选的custom agents是否存在且版本一致：

```text
Use $newtype-chief to help me plan this content project.
```

如果团队缺失或版本过旧，Chief会说明一次性设置、请求权限，并使用父模型继承方式安装八个全局Agents。安装后请重启Codex App或开启新会话。如果用户拒绝设置，或当前任务需要立即继续，Chief仍可执行最小可行流程。

如果 marketplace 已经能看到，但已安装插件列表里没有 newtype，请确认 `~/.codex/config.toml` 里有启用项：

```toml
[plugins."newtype-codex@newtype"]
enabled = true
```

修改配置或升级 marketplace 后，重启 Codex App：

```bash
codex plugin marketplace upgrade newtype
```

安装后，Codex 只暴露一个 Skill：

| Skill | 使用场景 |
| --- | --- |
| `newtype-chief` | 讨论想法、路由或续接内容工作、协调团队、管理项目知识或安装agents |

可以在 Codex 中直接这样使用：

```text
Use $newtype-chief to research this topic and draft an outline.
Use $newtype-chief to verify and improve the claims in this article.
Use $newtype-chief to continue the previous content task.
Use $newtype-chief to help me plan this content project.
```

## 安装自定义 Agents

如果想获得完整的 newtype 角色体验，还需要安装 Codex custom agents。

Codex plugin安装器不能执行任意setup脚本，因此不会在安装插件时直接写入Agents。第一次显式调用`$newtype-chief`时，Chief会先运行只读状态检查；如果团队缺失或版本过旧，再请求权限并把模板复制到`~/.codex/agents/`，随后Codex即可把它们作为custom agents使用。

推荐方式是安装插件后直接正常使用Chief：

```text
Use $newtype-chief to research this topic and propose an outline.
```

Chief会从已安装的plugin缓存目录运行状态检查，并在需要时运行内置安装器，所以普通用户不需要clone仓库，也不需要记住安装命令。安装器会在Agent文件旁写入`.newtype-codex-agents.json`；以后插件升级时，Chief通过这个标记判断团队是否需要刷新。

本地开发时也可以手动运行：

```bash
git clone https://github.com/newtype-01/newtype-codex.git
cd newtype-codex
```

安装到指定项目：

```bash
bun run install:agents -- --project /path/to/your/project --inherit-model --force
```

全局安装：

```bash
bun run install:agents -- --global --inherit-model --force
```

检查全局Agents是否与当前插件版本一致：

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --status --global
```

Agents 安装完成后，调用 `$newtype-chief` 就应该被视为 newtype 编排入口。对于较大的内容工作流，Chief 应该主动协调已安装的专家 agents，而不需要你每次都额外写“多 Agent 协作”或 “delegate”。Codex 版里 Deputy 是规划和路由建议层；真实的 subagent 派发仍由 Chief 所在的父 Codex 会话执行。

如果安装后没有立刻看到 agents，请重启 Codex App 或开启一个新的 Codex 会话，让 Codex 重新加载 agent 目录。

安装后的 agent 名称：

| Agent | 职责 |
| --- | --- |
| `newtype_chief` | 思考伙伴和内容工作流协调者 |
| `newtype_deputy` | 副手编辑、工作流规划和路由建议 |
| `newtype_researcher` | 外部情报搜集和来源发现 |
| `newtype_fact_checker` | 事实核查和来源可信度评估 |
| `newtype_writer` | 基于 brief、笔记和调研结果撰写初稿 |
| `newtype_editor` | 结构、逻辑、清晰度和语言润色 |
| `newtype_extractor` | PDF、图片、网页和文档提取 |
| `newtype_archivist` | 项目知识检索和 `.newtype/knowledge/` 维护 |

任务续接和WorkBench状态由Chief通过`.newtype/workbench/`处理。

## 模型选择

安装脚本会优先读取本机 Codex 模型列表：

```bash
codex debug models
```

然后自动识别当前可见的 `gpt-*` 模型，并按数值版本排序。因此以后出现 `gpt-6` 或 `gpt-5.6` 这类更高模型时，不需要改脚本也会自动优先使用。

| 角色层级 | 默认选择 |
| --- | --- |
| Chief | 当前可见的最高通用 `gpt-*` 模型 |
| Strong specialists | 当前可见的最高通用 `gpt-*` 模型 |
| Fast utility roles | 当前可见的最高 `mini`、`spark`、`fast`、`lite` 或 `nano` 轻量 `gpt-*` 模型；没有轻量模型时回退到最高通用模型 |

Chief的首次设置会使用`--inherit-model`，因此八个Agents都会自动继承父Codex会话模型。手动安装且不带该参数时，才使用下面的分档模型检测。

查看 Codex 当前可见模型：

```bash
bun run install:agents -- --list-models
```

不想写死模型名，可以继承当前 Codex 会话模型：

```bash
bun run install:agents -- --inherit-model
```

仍可通过`newtype_codex_chief_model`、`newtype_codex_strong_model`和`newtype_codex_fast_model`手动覆盖；环境变量优先于自动检测。

## 功能

### Agent 团队

| Agent | 角色 | 职责 |
| --- | --- | --- |
| **Chief** | 主编 | 你的入口：思考伙伴 + 任务协调 |
| **Deputy** | 副手编辑 | 工作流拆解、路由建议和交接 brief |
| **Researcher** | 研究员 | 外部情报搜集和趋势发现 |
| **Fact-Checker** | 核查员 | 事实验证和来源可信度评估 |
| **Archivist** | 档案员 | 内部知识检索与关联 |
| **Extractor** | 提取员 | PDF、图片、网页和文档提取 |
| **Writer** | 撰稿人 | 将素材转化为结构化初稿 |
| **Editor** | 编辑 | 语言润色、逻辑加固和风格统一 |

Codex版保持一层subagent调度：Chief可以先让Deputy产出计划，再由Chief派发专家Agent。任务续接和`.newtype/workbench/`状态也由Chief处理。

### 工作流示例

```text
Use $newtype-chief to gather sources on AI agent architecture trends.
Use $newtype-chief to turn this research into a newsletter draft.
Use $newtype-chief to tighten the draft for a technical founder audience.
Use $newtype-chief to save the final version into the project knowledge base.
```

复杂任务建议从 Chief 开始：

```text
Use $newtype-chief to run a research -> fact-check -> write -> edit workflow for this topic.
```

### 知识约定

newtype for Codex 使用项目本地文件，而不是完整 newtype OS 的记忆运行时：

- `.newtype/knowledge/`：长期保存笔记、来源材料和可复用内容。
- `.newtype/workbench/`：保存任务状态、续接笔记和进度报告。

## 本地开发

把本地仓库作为 marketplace 添加：

```bash
codex plugin marketplace add /Users/yihe/Documents/newtype-codex
```

运行校验：

```bash
bun run check
```

校验内容包括：

- Marketplace JSON
- Plugin manifest JSON
- Skill frontmatter
- Agent TOML 必填字段

## 仓库结构

```text
.agents/plugins/marketplace.json
plugins/newtype-codex/.codex-plugin/plugin.json
plugins/newtype-codex/skills/
plugins/newtype-codex/templates/agents/
plugins/newtype-codex/scripts/install-agents.ts
plugins/newtype-codex/scripts/check.ts
```

## 当前限制

newtype for Codex 当前不包含：

- `nt` CLI 和 TUI。
- OpenCode provider/auth 集成。
- 自动 MCP server 注入。
- 自动记忆摘要。
- 微信桥接。
- `chief_task` 等 OpenCode session-client 工具。
- Deputy 内部继续创建、等待或关闭其它 custom agents 的嵌套调度。

如果你需要完整整合版 newtype OS 体验，请使用 `@newtype-os/cli`。

## 链接

- **newtype OS**: [github.com/newtype-01/newtype-os](https://github.com/newtype-01/newtype-os)
- **newtype CLI**: [npmjs.com/package/@newtype-os/cli](https://www.npmjs.com/package/@newtype-os/cli)
- **newtype plugin**: [npmjs.com/package/@newtype-os/plugin](https://www.npmjs.com/package/@newtype-os/plugin)
- **YouTube**: [youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [newtype.pro](https://newtype.pro/)
- **知识星球**: [t.zsxq.com/19IaNz5wK](https://t.zsxq.com/19IaNz5wK)

## 许可证

基于 [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode)，遵循 [SUL-1.0 许可证](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md)。
