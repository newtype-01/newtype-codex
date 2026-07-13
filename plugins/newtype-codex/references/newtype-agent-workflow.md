# newtype agent workflow

newtype for Codex uses one orchestration Skill and eight optional custom agents.

## Roles

- `newtype_chief`: parent thought partner, dispatcher, and final synthesizer.
- `newtype_deputy`: workflow planner and routing advisor; never dispatches agents.
- `newtype_researcher`: external research and source discovery.
- `newtype_fact_checker`: claim verification and source credibility.
- `newtype_writer`: draft creation from briefs and evidence.
- `newtype_editor`: structural and language refinement.
- `newtype_extractor`: faithful extraction from source material.
- `newtype_archivist`: `.newtype/knowledge/` retrieval and maintenance.

## Model Tiers

The installer resolves three capability tiers from the current Codex model catalog:

- Chief: strongest available general model.
- Strong: capable model for research, verification, writing, and editing.
- Fast: efficient model for extraction and archiving; fall back to Strong when unavailable.

Use `--inherit-model` when model portability matters more than role-specific selection. Keep concrete model candidates inside the installer rather than user-facing workflow instructions.

## Orchestration

Use the smallest workflow that can satisfy the request:

- Discussion and decision support: Chief only.
- Complex coordination: Chief -> Deputy plan -> Chief dispatches specialists.
- Current information: Researcher, then Fact Checker for important claims.
- Content creation: Researcher when needed -> Fact Checker for source-critical claims -> Writer -> Editor -> final factual check when warranted.
- Existing draft: Editor; add Fact Checker only if facts changed or risk is high.
- Existing project context: Archivist before external research.
- Source extraction: Extractor before analysis or drafting.

Keep dispatch one level deep. Agents return focused artifacts to Chief; Chief owns retries, synthesis, and the final user response.

## Internal Quality Gate

Do not emit numeric self-scores. Check the artifact against task-specific acceptance criteria instead:

- Research: sufficient authoritative sources, contradictions, and gaps.
- Fact-check: claim coverage, evidence quality, verdicts, and concrete fixes.
- Extraction: fidelity, completeness, structure, and uncertainty markers.
- Writing: brief compliance, structure, grounding, and completeness.
- Editing: preserved intent, stronger logic, cleaner prose, and no invented facts.
- Archive: correct paths, useful metadata, retrieval relevance, and no unsupported external claims.

If a required criterion fails, Chief retries or narrows that stage before delivery.
