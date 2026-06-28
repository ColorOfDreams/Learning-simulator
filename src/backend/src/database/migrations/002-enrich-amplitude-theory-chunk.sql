UPDATE theory_chunks
SET
  keywords = (
    SELECT jsonb_agg(DISTINCT keyword)
    FROM jsonb_array_elements_text(
      keywords ||
      '[
        "biên độ",
        "A",
        "li độ cực đại",
        "độ lệch cực đại",
        "vị trí cân bằng",
        "độ dịch chuyển cực đại"
      ]'::jsonb
    ) AS keyword
  ),
  metadata = COALESCE(metadata, '{}'::jsonb) ||
    '{
      "conceptKeys": [
        "amplitude",
        "displacement",
        "period",
        "frequency",
        "angular_frequency"
      ],
      "formula_symbols": ["A", "x", "T", "f", "omega"],
      "retrievalHints": [
        "biên độ là độ dịch chuyển cực đại tính từ vị trí cân bằng",
        "A là biên độ",
        "li độ cực đại",
        "độ lệch cực đại"
      ]
    }'::jsonb
WHERE id = 'TH_PHY11_C01_L02_003';
