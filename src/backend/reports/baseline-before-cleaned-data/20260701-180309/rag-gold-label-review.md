# RAG Gold Label Review

- Eval source: smoke
- Retrieval config: vectorCandidates=30, keywordCandidates=30, finalTopK=5
- Ranking config: vector=0.65, keyword=0.25, field-aware boost=0.10
- Scope: RAG_SMOKE_002, 003, 004, 012, 015, 016

## Summary

| Category | Count | Cases |
| --- | ---: | --- |
| Gold label missing | 4 | RAG_SMOKE_002, RAG_SMOKE_003, RAG_SMOKE_015, RAG_SMOKE_016 |
| True retrieval miss before fix | 1 | RAG_SMOKE_004 |
| True retrieval miss after fix | 0 | - |
| Expected chunk not ideal | 0 | - |
| Rank low but correct | 3 | RAG_SMOKE_004, RAG_SMOKE_012, RAG_SMOKE_015 |

## Changes Made

### Gold Label Updates

| Case ID | Added gold chunk | Evidence |
| --- | --- | --- |
| RAG_SMOKE_002 | th_shm_002 | Text directly states x = A cos(ωt + φ), with A as amplitude, ω as angular frequency, and φ as initial phase. |
| RAG_SMOKE_003 | th_shm_002 | Same chunk directly answers what A, omega, and phi mean in the equation. |
| RAG_SMOKE_015 | TH_PHY11_C01_L05_013 | Text gives spring oscillator potential energy Wt = 1/2 kx^2 and links it to Wt = 1/2 mω²x². |
| RAG_SMOKE_016 | th_shm_004 | Text gives mechanical energy of a spring oscillator W = 1/2 kA², equivalent to the SHM energy expression for spring motion. |

No gold label was added for `TH_PHY11_C01_L07_004`: it is related to potential/kinetic energy, but it is a pendulum/application chunk and not direct enough for the general SHM potential-energy question.

### Metadata / Ranking Updates

`TH_PHY11_C01_L02_003` was reviewed for RAG_SMOKE_004.

Observed content:

- Title: `Các đại lượng đặc trưng`
- Text includes: `Biên độ: (A) là độ dịch chuyển cực đại của vật tính từ vị trí cân bằng.`
- Keywords already included `li độ`, `biên độ`, `A`, `x`, but metadata had empty `conceptKeys` and `formulaKeys`.

Metadata/keywords added through migration:

- Keywords: `biên độ`, `A`, `li độ cực đại`, `độ lệch cực đại`, `vị trí cân bằng`, `độ dịch chuyển cực đại`
- Metadata concept keys: `amplitude`, `displacement`, `period`, `frequency`, `angular_frequency`
- Metadata formula symbols: `A`, `x`, `T`, `f`, `omega`
- Retrieval hints for the definition of amplitude

Reranking was upgraded to field-aware diagnostics:

- `conceptBoost`
- `titleBoost`
- `metadataBoost`
- `formulaBoost`
- `textBoost`
- `topicBoost`
- `finalScore`

## Case Review

### RAG_SMOKE_002

Question: Phương trình dao động điều hòa x = A cos(omega t + phi) có ý nghĩa như thế nào?

Classification: gold label missing.

Expected before:

- `TH_PHY11_C01_L01_006`

Retrieved relevant chunk:

- `th_shm_002`: directly explains x = A cos(ωt + φ), A, ω, φ.

Decision:

- Added `th_shm_002` to `expected.relevant_chunk_ids`.

Final result:

- Hit@1: 1
- Recall@5: 0.5000
- First relevant rank: 1

### RAG_SMOKE_003

Question: Trong phương trình x = A cos(omega t + phi), A, omega và phi là các đại lượng gì?

Classification: gold label missing.

Expected before:

- `TH_PHY11_C01_L01_006`
- `TH_PHY11_C01_L02_003`

Retrieved relevant chunk:

- `th_shm_002`: directly states A is amplitude, ω is angular frequency, φ is initial phase.

Decision:

- Added `th_shm_002` to `expected.relevant_chunk_ids`.

