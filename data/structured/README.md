# Physics 11 Structured Dataset MVP

Generated from 26 clean Markdown files uploaded by the user.

## Counts

- TheoryChunk: 670
- ProblemPattern: 24
- LearningItem: 128
- AiTestCase: 125
- SimulationTemplate: 19
- MediaAsset: 122

## Intended use

This is an MVP/silver-style working dataset for:

- RAG retrieval
- problem pattern matching
- simulation mapping
- initial AI module testing

It is not a fully verified gold dataset.

## Validation status

- `ai_generated`: usable for MVP/RAG, not human verified.
- `needs_review`: depends on image/table/unclear source or missing data.
- `draft`: draft eval case.
- `solver_verified_draft`: formula-based draft case, still recommended for review before official gold.

## Recommended seed order

1. simulation-templates.json
2. problem-patterns.json
3. theory-chunks.json
4. learning-items.json
5. ai-test-cases.json
6. media-assets.json
7. build embeddings for theory chunks

## Recommended next step

Run schema/reference validator before seeding.
Then create 30-50 human-verified gold eval cases.
