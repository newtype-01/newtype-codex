<p align="right">
  <a href="./README.md">English</a> | <strong>简体中文</strong>
</p>

# newtype for Codex

**Multi-Agent Content Team — newtype OS 的 Codex 插件版**

由 [huangyihe（黄益贺）](https://x.com/huangyihe) 创作。

---

## 这是什么

newtype for Codex 是把 newtype OS 核心内容工作流封装成 Codex 插件的版本。

newtype OS 的内核是一套 **8 Agent 多层编排系统**，专为内容生产场景打造。你可以把它理解为：**一个驻扎在 AI 编程环境里的内容团队**。Chief 负责与你对话和协调任务；专家 Agent 分别处理调研、核查、检索、提取、撰写和编辑。

```text
你 ↔ Chief（主编）
         ↓
     Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor · Workbench
```

这个仓库是 **Codex 插件版**。它保留 newtype 的内容团队工作流，但使用 Codex 原生能力：

- 用 Codex plugin 分发。
- 用 Codex skills 承载可复用工作流。
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

`@newtype-os/plugin` 是 OpenCode 插件版，会把 newtype Agent 团队注入到现有 OpenCode 安装中。

newtype for Codex 则更克制。Codex 插件目前可以分发 skills，但自定义 subagents 仍然是 `.codex/agents/*.toml` 文件。因此本仓库同时提供两层：插件安装 newtype skills，安装脚本写入 newtype custom agent 模板。

## 安装

把这个仓库作为 Codex marketplace 添加：

```bash
codex plugin marketplace add newtype-01/newtype-codex
```

然后在 Codex 的 `/plugins` 中安装 **newtype**。

如果 marketplace 已经能看到，但已安装插件列表里没有 newtype，请确认 `~/.codex/config.toml` 里有启用项：

```toml
[plugins."newtype-codex@newtype"]
enabled = true
```

修改配置或升级 marketplace 后，重启 Codex App：

```bash
codex plugin marketplace upgrade newtype
```

安装后，Codex 可以使用这些 skills：

| Skill | 使用场景 |
| --- | --- |
| `newtype-chief` | newtype 主工作流、内容团队编排和角色选择 |
| `newtype-research` | 外部调研、来源发现、趋势和竞品分析 |
| `newtype-fact-check` | 声明核查、引用检查和来源可信度评估 |
| `newtype-write` | 撰写文章、newsletter、报告、脚本和长文 |
| `newtype-edit` | 结构、清晰度、逻辑、语气和润色编辑 |
| `newtype-extract` | 从文件、图片、网页和文档中提取 Markdown 或结构化数据 |
| `newtype-archive` | 搜索、整理或保存 `.newtype/knowledge/` 项目知识 |
| `newtype-workbench` | 选择下一个 newtype skill、继续任务和生成进度报告 |

可以在 Codex 中直接这样使用：

```text
Use $newtype-chief to research this topic and draft an outline.
Use $newtype-fact-check to verify the claims in this article.
Use $newtype-workbench to continue the previous content task.
```

## 安装自定义 Agents

如果想获得完整的 newtype 角色体验，还需要安装 Codex custom agents。

克隆仓库：

```bash
git clone https://github.com/newtype-01/newtype-codex.git
cd newtype-codex
```

安装到指定项目：

```bash
bun run install:agents -- --project /path/to/your/project
```

全局安装：

```bash
bun run install:agents -- --global
```

安装后的 agent 名称：

| Agent | 职责 |
| --- | --- |
| `newtype_chief` | 思考伙伴和内容工作流协调者 |
| `newtype_researcher` | 外部情报搜集和来源发现 |
| `newtype_fact_checker` | 事实核查和来源可信度评估 |
| `newtype_writer` | 基于 brief、笔记和调研结果撰写初稿 |
| `newtype_editor` | 结构、逻辑、清晰度和语言润色 |
| `newtype_extractor` | PDF、图片、网页和文档提取 |
| `newtype_archivist` | 项目知识检索和 `.newtype/knowledge/` 维护 |
| `newtype_workbench` | Skill 路由、任务续接和进度报告 |

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

如果禁用模型检测，或 `codex debug models` 不可用，脚本会使用保守 fallback：Chief 用 `gpt-5.5`，强专家用 `gpt-5.4`，快速工具角色用 `gpt-5.4-mini`。

查看 Codex 当前可见模型：

```bash
bun run install:agents -- --list-models
```

不想写死模型名，可以继承当前 Codex 会话模型：

```bash
bun run install:agents -- --inherit-model
```

也可以手动指定。环境变量优先级高于自动检测：

```bash
newtype_codex_chief_model=gpt-5.4 \
newtype_codex_strong_model=gpt-5.4 \
newtype_codex_fast_model=gpt-5.4-mini \
bun run install:agents
```

## 功能

### Agent 团队

| Agent | 角色 | 职责 |
| --- | --- | --- |
| **Chief** | 主编 | 你的入口：思考伙伴 + 任务协调 |
| **Researcher** | 研究员 | 外部情报搜集和趋势发现 |
| **Fact-Checker** | 核查员 | 事实验证和来源可信度评估 |
| **Archivist** | 档案员 | 内部知识检索与关联 |
| **Extractor** | 提取员 | PDF、图片、网页和文档提取 |
| **Writer** | 撰稿人 | 将素材转化为结构化初稿 |
| **Editor** | 编辑 | 语言润色、逻辑加固和风格统一 |
| **Workbench** | 路由器 | Skill 选择、任务续接和进度报告 |

### 工作流示例

```text
Use $newtype-research to gather sources on AI agent architecture trends.
Use $newtype-write to turn this research into a newsletter draft.
Use $newtype-edit to tighten the draft for a technical founder audience.
Use $newtype-archive to save the final version into the project knowledge base.
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