Final result:

- Hit@1: 1
- Recall@5: 0.3333
- First relevant rank: 1

### RAG_SMOKE_004

Question: Biên độ dao động điều hòa được định nghĩa như thế nào?

Classification before fix: true retrieval miss.

Expected:

- `TH_PHY11_C01_L02_003`

Expected chunk evidence:

- `TH_PHY11_C01_L02_003` says: Biên độ (A) là độ dịch chuyển cực đại của vật tính từ vị trí cân bằng.

Action:

- Added amplitude-specific metadata/keywords to `TH_PHY11_C01_L02_003`.
- Adjusted field-aware boosts so metadata/text-definition matches are more discriminative than broad formula-symbol matches.

Final result:

- Retrieved top 5 includes `TH_PHY11_C01_L02_003`.
- Hit@5: 1
- Recall@5: 1
- First relevant rank: 4

Remaining note:

- This is now rank-low but correct, not a Top-5 miss.

### RAG_SMOKE_012

Question: Con lắc lò xo có chu kì dao động phụ thuộc vào khối lượng và độ cứng như thế nào?

Classification: rank low but correct.

Expected:

- `TH_PHY11_C01_L05_013`

Expected chunk evidence:

- `TH_PHY11_C01_L05_013` gives ω = sqrt(k/m) and T = 2πsqrt(m/k).

Decision:

- No gold label change. Existing expected chunk is good.

Final result:

- Hit@5: 1
- Recall@5: 1
- First relevant rank: 3

### RAG_SMOKE_015

Question: Thế năng của vật dao động điều hòa được tính theo li độ x bằng công thức nào?

Classification: gold label missing and rank low but correct.

Expected before:

- `TH_PHY11_C01_L05_004`
- `TH_PHY11_C01_L05_025`

Retrieved relevant chunk:

- `TH_PHY11_C01_L05_013`: gives Wt = 1/2 kx^2 for spring oscillator potential energy and connects it to Wt = 1/2 mω²x².

Decision:

- Added `TH_PHY11_C01_L05_013` to `expected.relevant_chunk_ids`.
- Did not add `TH_PHY11_C01_L07_004` because it is less direct and application-specific.

Final result:

- Hit@5: 1
- Recall@5: 0.6667
- First relevant rank: 2

### RAG_SMOKE_016

Question: Cơ năng trong dao động điều hòa có biểu thức và tính chất bảo toàn như thế nào?

Classification: gold label missing.

Expected before:

- `TH_PHY11_C01_L05_008`
- `TH_PHY11_C01_L05_025`

Retrieved relevant chunk:

- `th_shm_004`: gives W = 1/2 kA² for spring oscillator mechanical energy.

Decision:

- Added `th_shm_004` to `expected.relevant_chunk_ids`.

Final result:

- Hit@1: 1
- Recall@5: 0.6667
- First relevant rank: 1

## Final Metrics

| Metric | Before this pass | After this pass |
| --- | ---: | ---: |
| Hit@1 | 0.5556 | 0.6667 |
| Hit@3 | 0.7222 | 0.9444 |
| Hit@5 | 0.8889 | 1.0000 |
| Recall@5 | 0.8333 | 0.8981 |
| Precision@5 | 0.2222 | 0.2667 |
| MRR | 0.6537 | 0.7917 |

## Remaining Weaknesses

No case has Hit@5 = 0 after this pass.

Cases with partial Recall@5 remain:

- `RAG_SMOKE_002`: only `th_shm_002` is in Top-5; `TH_PHY11_C01_L01_006` is still just below Top-5 in some runs.
- `RAG_SMOKE_003`: `th_shm_002` is in Top-5; SGK expected chunks remain below Top-5.
- `RAG_SMOKE_015`: `TH_PHY11_C01_L05_013` and `TH_PHY11_C01_L05_025` are in Top-5; `TH_PHY11_C01_L05_004` remains below Top-5.
- `RAG_SMOKE_016`: `TH_PHY11_C01_L05_008` and `th_shm_004` are in Top-5; `TH_PHY11_C01_L05_025` remains below Top-5.
