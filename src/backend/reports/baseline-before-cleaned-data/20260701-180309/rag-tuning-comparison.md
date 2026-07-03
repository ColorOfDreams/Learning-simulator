# RAG Tuning Comparison

- Run source: smoke
- Candidate pool: vectorCandidates=30, keywordCandidates=30, finalTopK=5
- Selection rule: highest Hit@5, then higher MRR, then higher Recall@5

## Before Tuning

| Metric | Value |
| --- | ---: |
| Hit@1 | 0.1667 |
| Hit@3 | 0.5000 |
| Hit@5 | 0.6667 |
| Recall@5 | 0.6389 |
| Precision@5 | 0.1778 |
| MRR | 0.3537 |

## Config Results

| Config | Vector weight | Keyword weight | Concept boost | Hit@1 | Hit@3 | Hit@5 | Recall@5 | Precision@5 | MRR | Result |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| A | 0.85 | 0.15 | 0.00 | 0.4444 | 0.6111 | 0.8333 | 0.7778 | 0.2111 | 0.5648 | Pass |
| B | 0.75 | 0.25 | 0.00 | 0.5000 | 0.6667 | 0.8333 | 0.7778 | 0.2111 | 0.6037 | Pass |
| C | 0.65 | 0.25 | 0.10 | 0.5556 | 0.7222 | 0.8889 | 0.8333 | 0.2222 | 0.6537 | Best |
| D | 0.55 | 0.35 | 0.10 | 0.5556 | 0.7222 | 0.8333 | 0.8056 | 0.2111 | 0.6426 | Pass |
| E | 0.50 | 0.40 | 0.10 | 0.5556 | 0.7222 | 0.8333 | 0.7778 | 0.2000 | 0.6426 | Pass |

## Selected Default

Config C is selected.

| Setting | Value |
| --- | ---: |
| RAG_VECTOR_CANDIDATES | 30 |
| RAG_KEYWORD_CANDIDATES | 30 |
| RAG_FINAL_TOP_K | 5 |
| RAG_VECTOR_WEIGHT | 0.65 |
| RAG_KEYWORD_WEIGHT | 0.25 |
| RAG_CONCEPT_BOOST_WEIGHT | 0.10 |

## Remaining Weak Cases

| Case ID | Status | Expected IDs | Retrieved IDs | Note |
| --- | --- | --- | --- | --- |
| RAG_SMOKE_003 | Hit@5 fail | TH_PHY11_C01_L01_006, TH_PHY11_C01_L02_003 | th_shm_002, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_008, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_005 | Top result th_shm_002 is a relevant synthetic equation chunk, so gold labels may be incomplete. |
| RAG_SMOKE_004 | Hit@5 fail | TH_PHY11_C01_L02_003 | TH_PHY11_C01_L04_021, TH_PHY11_C01_L02_030, TH_PHY11_C01_L02_023, TH_PHY11_C01_L02_025, TH_PHY11_C01_L02_005 | Still a true retrieval miss for the expected amplitude-definition chunk. |
| RAG_SMOKE_015 | Low Recall@5 | TH_PHY11_C01_L05_004, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_002, TH_PHY11_C01_L05_013, TH_PHY11_C01_L07_004, TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L07_004 is likely relevant to potential/kinetic energy calculation, so gold labels may be incomplete. |
| RAG_SMOKE_016 | Low Recall@5 | TH_PHY11_C01_L05_008, TH_PHY11_C01_L05_025 | TH_PHY11_C01_L05_008, th_shm_004, TH_PHY11_C01_L07_008, TH_PHY11_C01_L05_002, TH_PHY11_C01_L07_001 | th_shm_004 is a relevant mechanical-energy chunk, so gold labels may be incomplete. |
