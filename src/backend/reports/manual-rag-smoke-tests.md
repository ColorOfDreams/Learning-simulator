# Manual RAG smoke tests

Run the backend, seed the learning dataset, then send these requests from the backend directory. Every response should use the envelope `{ data, message, statusCode }`; `data.answer` must not be empty and every returned reference must retain `text`.

```powershell
$baseUrl = 'http://localhost:3000'
function Invoke-AiChat($message, $simulationId = $null) {
  $body = @{ session_id = 'sess_manual_rag'; message = $message; subject = 'physics'; grade = 11; context = @() }
  if ($simulationId) { $body.simulationId = $simulationId }
  curl.exe -X POST "$baseUrl/ai/chat" -H "Content-Type: application/json" -d ($body | ConvertTo-Json -Compress)
}
```

## 1. Chu kì dao động điều hòa

```powershell
Invoke-AiChat 'Một vật dao động điều hòa theo phương trình x = 5*cos(4*pi*t + pi/3) cm. Tính chu kì.'
```

Mục tiêu: kiểm tra nhận diện chủ đề và retrieval về dao động điều hòa. Kỳ vọng: câu trả lời nêu công thức T = 2*pi/ω, references liên quan và không rỗng.

## 2. Con lắc đơn và khối lượng

```powershell
Invoke-AiChat 'Tại sao chu kì con lắc đơn không phụ thuộc khối lượng?' 'SIM_PHY11_PENDULUM_BASIC_3D'
```

Mục tiêu: kiểm tra simple pendulum, simulation context và LLM/fallback. Kỳ vọng: giải thích theo T = 2*pi*sqrt(l/g), có gợi ý thử thay đổi chiều dài dây trong mô phỏng nếu LLM hoạt động.

## 3. Khái niệm sóng cơ

```powershell
Invoke-AiChat 'Sóng cơ là gì?'
```

Mục tiêu: kiểm tra retrieval khái niệm. Kỳ vọng: định nghĩa ngắn, references về sóng cơ và không bịa nguồn.

## 4. Sóng dừng

```powershell
Invoke-AiChat 'Trong sóng dừng, nút sóng và bụng sóng là gì?'
```

Mục tiêu: kiểm tra phân biệt hai khái niệm gần nhau. Kỳ vọng: câu trả lời phân biệt nút/bụng, references có `text`.

## 5. Lực Coulomb và khoảng cách

```powershell
Invoke-AiChat 'Lực Coulomb phụ thuộc vào khoảng cách giữa hai điện tích như thế nào?'
```

Mục tiêu: kiểm tra retrieval điện trường. Kỳ vọng: nêu quan hệ nghịch với bình phương khoảng cách, không dùng LaTeX block.

## 6. Điện trường đều

```powershell
Invoke-AiChat 'Điện trường đều có đặc điểm gì?'
```

Mục tiêu: kiểm tra topic điện trường. Kỳ vọng: mô tả phương, chiều và độ lớn theo tài liệu tìm được.

## 7. Điện dung của tụ điện

```powershell
Invoke-AiChat 'Điện dung của tụ điện là gì?'
```

Mục tiêu: kiểm tra retrieval mạch điện. Kỳ vọng: giải thích ngắn về đại lượng điện dung, references phù hợp.

## 8. Định luật Ôm

```powershell
Invoke-AiChat 'Phát biểu định luật Ôm cho đoạn mạch.'
```

Mục tiêu: kiểm tra kiến thức cơ bản về dòng điện. Kỳ vọng: có công thức plain text, ví dụ U = I*R; không có `$$`, `\\[` hay `\\(`.

## 9. Công suất điện

```powershell
Invoke-AiChat 'Công suất điện được tính như thế nào?'
```

Mục tiêu: kiểm tra retrieval công suất điện. Kỳ vọng: câu trả lời phù hợp lớp 11, references không rỗng khi corpus có chủ đề này.

## 10. Câu hỏi ngoài phạm vi dữ liệu

```powershell
Invoke-AiChat 'Giải thích cơ chế hoạt động của lỗ đen siêu nặng.'
```

Mục tiêu: kiểm tra fallback trung thực. Kỳ vọng: không có LLM thì `used_llm: false` và câu trả lời nói chưa đủ dữ liệu trong tài liệu hiện tại; không có references thì vẫn có `answer` không rỗng. Có LLM thì câu trả lời vẫn không được giả vờ có nguồn trong corpus.

## Quan sát retrieval

Khi pgvector và embedding khả dụng, references thường có `score`, `vectorScore` hoặc `retrievalType: "hybrid"`. Khi embedding chưa sẵn sàng, keyword fallback vẫn là kết quả hợp lệ và references có `retrievalType: "keyword"`. Trong môi trường không phải production (hoặc khi `AI_DEBUG=true`), response còn có `data.debug` để quan sát số lượng reference và nguồn retrieval.
