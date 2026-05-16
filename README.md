# Newtype for Codex

Newtype for Codex 是 Newtype OS 整合版的 Codex 插件化版本。

它保留 Newtype 的核心内容团队工作流，包括 Chief、Researcher、Fact Checker、Writer、Editor、Extractor、Archivist 和 Workbench；同时去掉 OpenCode 整合版里无法在 Codex 插件中原样运行的部分，例如 OpenCode TUI、OpenCode plugin runtime、provider/auth 定制、postinstall、内置 MCP 自动注入和 OpenCode session client 工具。

## 安装

把这个仓库作为 Codex marketplace 添加：

```bash
codex plugin marketplace add newtype-01/newtype-codex
```

然后在 Codex 的 `/plugins` 里安装 `Newtype for Codex`。插件安装后，Codex 会获得这些 Newtype skills：

- `newtype-chief`
- `newtype-research`
- `newtype-fact-check`
- `newtype-write`
- `newtype-edit`
- `newtype-extract`
- `newtype-archive`
- `newtype-workbench`

## 安装自定义 Agents

Codex 插件目前可以分发 skills，但自定义 subagents 仍然是 `.codex/agents/*.toml` 配置文件。因此本仓库额外提供安装脚本，把 Newtype agents 写入当前项目或全局 Codex 配置。

项目级安装：

```bash
git clone https://github.com/newtype-01/newtype-codex.git
cd newtype-codex
bun run install:agents -- --project /path/to/your/project
```

全局安装：

```bash
bun run install:agents -- --global
```

安装后可用的 agent 名称：

- `newtype_chief`
- `newtype_researcher`
- `newtype_fact_checker`
- `newtype_writer`
- `newtype_editor`
- `newtype_extractor`
- `newtype_archivist`
- `newtype_workbench`

## 模型选择

安装脚本默认会先读取本机 Codex 模型列表：

```bash
codex debug models
```

然后按候选优先级选择当前可见模型：

- Chief：`gpt-5.5` -> `gpt-5.4` -> `gpt-5.3-codex` -> `gpt-5.2`
- Strong：`gpt-5.4` -> `gpt-5.5` -> `gpt-5.3-codex` -> `gpt-5.2`
- Fast：`gpt-5.4-mini` -> `gpt-5.3-codex-spark` -> `gpt-5.4` -> `gpt-5.2`

查看当前 Codex 可见模型：

```bash
bun run install:agents -- --list-models
```

如果你不想把具体模型写入 agent 文件，可以继承当前 Codex 会话模型：

```bash
bun run install:agents -- --inherit-model
```

也可以手动覆盖：

```bash
NEWTYPE_CODEX_CHIEF_MODEL=gpt-5.4 \
NEWTYPE_CODEX_STRONG_MODEL=gpt-5.4 \
NEWTYPE_CODEX_FAST_MODEL=gpt-5.4-mini \
bun run install:agents
```

## 本地开发

把本地目录作为 marketplace 添加：

```bash
codex plugin marketplace add /Users/yihe/Documents/newtype-codex
```

运行校验：

```bash
bun run check
```

校验内容包括：

- marketplace JSON
- plugin manifest JSON
- skill frontmatter
- agent TOML 基本字段

## 仓库结构

```text
.agents/plugins/marketplace.json
plugins/newtype-codex/.codex-plugin/plugin.json
plugins/newtype-codex/skills/
plugins/newtype-codex/templates/agents/
plugins/newtype-codex/scripts/install-agents.ts
plugins/newtype-codex/scripts/check.ts
```

## 设计边界

这个仓库不是 `@newtype-os/cli` 的替代品，也不是 OpenCode plugin 的直接移植。它是 Codex 原生分发包：

- 用 Codex skills 承载可复用工作流。
- 用 `.codex/agents/*.toml` 承载自定义 subagents。
- 不依赖 Codex plugin hooks 作为核心路径，因为当前 Codex plugin hooks 需要用户显式启用。
- 不自动安装或启动第三方 MCP。需要 MCP 时，建议通过 Codex 自身 MCP 配置或后续版本单独接入。

