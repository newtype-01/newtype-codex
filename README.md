<p align="right">
  <strong>English</strong> | <a href="./README.zh-cn.md">简体中文</a>
</p>

# Newtype for Codex

**Multi-Agent Content Team — the Codex plugin edition of newtype OS**

Created by [huangyihe](https://x.com/huangyihe).

---

## What is this

Newtype for Codex packages the core newtype OS content workflow as a Codex plugin.

At its core, newtype OS is an **8-agent multi-layer orchestration system** built for content production. Think of it as **a content team living inside your AI coding environment**. Chief talks to you and coordinates the work; specialist agents handle research, fact-checking, retrieval, extraction, writing, and editing.

```text
You ↔ Chief (Editor-in-Chief)
          ↓
      Researcher · Fact-Checker · Archivist · Extractor · Writer · Editor · Workbench
```

This repository is the **Codex plugin edition**. It keeps the Newtype content-team workflow, but uses Codex-native primitives:

- Codex plugins for distribution.
- Codex skills for reusable workflow instructions.
- Codex custom agents for specialist roles.
- Project-local `.newtype/knowledge/` and `.newtype/workbench/` conventions for knowledge and task state.

It intentionally leaves out OpenCode-specific integration such as the OpenCode TUI, OpenCode plugin runtime, provider/auth customization, postinstall behavior, bundled MCP auto-injection, and OpenCode session-client tools.

## Comparison

|                 | Newtype for Codex            | @newtype-os/cli                  | @newtype-os/plugin           |
| --------------- | ---------------------------- | -------------------------------- | ---------------------------- |
| **Nature**      | Codex plugin + agent templates | Standalone terminal app          | OpenCode plugin              |
| **Install**     | `codex plugin marketplace add` | `npm install -g @newtype-os/cli` | `bun add @newtype-os/plugin` |
| **Requires**    | Codex                         | Self-contained, no dependencies  | OpenCode                     |
| **Launch**      | Codex                         | `nt`                             | `opencode`                   |
| **Config dir**  | `~/.codex/`, `.codex/`        | `~/.config/newtype/`             | `~/.config/opencode/`        |
| **Project dir** | `.codex/`, `.newtype/`        | `.newtype/`                      | `.opencode/`                 |

### Key differences

`@newtype-os/cli` is the full integrated product. It embeds OpenCode as its engine, ships as the `nt` terminal app, includes the TUI, provider connection flow, CLI commands, memory system, MCP integrations, and WeChat bridge.

`@newtype-os/plugin` is the OpenCode plugin edition. It adds the Newtype agent team to an existing OpenCode installation.

Newtype for Codex is narrower by design. Codex plugins can distribute skills, but custom subagents are still `.codex/agents/*.toml` files. This repository therefore ships both: the plugin installs Newtype skills, and the included installer writes Newtype custom agent templates into Codex config.

## Installation

Add this repository as a Codex marketplace:

```bash
codex plugin marketplace add newtype-01/newtype-codex
```

Then open `/plugins` in Codex and install **Newtype for Codex**.

After installation, Codex can use these skills:

| Skill | Use when |
| --- | --- |
| `newtype-chief` | Main Newtype workflow, content-team orchestration, and role selection |
| `newtype-research` | External research, source discovery, trends, and competitive analysis |
| `newtype-fact-check` | Claim verification, citation checks, and source credibility |
| `newtype-write` | Drafting articles, newsletters, reports, scripts, and long-form content |
| `newtype-edit` | Editing for structure, clarity, logic, tone, and polish |
| `newtype-extract` | Extracting clean Markdown or structured data from files, images, pages, and documents |
| `newtype-archive` | Searching, organizing, or storing project knowledge under `.newtype/knowledge/` |
| `newtype-workbench` | Choosing the next Newtype skill, resuming tasks, and reporting progress |

You can invoke the workflow directly in Codex, for example:

```text
Use $newtype-chief to research this topic and draft an outline.
Use $newtype-fact-check to verify the claims in this article.
Use $newtype-workbench to continue the previous content task.
```

## Custom agents

For the full Newtype role experience, install the Codex custom agents as well.

Clone this repository:

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

Installed agent names:

| Agent | Responsibility |
| --- | --- |
| `newtype_chief` | Thought partner and content workflow coordinator |
| `newtype_researcher` | External intelligence gathering and source discovery |
| `newtype_fact_checker` | Claim verification and source credibility assessment |
| `newtype_writer` | Draft creation from briefs, notes, and research |
| `newtype_editor` | Structure, logic, clarity, and language polish |
| `newtype_extractor` | PDF, image, web page, and document extraction |
| `newtype_archivist` | Project knowledge search and `.newtype/knowledge/` maintenance |
| `newtype_workbench` | Skill routing, task continuation, and progress reporting |

## Model selection

The installer reads the local Codex model catalog when available:

```bash
codex debug models
```

It then chooses the first visible model from each role's candidate list:

| Role tier | Candidate order |
| --- | --- |
| Chief | `gpt-5.5` -> `gpt-5.4` -> `gpt-5.3-codex` -> `gpt-5.2` |
| Strong specialists | `gpt-5.4` -> `gpt-5.5` -> `gpt-5.3-codex` -> `gpt-5.2` |
| Fast utility roles | `gpt-5.4-mini` -> `gpt-5.3-codex-spark` -> `gpt-5.4` -> `gpt-5.2` |

List models visible to Codex:

```bash
bun run install:agents -- --list-models
```

Avoid fixed model names and inherit the current Codex session model:

```bash
bun run install:agents -- --inherit-model
```

Override model choices manually:

```bash
NEWTYPE_CODEX_CHIEF_MODEL=gpt-5.4 \
NEWTYPE_CODEX_STRONG_MODEL=gpt-5.4 \
NEWTYPE_CODEX_FAST_MODEL=gpt-5.4-mini \
bun run install:agents
```

## Features

### Agent team

| Agent | Role | Responsibility |
| --- | --- | --- |
| **Chief** | Editor-in-Chief | Your entry point: thought partner and task coordinator |
| **Researcher** | Researcher | External intelligence gathering and trend discovery |
| **Fact-Checker** | Verifier | Fact verification and source credibility assessment |
| **Archivist** | Archivist | Internal knowledge retrieval and correlation |
| **Extractor** | Extractor | PDF, image, web, and document extraction |
| **Writer** | Writer | Turns source material into structured drafts |
| **Editor** | Editor | Language polish, logic strengthening, and consistency |
| **Workbench** | Router | Skill selection, task continuation, and progress reports |

### Workflow examples

```text
Use $newtype-research to gather sources on AI agent architecture trends.
Use $newtype-write to turn this research into a newsletter draft.
Use $newtype-edit to tighten the draft for a technical founder audience.
Use $newtype-archive to save the final version into the project knowledge base.
```

For larger work, start with Chief:

```text
Use $newtype-chief to run a research -> fact-check -> write -> edit workflow for this topic.
```

### Knowledge conventions

Newtype for Codex uses project-local files instead of the full newtype OS memory runtime:

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

Newtype for Codex does not currently include:

- The `nt` CLI and TUI.
- OpenCode provider/auth integrations.
- Automatic MCP server injection.
- Automatic memory summarization.
- WeChat bridge.
- OpenCode session-client tools such as `chief_task`.

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

