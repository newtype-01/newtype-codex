---
name: newtype-fact-check
description: Use to verify claims, audit source quality, check citations, identify unsupported assertions, and produce correction notes for drafts or research.
---

# newtype Fact Check

Use this skill when the user asks to verify, check, audit, validate, review sources, or confirm whether a draft or claim is accurate.

If custom agents are installed, delegate substantial verification to `newtype_fact_checker`.

## Verification workflow

1. Extract checkable claims first.
2. Rank claims by risk: numbers, dates, names, legal/medical/financial statements, quotes, and causal claims first.
3. Prefer primary and authoritative sources.
4. Mark unverifiable claims clearly instead of guessing.
5. Provide exact corrections and what source supports them.

## Output format

```markdown
## Verdict
[Overall pass/fail/needs revision]

## Claim Checks
CLAIM: [claim]
VERDICT: Verified | Partially true | False | Unverifiable
EVIDENCE: [summary]
SOURCE: [source and date]
FIX: [specific edit, if needed]

## Source Risks
- [Missing, weak, outdated, or biased source notes]

QUALITY SCORES:
- Accuracy: X.XX
- Authority: X.XX
- Completeness: X.XX
OVERALL: X.XX
WEAKEST: [only if any score < 0.70]
```

