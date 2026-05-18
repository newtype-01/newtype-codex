# newtype for Codex Plugin

这是 Codex plugin 根目录。插件本体提供 newtype skills；自定义 agents 通过 `templates/agents/` 和 `scripts/install-agents.ts` 安装。Codex plugin 安装目前不会自动执行这个脚本；运行安装器后，agent 模板会被复制到 `.codex/agents/` 或 `~/.codex/agents/`，并可被 Codex 作为 custom agents 使用。

## Included

- `skills/`：newtype chief、research、fact check、write、edit、extract、archive、workbench、install agents。
- `templates/agents/`：对应的 Codex custom agent TOML 模板。
- `scripts/install-agents.ts`：把 agent 模板写入 `.codex/agents/` 或 `~/.codex/agents/`。
- `references/newtype-agent-workflow.md`：newtype 工作流和模型选择说明。

## Install agents

推荐方式是在 Codex 中直接运行安装 skill：

```text
Use $newtype-install-agents to install newtype agents globally.
```

这个 skill 会从已安装的 plugin 目录运行内置安装器，不需要用户 clone 仓库。

项目级安装：

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --project /path/to/project
```

全局安装：

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --global
```

继承当前 Codex 会话模型，不写死模型名：

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --inherit-model
```

查看当前 Codex 可见模型：

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --list-models
```

## Not included

- OpenCode TUI
- OpenCode provider/auth 定制
- OpenCode plugin runtime
- OpenCode session client tools
- 自动 MCP 注入
- 默认启用 plugin hooks
