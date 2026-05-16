---
name: newtype-extract
description: Use to extract clean, structured content from PDFs, images, documents, screenshots, web pages, tables, and other source material.
---

# Newtype Extract

Use this skill when the user needs content extracted or converted into clean Markdown or structured data.

If custom agents are installed, delegate substantial extraction to `newtype_extractor`.

## Extraction rules

- Preserve source structure: headings, lists, tables, captions, footnotes.
- Mark uncertain text as `[unclear: ...]`.
- Do not interpret beyond what is present unless asked.
- Include metadata such as source path, page range, URL, or image name when available.

## Output format

```markdown
# Extracted from: [source]
Type: [pdf|image|document|web|other]
Extraction quality: High | Medium | Low

[Clean extracted content]

## Extraction Notes
- [Uncertainties, omissions, or layout issues]

QUALITY SCORES:
- Accuracy: X.XX
- Completeness: X.XX
- Format: X.XX
OVERALL: X.XX
WEAKEST: [only if any score < 0.70]
```

