<p align="right">
  <strong>English</strong> | <a href="./README.zh-cn.md">简体中文</a>
</p>

# newtype for Codex

**Multi-Agent Content Team — the Codex plugin edition of newtype OS**

Created by [huangyihe](https://x.com/huangyihe).

---

## What is this

newtype for Codex packages the core newtype OS content workflow as a Codex plugin.

At its core, newtype OS is an **8-agent content-team system** built for content production. Think of it as **a content team living inside your AI coding environment**. Chief talks to you, performs Codex-level dispatch, and owns final synthesis; Deputy plans, decomposes, and advises on routing; specialist agents handle research, fact-checking, retrieval, extraction, writing, and editing.

```text
You ↔ Chief (Editor-in-Chief)
       ├─ Deputy (planning / routing advice)
       └─ Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor (execution)
```

This repository is the **Codex plugin edition**. It keeps the newtype content-team workflow, but uses Codex-native primitives:

- Codex plugins for distribution.
- One Codex skill as the team's operating manual and orchestration entrypoint.
- Codex custom agents for specialist roles.
- Project-local `.newtype/knowledge/` and `.newtype/workbench/` conventions for knowledge and task state.

It intentionally leaves out OpenCode-specific integration such as the OpenCode TUI, OpenCode plugin runtime, provider/auth customization, postinstall behavior, bundled MCP auto-injection, and OpenCode session-client tools.

## Comparison

|                 | newtype for Codex            | @newtype-os/cli                  | @newtype-os/plugin           |
| --------------- | ---------------------------- | -------------------------------- | ---------------------------- |
| **Nature**      | Codex plugin + agent templates | Standalone terminal app          | OpenCode plugin              |
| **Install**     | `codex plugin marketplace add` | `npm install -g @newtype-os/cli` | `bun add @newtype-os/plugin` |
| **Requires**    | Codex                         | Self-contained, no dependencies  | OpenCode                     |
| **Launch**      | Codex                         | `nt`                             | `opencode`                   |
| **Config dir**  | `~/.codex/`, `.codex/`        | `~/.config/newtype/`             | `~/.config/opencode/`        |
| **Project dir** | `.codex/`, `.newtype/`        | `.newtype/`                      | `.opencode/`                 |

### Key differences

`@newtype-os/cli` is the full integrated product. It embeds OpenCode as its engine, ships as the `nt` terminal app, includes the TUI, provider connection flow, CLI commands, memory system, MCP integrations, and WeChat bridge.

`@newtype-os/plugin` is the OpenCode plugin edition. It adds the newtype agent team to an existing OpenCode installation.

newtype for Codex is narrower by design. The plugin installs one `newtype-chief` Skill automatically, while the included installer writes eight optional custom-agent templates into Codex config.

## Installation

Step 1: add this repository as a Codex marketplace:

```bash
codex plugin marketplace add newtype-01/newtype-codex
```

Then open `/plugins` in Codex and install **newtype**.

Step 2: install the optional custom agents from inside Codex:

```text
Use $newtype-chief to install newtype agents globally.
```

Restart Codex App or start a new Codex session after the agents are installed. Chief can provide a minimal fallback without them, but the full 8-agent workflow requires this second step.

If the marketplace is visible but the plugin does not appear in the installed plugin list, make sure the plugin is enabled in `~/.codex/config.toml`:

```toml
[plugins."newtype-codex@newtype"]
enabled = true
```

Restart Codex App after changing the config or upgrading the marketplace:

```bash
codex plugin marketplace upgrade newtype
```

After installation, Codex exposes one Skill:

| Skill | Use when |
| --- | --- |
| `newtype-chief` | Explore ideas, route or resume content work, coordinate the team, manage project knowledge, or install the optional agents |

Invoke it directly, for example:

```text
Use $newtype-chief to research this topic and draft an outline.
Use $newtype-chief to verify and improve the claims in this article.
Use $newtype-chief to continue the previous content task.
Use $newtype-chief to install newtype agents globally.
```

## Custom agents

For the full newtype role experience, install the Codex custom agents as well.

This cannot currently be done automatically by the Codex plugin installer: plugin install does not execute arbitrary setup scripts. The included installer copies the agent templates into `~/.codex/agents/` or a project `.codex/agents/`, where Codex can use them as custom agents.

The recommended path is to ask Chief after installing the plugin:

```text
Use $newtype-chief to install newtype agents globally.
```

Chief runs the installer from the installed plugin cache, so users do not need to clone this repository.

Manual local development path:

```bash
git clone https://github.com/newtype-01/newtype-codex.git
cd newtype-codex
```

Install agents into a specific project:

```bash
bun run install:agents -- --project /path/to/your/project
```

Install agents globally:

```bash
bun run install:agents -- --global
```

After the agents are installed, invoking `$newtype-chief` is intended to act as the newtype orchestration entrypoint. For substantial content workflows, Chief should coordinate the installed specialist agents without requiring you to repeat "multi-agent" or "delegate" in every prompt. In the Codex edition, Deputy is a planning and routing-advice layer; actual subagent dispatch still happens from Chief's parent Codex session.

If agents do not appear immediately after installation, restart Codex App or start a new Codex session so the agent directory is reloaded.

Installed agent names:

| Agent | Responsibility |
| --- | --- |
| `newtype_chief` | Thought partner and content workflow coordinator |
| `newtype_deputy` | Deputy editor, workflow planner, and routing advisor |
| `newtype_researcher` | External intelligence gathering and source discovery |
| `newtype_fact_checker` | Claim verification and source credibility assessment |
| `newtype_writer` | Draft creation from briefs, notes, and research |
| `newtype_editor` | Structure, logic, clarity, and language polish |
| `newtype_extractor` | PDF, image, web page, and document extraction |
| `newtype_archivist` | Project knowledge search and `.newtype/knowledge/` maintenance |

Task continuation and Workbench state are handled by Chief through `.newtype/workbench/`.

## Model selection

The installer reads the local Codex model catalog when available:

```bash
codex debug models
```

It then automatically detects visible `gpt-*` models and sorts them by numeric version, so future models such as `gpt-6` or `gpt-5.6` are picked without changing the script.

| Role tier | Default selection |
| --- | --- |
| Chief | Highest visible general `gpt-*` model |
| Strong specialists | Highest visible general `gpt-*` model |
| Fast utility roles | Highest visible `gpt-*` model with `mini`, `spark`, `fast`, `lite`, or `nano`; falls back to the highest general model |

If model detection is unavailable, use `--inherit-model` to inherit the parent Codex session model.

List models visible to Codex:

```bash
bun run install:agents -- --list-models
```

Avoid fixed model names and inherit the current Codex session model:

```bash
bun run install:agents -- --inherit-model
```

Explicit model overrides remain available through `newtype_codex_chief_model`, `newtype_codex_strong_model`, and `newtype_codex_fast_model`; environment variables take precedence over automatic detection.

## Features

### Agent team

| Agent | Role | Responsibility |
| --- | --- | --- |
| **Chief** | Editor-in-Chief | Your entry point: thought partner and task coordinator |
| **Deputy** | Deputy editor | Workflow decomposition, routing advice, and handoff briefs |
| **Researcher** | Researcher | External intelligence gathering and trend discovery |
| **Fact-Checker** | Verifier | Fact verification and source credibility assessment |
| **Archivist** | Archivist | Internal knowledge retrieval and correlation |
| **Extractor** | Extractor | PDF, image, web, and document extraction |
| **Writer** | Writer | Turns source material into structured drafts |
| **Editor** | Editor | Language polish, logic strengthening, and consistency |

The Codex edition keeps subagent orchestration one level deep: Chief can ask Deputy for a plan, then Chief dispatches specialist agents. Chief also handles task continuation and `.newtype/workbench/` state.

### Workflow examples

```text
Use $newtype-chief to gather sources on AI agent architecture trends.
Use $newtype-chief to turn this research into a newsletter draft.
Use $newtype-chief to tighten the draft for a technical founder audience.
Use $newtype-chief to save the final version into the project knowledge base.
```

For larger work, start with Chief:

```text
Use $newtype-chief to run a research -> fact-check -> write -> edit workflow for this topic.
```

### Knowledge conventions

newtype for Codex uses project-local files instead of the full newtype OS memory runtime:

- `.newtype/knowledge/` for durable notes, source material, and reusable content.
- `.newtype/workbench/` for task state, continuation notes, and progress reports.

## Local development

Add the local repository as a marketplace:

```bash
codex plugin marketplace add /Users/yihe/Documents/newtype-codex
```

Run validation:

```bash
bun run check
```

The check validates:

- Marketplace JSON
- Plugin manifest JSON
- Skill frontmatter
- Agent TOML required fields

## Repository layout

```text
.agents/plugins/marketplace.json
plugins/newtype-codex/.codex-plugin/plugin.json
plugins/newtype-codex/skills/
plugins/newtype-codex/templates/agents/
plugins/newtype-codex/scripts/install-agents.ts
plugins/newtype-codex/scripts/check.ts
```

## Current limitations

newtype for Codex does not currently include:

- The `nt` CLI and TUI.
- OpenCode provider/auth integrations.
- Automatic MCP server injection.
- Automatic memory summarization.
- WeChat bridge.
- OpenCode session-client tools such as `chief_task`.
- Nested dispatch where Deputy creates, waits for, or closes other custom agents.

Use `@newtype-os/cli` if you want the complete integrated newtype OS experience.

## Links

- **newtype OS**: [github.com/newtype-01/newtype-os](https://github.com/newtype-01/newtype-os)
- **newtype CLI**: [npmjs.com/package/@newtype-os/cli](https://www.npmjs.com/package/@newtype-os/cli)
- **newtype plugin**: [npmjs.com/package/@newtype-os/plugin](https://www.npmjs.com/package/@newtype-os/plugin)
- **YouTube**: [youtube.com/@huanyihe777](https://www.youtube.com/@huanyihe777)
- **Twitter**: [x.com/huangyihe](https://x.com/huangyihe)
- **Substack**: [newtype.pro](https://newtype.pro/)

## License

Based on [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode), follows [SUL-1.0 License](https://github.com/code-yeongyu/oh-my-opencode/blob/master/LICENSE.md).
