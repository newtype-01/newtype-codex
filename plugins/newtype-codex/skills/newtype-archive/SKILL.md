---
name: newtype-archive
description: Use to search, summarize, organize, or store project knowledge in `.newtype/knowledge/` and maintain reusable content memory.
---

# Newtype Archive

Use this skill when the user asks about previous work, project notes, memory, archives, knowledge base material, or saving useful results.

If custom agents are installed, delegate archive and retrieval work to `newtype_archivist`.

## Storage convention

Use project-local files:

- `.newtype/knowledge/` for durable knowledge, source notes, and reusable materials.
- `.newtype/workbench/` for task state, continuation notes, and progress reports.

Prefer Markdown files with concise frontmatter:

```markdown
---
title: "Short title"
tags: ["tag"]
created: "YYYY-MM-DD"
source: "conversation|file|url|manual"
---
```

## Retrieval workflow

1. Search exact terms first.
2. Search related terms and aliases.
3. Summarize direct matches and surprising related materials.
4. Identify gaps or stale material.

## Output format

```markdown
## Archive Result
[What was found or stored]

## Relevant Material
- [path]: [why it matters]

## Connections
- [pattern or link across materials]

QUALITY SCORES:
- Coverage: X.XX
- Connections: X.XX
- Relevance: X.XX
OVERALL: X.XX
```

