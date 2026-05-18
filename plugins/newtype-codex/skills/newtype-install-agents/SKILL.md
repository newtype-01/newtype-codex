---
name: newtype-install-agents
description: Use to install or refresh newtype Codex custom agents from the installed plugin into `~/.codex/agents/` or a project `.codex/agents/`.
---

# newtype install agents

Use this skill when the user wants to enable the full newtype custom agent team, install newtype agents, refresh agent templates, or fix missing `newtype_*` agents.

## What this does

Codex plugins install skills automatically, but they do not run setup scripts on install. This skill runs the installer bundled with this plugin to copy the newtype agent templates into a Codex agent directory.

The installer is located relative to this `SKILL.md` file:

```text
../../scripts/install-agents.ts
```

Resolve that path to an absolute path before running it.

## Default install

If the user does not specify a target, install globally:

```bash
bun <absolute-path-to>/scripts/install-agents.ts --global --inherit-model --force
```

Use `--inherit-model` by default so the custom agents inherit the parent Codex session model instead of pinning potentially unavailable model names.

Use `--force` when refreshing or repairing existing newtype agents.

## Project install

If the user asks for a project-local install, run:

```bash
bun <absolute-path-to>/scripts/install-agents.ts --project <project-path> --inherit-model --force
```

Use the current workspace as `<project-path>` unless the user gives another project path.

## Verification

After installation, verify the expected files exist:

```text
~/.codex/agents/newtype_chief.toml
~/.codex/agents/newtype_deputy.toml
~/.codex/agents/newtype_researcher.toml
~/.codex/agents/newtype_fact_checker.toml
~/.codex/agents/newtype_writer.toml
~/.codex/agents/newtype_editor.toml
~/.codex/agents/newtype_extractor.toml
~/.codex/agents/newtype_archivist.toml
```

For a project-local install, check `<project>/.codex/agents/` instead.

The installer removes stale `newtype_workbench.toml` files from earlier newtype-codex versions because Workbench is a skill, not a custom agent.

Tell the user to restart Codex App or start a new Codex session if agents do not appear immediately.
