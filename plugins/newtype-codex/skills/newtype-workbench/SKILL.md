---
name: newtype-workbench
description: Use to choose the right Newtype skill, resume a previous task, create a task report, maintain task state, or coordinate a multi-skill workflow.
---

# Newtype Workbench

Use this skill when the next Newtype step is unclear, the user asks which skill or agent to use, or the task is continuing from earlier work.

If custom agents are installed, delegate substantial routing or progress synthesis to `newtype_workbench`.

## Workflow

1. Inspect the user's goal and current task state.
2. Decide the smallest next skill/agent that advances the task.
3. If continuing work, check `.newtype/workbench/` and relevant `.newtype/knowledge/` files.
4. Produce a compact next-step plan or task report.

## Output format

```markdown
## Recommendation
[Which Newtype skill or agent to use next, and why]

## Current State
- Goal:
- Completed:
- Open:
- Risks:

## Next Action
[One concrete next step]
```

