# LearningSimulator RAG Pipeline Handoff

Updated: 2026-07-04

Scope: RAG data pipeline, benchmark data, retrieval metrics, and handoff notes only. This document does not change or describe ownership of the frontend/backend application outside the RAG integration surface.

## Current State

LearningSimulator currently has a preview RAG dataset for three subjects:

| Subject | Preview chunks | Notes |
| --- | ---: | --- |
| Physics | 2514 | Cleaned textbook-derived chunks across grades 10-12. |
| Chemistry | 1538 | Cleaned textbook-derived chunks across grades 10-12. |
| Math | 582 | Mixed source: 163 cleaned chunks plus 419 synthetic curriculum-summary chunks. |

The active preview dataset is:

```text
data/structured/generated/all-in-one.with-cleaned-and-math-synthetic-preview.learning-data.json
```

This is a preview dataset. Do not promote it to production automatically.

## Important Guardrails

- Do not overwrite the canonical production all-in-one dataset automatically.
- Do not seed production from preview files.
- Do not tune retriever parameters while benchmark gold labels are still under review.
- Do not change embedding model or chunking only to improve benchmark score.
- Do not treat synthetic Math chunks as final textbook-quality data.
- Do not invent textbook content. If source text is missing, mark it for review.
- Full OCR for Math PDFs has not been run because the PDFs are scan/image-heavy and CPU OCR is too slow.

## Data Pipeline

The RAG data pipeline is organized around generated preview artifacts under `data/structured/generated/`.

Important generated files:

| File | Purpose |
| --- | --- |
| `from-cleaned.learning-data.json` | Structured chunks produced from cleaned Physics/Chemistry/Math markdown sources. |
| `from-math-pdf.learning-data.json` | Limited Math PDF extraction preview. The scan-heavy PDFs did not produce enough usable text. |
| `from-math-synthetic-curriculum.learning-data.json` | Synthetic Math curriculum-summary chunks used only as preview fallback. |
| `all-in-one.with-cleaned-preview.learning-data.json` | Base preview merged with cleaned chunks. |
| `all-in-one.with-cleaned-and-math-synthetic-preview.learning-data.json` | Current broad preview dataset used for RAG eval and dev embedding. |

Useful source reports:

| File | Purpose |
| --- | --- |
| `data/math_html_source_report.md` | HTML/Opera source usability inspection for Math text. |
| `data/cleaned_math_pdf_report.md` | Direct Math PDF extraction report. |
| `data/cleaned_math_pdf_llm_report.md` | LLM-assisted Math PDF cleaning report, if present. |
| `data/structured/generated/from-cleaned.report.md` | Cleaned source conversion summary. |
| `data/structured/generated/from-math-synthetic-curriculum.report.md` | Synthetic Math curriculum generation summary. |

## Current Benchmark Files

| File | Status |
| --- | --- |
| `data/eval/rag-eval-90.preview.json` | Current 90-case preview benchmark. Known to be biased toward Math synthetic curriculum format. |
| `data/eval/rag-eval-90.reviewed-auto-safe.json` | Same benchmark after 2 safe additional gold labels. Not final. |
| `data/eval/real-eval-50.preview.json` | Older benchmark whose Physics/Chemistry format performed well. Used as style reference. |
| `data/eval/rag-eval-90.normalized-phys-chem-style.candidate.json` | New candidate where Math follows the older Physics/Chemistry-native benchmark style. Needs human review. |

## Benchmark Finding

The current `rag-eval-90.preview.json` is not a fair cross-subject benchmark:

- Math cases are mostly aligned with synthetic curriculum-summary chunks.
- Physics and Chemistry cases use a different style and have more gold/source-alignment issues.
- Math reaches perfect Hit@5, while Physics/Chemistry look much weaker.

The older `real-eval-50.preview.json` uses a stronger Physics/Chemistry-native style:

