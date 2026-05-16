---
name: newtype-research
description: Use for external research, source discovery, trend analysis, competitive intelligence, and gathering current information before writing or analysis.
---

# Newtype Research

Use this skill when the task needs external information, source discovery, trend research, market or competitor analysis, or current facts.

If custom agents are installed, delegate substantial research to `newtype_researcher`. For important claims, follow with `newtype_fact_checker`.

## Research workflow

1. Define the research question and what would change the final answer.
2. Search broadly first, then drill into the strongest sources.
3. Prefer primary sources, official data, original papers, documentation, and direct statements.
4. Cross-check important facts across independent sources.
5. Separate facts, interpretation, and speculation.

## Output format

```markdown
## Executive Summary
[2-3 sentences]

## Key Findings
- [Finding with source/date/credibility note]

## Sources
| Source | Type | Date | Credibility | Use |
| --- | --- | --- | --- | --- |

## Gaps
- [What could not be verified or needs deeper work]

QUALITY SCORES:
- Coverage: X.XX
- Sources: X.XX
- Relevance: X.XX
OVERALL: X.XX
WEAKEST: [only if any score < 0.70]
```

