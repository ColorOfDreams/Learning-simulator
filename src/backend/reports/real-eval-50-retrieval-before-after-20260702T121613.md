# Real Eval 50 Retrieval Before/After

- Run time: 2026-07-02T12:16:13.146Z
- Before snapshot: `reports/real-eval-50/20260702T035833`
- After snapshot: `reports/real-eval-50/20260702T121426`
- Scope: retrieval/rerank only; answer metrics are intentionally excluded.

## Overall

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.3600 | 0.4000 | +0.0400 |
| Hit@3 | 0.6600 | 0.7000 | +0.0400 |
| Hit@5 | 0.8400 | 0.9400 | +0.1000 |
| Recall@5 | 0.8300 | 0.9300 | +0.1000 |
| MRR | 0.5462 | 0.5898 | +0.0436 |

## By Subject

| Group | Cases | Hit@1 | Hit@3 | Hit@5 | Recall@5 | MRR |
| --- | ---: | --- | --- | --- | --- | --- |
| chemistry | 15 | 0.3333 -> 0.3333 (+0.0000) | 0.6667 -> 0.6667 (+0.0000) | 0.9333 -> 0.9333 (+0.0000) | 0.9333 -> 0.9333 (+0.0000) | 0.5428 -> 0.5428 (+0.0000) |
| math | 10 | 0.3000 -> 0.4000 (+0.1000) | 0.3000 -> 0.6000 (+0.3000) | 0.4000 -> 0.9000 (+0.5000) | 0.4000 -> 0.9000 (+0.5000) | 0.3721 -> 0.5483 (+0.1763) |
| physics | 25 | 0.4000 -> 0.4400 (+0.0400) | 0.8000 -> 0.7600 (-0.0400) | 0.9600 -> 0.9600 (+0.0000) | 0.9400 -> 0.9400 (+0.0000) | 0.6180 -> 0.6347 (+0.0167) |

## By Question Type

| Group | Cases | Hit@1 | Hit@3 | Hit@5 | Recall@5 | MRR |
| --- | ---: | --- | --- | --- | --- | --- |
| calculation | 9 | 0.4444 -> 0.5556 (+0.1111) | 0.7778 -> 0.8889 (+0.1111) | 0.8889 -> 1.0000 (+0.1111) | 0.8333 -> 0.9444 (+0.1111) | 0.6389 -> 0.7315 (+0.0926) |
| comparison | 6 | 0.6667 -> 0.6667 (+0.0000) | 0.6667 -> 0.6667 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 0.7417 -> 0.7417 (+0.0000) |
| concept | 9 | 0.4444 -> 0.4444 (+0.0000) | 0.5556 -> 0.5556 (+0.0000) | 0.7778 -> 0.8889 (+0.1111) | 0.7778 -> 0.8889 (+0.1111) | 0.5454 -> 0.5731 (+0.0278) |
| cross-topic-noise | 4 | 0.0000 -> 0.2500 (+0.2500) | 0.5000 -> 0.7500 (+0.2500) | 1.0000 -> 1.0000 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 0.3500 -> 0.5500 (+0.2000) |
| definition | 7 | 0.4286 -> 0.4286 (+0.0000) | 0.8571 -> 0.8571 (+0.0000) | 0.8571 -> 1.0000 (+0.1429) | 0.8571 -> 1.0000 (+0.1429) | 0.6395 -> 0.6476 (+0.0082) |
| formula | 12 | 0.1667 -> 0.1667 (+0.0000) | 0.5000 -> 0.5000 (+0.0000) | 0.6667 -> 0.8333 (+0.1667) | 0.6667 -> 0.8333 (+0.1667) | 0.3745 -> 0.3944 (+0.0199) |
| phenomenon/experiment | 3 | 0.3333 -> 0.3333 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 1.0000 -> 1.0000 (+0.0000) | 0.6111 -> 0.6111 (+0.0000) |

## Hit@5 Movement

- Fixed Hit@5 misses: REAL_EVAL50_MATH_002, REAL_EVAL50_MATH_004, REAL_EVAL50_MATH_008, REAL_EVAL50_MATH_009, REAL_EVAL50_MATH_010
- New Hit@5 regressions: none

## Worst Cases Still Failing

| Case | Subject | Grade | Type | RR | Expected | Retrieved top5 |
| --- | --- | ---: | --- | ---: | --- | --- |
| REAL_EVAL50_MATH_007 | math | 10 | formula | 0.0000 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S018_P01 | GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S012_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S016_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S013_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S010_P01, GENCLN_MATH_G10_sgktoan10_tap1_chuong2_bai4_sgktoan10_tap1_5a72087c_S015_P01 |
| REAL_EVAL50_CHEM_013 | chemistry | 11 | concept | 0.1250 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S003_P01 | GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S001_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S017_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S005_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S018_P01, GENCLN_CHEM_G11_sgkhoahoc11_chuong6_bai24_sgkhoahoc11_e642343b_S022_P01 |
| REAL_EVAL_PHY11_SHM_EQUATION_001 | physics | 11 | formula | 0.1667 | TH_PHY11_C01_L01_006 | th_shm_002, TH_PHY11_C01_L01_017, TH_PHY11_C01_L02_008, TH_PHY11_C01_L04_003, TH_PHY11_C01_L02_005 |
