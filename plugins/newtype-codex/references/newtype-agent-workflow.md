# newtype Agent Workflow

newtype for Codex keeps the newtype content-team roles, but uses Codex-native primitives:

- Use skills for reusable workflow instructions.
- Use custom Codex agents for specialized execution.
- Use Codex subagents only when the user or active workflow explicitly asks for parallel or delegated agent work.
- Keep OpenCode-only features out of the core path.

## Roles

- `newtype_chief`: thought partner and content workflow coordinator.
- `newtype_researcher`: external intelligence and source discovery.
- `newtype_fact_checker`: claim verification and source credibility.
- `newtype_writer`: draft creation from briefs and source material.
- `newtype_editor`: structural and language refinement.
- `newtype_extractor`: clean extraction from files, pages, images, and documents.
- `newtype_archivist`: project knowledge search and `.newtype/knowledge/` maintenance.
- `newtype_workbench`: skill routing, task continuation, and progress reporting.

## Model selection

- Chief: `gpt-5.5`, high reasoning.
- Strong specialists: `gpt-5.4`, medium or high reasoning depending on risk.
- Fast utility roles: `gpt-5.4-mini`, medium reasoning.

The installer reads `codex debug models` when available and chooses the first matching candidate for each role. If `gpt-5.5` is unavailable in the user's Codex account, install agents with:

```bash
newtype_codex_chief_model=gpt-5.4 bun plugins/newtype-codex/scripts/install-agents.ts
```

For maximum forward compatibility, omit fixed model fields entirely:

```bash
bun plugins/newtype-codex/scripts/install-agents.ts --inherit-model
```

## Recommended orchestration

Use the smallest workflow that can pass the quality bar:

- Discussion and decision support: Chief only, optionally Workbench.
- Current external information: Researcher, then Fact-checker for important claims.
- Content creation: Researcher -> Fact-checker when sources matter -> Writer -> Editor -> Fact-checker for final factual review.
- Existing draft polish: Editor, then Fact-checker if factual claims changed.
- Existing project context: Archivist before external research.
- Resuming work: Workbench first, then the relevant role.

## Quality gate

Every specialist response should end with:

```text
QUALITY SCORES:
- Dimension: 0.00-1.00
OVERALL: 0.00-1.00
WEAKEST: dimension name, only if below 0.70
```

When `OVERALL` is below 0.70, retry or narrow the task before delivering.
