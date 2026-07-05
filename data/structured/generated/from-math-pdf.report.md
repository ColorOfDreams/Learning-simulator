# Math PDF Structured Conversion Report

- Input directory: `data/cleaned_math_pdf_llm`
- Output dataset: `data/structured/generated/from-math-pdf.learning-data.json`
- Original structured datasets were not overwritten.
- Files scanned: 6
- Generated theoryChunks: 6
- Skipped sections: 662
- Duplicate ids resolved: 0
- Validation errors: 0

## Files

| File | Grade | Volume | Sections | Chunks |
| --- | ---: | ---: | ---: | ---: |
| `sach_giao_khoa_toan_10_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | 10 | 1 | 108 | 1 |
| `sach_giao_khoa_toan_10_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | 10 | 2 | 104 | 1 |
| `sach_giao_khoa_toan_11_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | 11 | 1 | 135 | 1 |
| `sach_giao_khoa_toan_11_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | 11 | 2 | 116 | 1 |
| `sach_giao_khoa_toan_12_tap_1_ket_noi_tri_thuc_voi_cuoc_song.md` | 12 | 1 | 105 | 1 |
| `sach_giao_khoa_toan_12_tap_2_ket_noi_tri_thuc_voi_cuoc_song.md` | 12 | 2 | 100 | 1 |

## Grade Distribution

| Grade | Chunks |
| --- | ---: |
| `10` | 2 |
| `11` | 2 |
| `12` | 2 |

## Human Review Notes

- All chunks are `needs_review`.
- Review formulas, page boundaries, and OCR/text extraction artifacts before any production promotion.
- Non-theory collections are intentionally empty.
