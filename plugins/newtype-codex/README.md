# newtype for Codex Plugin

Codex plugin with one orchestration Skill and eight optional custom-agent templates.

## Included

- `skills/newtype-chief/`: the single user-facing manual for routing, resuming work, agent installation, and orchestration.
- `templates/agents/`: Chief, Deputy, Researcher, Fact Checker, Writer, Editor, Extractor, and Archivist.
- `scripts/install-agents.ts`: installs templates into a project `.codex/agents/` or global `~/.codex/agents/`.
- `references/newtype-agent-workflow.md`: role boundaries, model tiers, orchestration, and internal quality gates.

## First use

Plugin installation loads `newtype-chief` but cannot run an arbitrary setup script. On the first explicit invocation, Chief checks the bundled agent version. If the team is missing or outdated, Chief requests permission and runs the installer for the user:

```text
Use $newtype-chief to help me plan this content project.
```

After the one-time setup, restart Codex or start a new session. Later invocations skip installation while the version marker is current.

Local development:

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --global --inherit-model --force
bun plugins/newtype-codex/scripts/install-agents.ts --project /path/to/project --inherit-model --force
bun plugins/newtype-codex/scripts/install-agents.ts --status --global
```

The plugin does not include the OpenCode TUI, provider/auth customization, session-client tools, automatic MCP injection, or nested custom-agent dispatch.
