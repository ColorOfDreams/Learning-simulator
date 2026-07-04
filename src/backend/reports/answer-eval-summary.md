# AI/RAG Answer Evaluation Summary

- Run time: 2026-07-04T05:09:52.569Z
- Source: file
- AI method: analyze
- LLM answer enabled: false
- LLM answer configured: true
- LLM judge enabled: false
- LLM judge configured: true
- LLM base URL: https://api.openai.com/v1
- LLM model: gpt-4o-mini
- Judge base URL: https://api.openai.com/v1
- Judge model: gpt-4o-mini
- Model: N/A
- Avg latency: N/A ms
- Answer judge enabled: false

> WARNING: Answer evaluation is not running full LLM chat generation. Metrics may reflect local/analyze fallback.

## Cases

- Total: 90
- Evaluated: 90
- Skipped: 0
- Failed: 0
- Numeric cases: 0
- Conceptual cases: 88
- Mixed cases: 2

## Metrics

| Metric | Value |
| --- | ---: |
| Numeric accuracy | N/A |
| Avg concept coverage | 0.3994 |
| Avg rule-based score | 0.3994 |
| Avg correctness | N/A |
| Avg groundedness | N/A |
| Avg completeness | N/A |
| Avg clarity | N/A |
| Avg citation usage | N/A |
| Avg final answer score | N/A |
| Hallucination rate | N/A |

## Metrics By Subject

| Group | Total | Evaluated | Skipped | Numeric | Conceptual | Mixed | Numeric Accuracy | Concept Coverage | Rule Score | Final Score | Hallucination Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| chemistry | 30 | 30 | 0 | 0 | 29 | 1 | N/A | 0.1933 | 0.1933 | N/A | N/A |
| math | 30 | 30 | 0 | 0 | 30 | 0 | N/A | 0.7667 | 0.7667 | N/A | N/A |
| physics | 30 | 30 | 0 | 0 | 29 | 1 | N/A | 0.2383 | 0.2383 | N/A | N/A |

## Metrics By Question Type

| Group | Total | Evaluated | Skipped | Numeric | Conceptual | Mixed | Numeric Accuracy | Concept Coverage | Rule Score | Final Score | Hallucination Rate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| calculation-lite | 2 | 2 | 0 | 0 | 0 | 2 | N/A | 0.3000 | 0.3000 | N/A | N/A |
| comparison | 6 | 6 | 0 | 0 | 6 | 0 | N/A | 0.3667 | 0.3667 | N/A | N/A |
| concept | 9 | 9 | 0 | 0 | 9 | 0 | N/A | 0.3667 | 0.3667 | N/A | N/A |
| definition | 52 | 52 | 0 | 0 | 52 | 0 | N/A | 0.4808 | 0.4808 | N/A | N/A |
| formula | 8 | 8 | 0 | 0 | 8 | 0 | N/A | 0.2250 | 0.2250 | N/A | N/A |
| method | 4 | 4 | 0 | 0 | 4 | 0 | N/A | 0.1000 | 0.1000 | N/A | N/A |
| phenomenon/experiment | 9 | 9 | 0 | 0 | 9 | 0 | N/A | 0.2944 | 0.2944 | N/A | N/A |

## Skip Reasons

No skipped cases.

## Error Analysis

| Error Type | Count | Suggested Fix |
| --- | ---: | --- |
| missing_required_concepts | 90 | Improve answer generation or required concept coverage |

## Top 10 Weak Or Failed Cases

| Case ID | Question | Score | Reason |
| --- | --- | ---: | --- |
| RAG90_PHYSICS_001 | Trong Vật lí, hãy nêu khái niệm hoặc định nghĩa chính liên quan đến 3.1. Vật lí là cơ sở của khoa học tự nhiên. | 0.2000 | Low concept coverage |
| RAG90_PHYSICS_003 | Nêu phương pháp cơ bản để xử lí dạng câu hỏi về Bài 1: Cấu trúc của chất. Sự chuyển thể. | 0.4000 | Low concept coverage |
| RAG90_PHYSICS_004 | Ý chính cần nhớ về Hình 2.1 là gì? | 0.2000 | Low concept coverage |
| RAG90_PHYSICS_005 | Cần phân biệt hoặc so sánh điểm nào khi học 1. Nguyên nhân gây ra điện trở trong vật dẫn kim loại, đặc biệt với khái niệm điện trở? | 0.4000 | Low concept coverage |
| RAG90_PHYSICS_006 | Trong Vật lí, hãy nêu khái niệm hoặc định nghĩa chính liên quan đến 10. Em có thể. | 0.2000 | Low concept coverage |
| RAG90_PHYSICS_007 | Hiện tượng hoặc thí nghiệm liên quan đến Câu hỏi được giải thích bằng ý chính nào? | 0.2000 | Low concept coverage |
| RAG90_PHYSICS_008 | Trong Vật lí, hãy nêu khái niệm hoặc định nghĩa chính liên quan đến 3. Suất điện động của nguồn điện. | 0.6000 | Low concept coverage |
| RAG90_PHYSICS_009 | Công thức hoặc tính chất quan trọng của Hình 3.1 là gì? | 0.0000 | Low concept coverage |
| RAG90_PHYSICS_010 | Trong Vật lí, hãy nêu khái niệm hoặc định nghĩa chính liên quan đến Nội dung. | 0.2000 | Low concept coverage |
| RAG90_PHYSICS_011 | Ý chính cần nhớ về Em có thể là gì? | 0.5000 | Low concept coverage |

