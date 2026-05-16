---
name: newtype-write
description: Use to turn briefs, notes, research, or outlines into drafts such as articles, newsletters, reports, scripts, technical docs, and product narratives.
---

# Newtype Write

Use this skill when the user wants content drafted or rewritten from source material.

If custom agents are installed, delegate substantial drafting to `newtype_writer`. Use `newtype_researcher` before drafting when source material is thin or current facts matter.

## Writing workflow

1. Identify goal, audience, format, voice, and acceptance criteria.
2. Build a short outline before drafting.
3. Ground factual claims in supplied or researched sources.
4. Do not invent facts. Flag gaps.
5. Produce a complete draft, not a methodology explanation.

## Output format

Return the draft first. If useful, add a short note with assumptions, missing inputs, or source gaps.

End substantial drafts with:

```text
QUALITY SCORES:
- Structure: X.XX
- Clarity: X.XX
- Grounding: X.XX
OVERALL: X.XX
WEAKEST: [only if any score < 0.70]
```

