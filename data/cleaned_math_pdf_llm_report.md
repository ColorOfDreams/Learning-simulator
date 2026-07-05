# Math Extracted Text Cleanup Report

- LLM enabled: False
- Model: `gpt-4o-mini`
- Base URL: `https://api.openai.com/v1`
- Files processed: 6

| File | Mode | Chunks | Characters | Review markers | Output |
| --- | --- | ---: | ---: | ---: | --- |
| `sach_giao_khoa_toan_10_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 9167 | 106 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_10_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` |
| `sach_giao_khoa_toan_10_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 8827 | 102 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_10_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` |
| `sach_giao_khoa_toan_11_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 11462 | 133 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_11_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` |
| `sach_giao_khoa_toan_11_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 9847 | 114 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_11_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` |
| `sach_giao_khoa_toan_12_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 8912 | 103 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_12_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` |
| `sach_giao_khoa_toan_12_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | `copied_raw_no_llm` | 1 | 8488 | 98 | `data/cleaned_math_pdf_llm/sach_giao_khoa_toan_12_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` |

## Guardrails

- Cleanup is source-faithful and keeps page markers.
- If LLM cleanup fails, the raw text is retained and marked for review.
- Use `--copy-only` for the fastest preview path.