- Direct, source-anchored questions.
- Balanced question types: definition, concept, formula, calculation, comparison, phenomenon/experiment, and cross-topic-noise.
- Usually one exact gold chunk per case.
- Questions are answerable from the expected chunk without requiring broad surrounding context.

The normalized candidate adapts Math to that older Physics/Chemistry style instead of adapting Physics/Chemistry to the synthetic Math style.

## Dev Embedding State

Dev DB embedding health from the latest snapshot:

| Metric | Value |
| --- | ---: |
| Dev DB theory chunks | 4644 |
| Embedded theory chunks | 4644 |
| Missing embeddings | 0 |
| Chunks marked `needs_review` | 3984 |

There are stale dev DB rows from previous preview seeds because preview seed upserts but does not delete old rows. Latest diagnostics found no stale retrieved top10 rows affecting the benchmark run.

## How To Run RAG Evaluation

Run from:

```text
C2-App-107/src/backend
```

Use a selected eval file:

```powershell
$env:EVAL_CASES_PATH='D:\LearnSimulator\data\eval\rag-eval-90.normalized-phys-chem-style.candidate.json'
$env:EVAL_TOP_K='10'
npm run eval:rag
```

For answer evaluation:

```powershell
$env:EVAL_CASES_PATH='D:\LearnSimulator\data\eval\rag-eval-90.reviewed-auto-safe.json'
npm run eval:answer
```

Expected environment variables for embeddings:

```text
EMBEDDING_API_KEY
EMBEDDING_BASE_URL
EMBEDDING_MODEL
EMBEDDING_DIMENSION
```

Do not change these values while comparing benchmark quality unless the goal is explicitly an embedding migration.

## How To Use This In Another Backend

The RAG backend integration should follow this shape:

1. Store theory chunks with stable IDs, subject, grade, chapter, lesson, source metadata, text, validation status, embedding metadata, and content hash.
2. Embed only chunks that are missing embeddings or whose content hash changed.
3. At query time, filter by subject/grade when available.
4. Retrieve top-k by vector similarity.
5. Optionally rerank with keyword/source signals.
6. Return citations using stable chunk IDs and source metadata.
7. Treat chunks marked `needs_review` as usable for preview retrieval, but not as final verified content.

Minimum chunk fields:

```json
{
  "id": "stable_chunk_id",
  "subject": "physics",
  "grade": 11,
  "chapter": "Chapter name",
  "lesson": "Lesson name",
  "section": "Optional section",
  "text": "Chunk text",
  "sourceFile": "source path",
  "sourceType": "textbook",
  "validationStatus": "needs_review"
}
```

Minimum retrieval response:

```json
{
  "query": "student question",
  "results": [
    {
      "chunkId": "stable_chunk_id",
      "subject": "physics",
      "score": 0.82,
      "title": "Lesson or section title",
      "snippet": "Short excerpt for citation"
    }
  ]
}
```

## How To Use This In A Frontend

The frontend should not depend on internal benchmark files. It only needs:

- A chat/analyze endpoint that accepts the student question and optional subject/grade.
- A returned answer with citations.
- A list of retrieved chunks or references.
- Optional simulation metadata if the backend maps the question to a simulation.

Recommended UI behavior:

- Show the answer first.
- Show cited textbook/reference chunks below the answer.
- Show a warning or review badge when the source chunk is `needs_review`.
- Keep Math preview labels clear because some Math chunks are synthetic curriculum summaries.

## Recommended Next Steps

1. Human-review the normalized candidate benchmark before making it final.
2. Prioritize Physics/Chemistry cases with large score jumps between current and normalized benchmarks.
3. Replace synthetic Math chunks with real cleaned/OCR text when controlled OCR batches are available.
4. Keep benchmark normalization separate from retriever tuning.
5. After benchmark review, rerun top10 retrieval and answer eval on the accepted candidate.
6. Only then consider retriever tuning.

## Do Not Promote Yet

The normalized benchmark candidate is useful, but it is not final. It still has 90 cases marked for human review. The score jump is evidence that benchmark style matters, not proof that the RAG system is production-ready.
