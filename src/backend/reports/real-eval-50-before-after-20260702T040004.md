# Real Eval 50 Before/After Comparison

- Run time: 2026-07-02T04:00:04.878Z
- Before snapshot: `reports/real-eval-50/20260702T033725`
- After snapshot: `reports/real-eval-50/20260702T035833`
- After method: chat + LLM

## Retrieval

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Hit@1 | 0.3600 | 0.3600 | +0.0000 |
| Hit@3 | 0.6600 | 0.6600 | +0.0000 |
| Hit@5 | 0.8400 | 0.8400 | +0.0000 |
| Recall@5 | 0.8300 | 0.8300 | +0.0000 |
| MRR | 0.5462 | 0.5462 | +0.0000 |

## Answer

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Numeric accuracy | 0.2000 | 0.6000 | +0.4000 |
| Avg concept coverage | 0.2933 | 0.3333 | +0.0400 |
| Avg rule-based score | 0.2900 | 0.3300 | +0.0400 |
| Avg correctness | 2.7400 | 3.6400 | +0.9000 |
| Avg groundedness | 3.3400 | 3.8600 | +0.5200 |
| Avg final answer score | 2.9430 | 3.5140 | +0.5710 |
| Hallucination rate | 0.2200 | 0.0200 | -0.2000 |

## Interpretation

- Answer judge score changed by +0.5710; hallucination rate changed by -0.2000.
- The small LLM answer-layer change improved judged answer quality and reduced hallucination.
- Rule-based score remains conservative because generated preview cases use short source concepts that may not match paraphrases.
- Retrieval metrics are unchanged between before/after because the after change targets answer synthesis, not the RAG retriever.

## Still Heavy Fails After

| Case ID | Rule | Judge | Numeric | Concept | Hallucination | Reason |
| --- | ---: | ---: | --- | ---: | --- | --- |
| REAL_EVAL50_CHEM_002 | 0.0000 | 1.0500 | N/A | 0.0000 | false | Câu trả lời chỉ nêu rằng chưa đủ dữ kiện mà không cung cấp thông tin cụ thể nào về các vật liệu polymer, thành phần, nguồn gốc hay tính chất của chúng như yêu cầu trong câu hỏi. |
| REAL_EVAL50_CHEM_007 | 0.0000 | 1.0500 | N/A | 0.0000 | false | Câu trả lời không cung cấp thông tin cụ thể về công thức hoặc quan hệ chính trong mục HỆ THỐNG HOÁ KIẾN THỨC, chỉ nêu rằng chưa đủ dữ liệu. |
| REAL_EVAL50_CHEM_008 | 0.0000 | 1.0500 | N/A | 0.0000 | false | Câu trả lời không cung cấp thông tin cụ thể về khái niệm mà chỉ nói rằng chưa đủ dữ liệu, điều này không đáp ứng yêu cầu của câu hỏi. |
| REAL_EVAL50_CHEM_015 | 0.0000 | 1.0500 | N/A | 0.0000 | false | Câu trả lời không cung cấp thông tin cụ thể về khái niệm ăn mòn kim loại và không liên kết với các nội dung trong CONTEXT. |
| REAL_EVAL50_CHEM_014 | 0.0000 | 1.4000 | N/A | 0.0000 | false | Câu trả lời không cung cấp thông tin cụ thể về đại lượng cần xác định và quan hệ liên quan, mặc dù có nhắc đến việc thiếu dữ liệu. Tuy nhiên, nó không hoàn toàn sai vì có thể hiểu rằng thông tin trong CONTEXT không đủ để trả lời. |
| REAL_EVAL50_MATH_004 | 0.0000 | 1.4000 | N/A | 0.0000 | false | Câu trả lời chỉ ra rằng không đủ dữ liệu để xác định đại lượng và quan hệ, nhưng không dựa trên CONTEXT đã cung cấp, dẫn đến groundedness thấp. |
| REAL_EVAL50_CHEM_013 | 0.3333 | 2.0000 | N/A | 0.3333 | false | Câu trả lời đề cập đến các khái niệm trong hóa học hữu cơ nhưng không cụ thể về khái niệm carboxylic acid và nhóm –COOH như trong context yêu cầu. Thông tin không hoàn toàn chính xác và thiếu chi tiết cần thiết. |
| REAL_EVAL50_PHYS_007 | 0.0000 | 2.3500 | N/A | 0.0000 | false | Câu trả lời đề cập đến nội dung chính liên quan đến điện trở trong kim loại, nhưng không liên quan đến câu hỏi về nội dung chính trong mục Giải. Thông tin không phù hợp với ngữ cảnh yêu cầu. |
| REAL_EVAL50_CHEM_001 | 0.3333 | 2.4500 | N/A | 0.3333 | false | Câu trả lời đưa ra một định nghĩa về hệ thống hóa kiến thức nhưng không dựa vào CONTEXT được cung cấp, do đó groundedness thấp. Nội dung có thể đúng nhưng không hoàn toàn chính xác với yêu cầu của câu hỏi. |
| REAL_EVAL50_MATH_009 | 0.3333 | 2.5000 | N/A | 0.3333 | false | Câu trả lời đúng về mục đích của Luyện tập 1 nhưng không đề cập đến nội dung cụ thể của bài tập như trong CONTEXT. |
| REAL_EVAL50_CHEM_006 | 0.0000 | 2.9500 | N/A | 0.0000 | false | Câu trả lời đưa ra khái niệm và đặc điểm cấu tạo một cách tổng quát, nhưng không cụ thể cho protein như trong CONTEXT. Ví dụ về amino acid là hợp lý nhưng không hoàn toàn liên quan đến protein. |
| REAL_EVAL50_CHEM_009 | 0.0000 | 2.9500 | N/A | 0.0000 | true | Câu trả lời không đầy đủ và không chính xác theo ngữ cảnh, đặc biệt là phần mô phỏng dao động điều hòa không liên quan đến thí nghiệm về nhóm amine. |
| REAL_EVAL50_CHEM_004 | 0.3333 | 3.2000 | N/A | 0.3333 | false | Câu trả lời đúng về khái niệm thế điện cực chuẩn và cách xác định nó, nhưng không cung cấp thông tin cụ thể về các nguyên tố và giá trị thế điện cực chuẩn như trong yêu cầu. Một số thông tin về E° của Cu²⁺/Cu và Ag⁺/Ag là không có trong context. |
| REAL_EVAL50_MATH_002 | 0.0000 | 3.2000 | N/A | 0.0000 | false | Câu trả lời nêu đúng công thức của bất phương trình bậc nhất hai ẩn, nhưng không đề cập đến nội dung cụ thể của bài toán trong CONTEXT, dẫn đến thiếu sót trong việc liên kết với yêu cầu của câu hỏi. |
| REAL_EVAL50_MATH_007 | 0.0000 | 3.2000 | N/A | 0.0000 | false | Câu trả lời đúng về công thức bất phương trình bậc nhất hai ẩn, nhưng không hoàn toàn đáp ứng yêu cầu cụ thể từ ngữ cảnh về các điều kiện và hệ bất phương trình liên quan đến số lượng máy điều hòa. |
