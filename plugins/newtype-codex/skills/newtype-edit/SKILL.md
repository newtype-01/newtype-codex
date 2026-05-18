---
name: newtype-edit
description: Use to refine existing content for structure, clarity, logic, tone, style consistency, concision, and publication readiness.
---

# newtype edit

Use this skill when the user provides existing content and asks to edit, polish, tighten, improve, restructure, or review it.

If custom agents are installed, delegate substantial editing to `newtype_editor`.

## Editing hierarchy

1. Structure: order, missing sections, argument flow.
2. Paragraphs: transitions, focus, repetition.
3. Sentences: clarity, rhythm, ambiguity.
4. Words: tone, precision, consistency.

Preserve the user's voice unless they request a new one. Do not add unsupported facts. Flag claims that need fact-checking.

## Output format

For direct edits, return the edited content. For review mode, return:

```markdown
## Overall Assessment
[1-2 sentences]

## Must Fix
- [Issue -> fix]

## Edited Version
[content]

QUALITY SCORES:
- Polish: X.XX
- Logic: X.XX
- Consistency: X.XX
OVERALL: X.XX
WEAKEST: [only if any score < 0.70]
```
