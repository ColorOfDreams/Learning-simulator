# Features — AI Study Simulator MVP

## F1 — Input & AI Analysis
**Mô tả:** Người dùng nhập bài tập khoa học. AI phân tích và trả về cấu hình simulation.

**Acceptance Criteria:**
- [ ] Hỗ trợ input text (≤ 2000 ký tự)
- [ ] AI trả JSON: `{subject, topic, parameters[], confidence, simulation_id}` trong ≤ 10s
- [ ] Confidence < 0.6 → hiện thông báo "Bài này ngoài phạm vi hỗ trợ"
- [ ] Loading skeleton trong khi AI xử lý

---

## F2 — Simulation Engine (10 templates)

### Vật lý
- **SIM-01** Chuyển động thẳng đều/biến đổi (v, a, t, x)
- **SIM-02** Ném xiên (v₀, θ, g → trajectory)
- **SIM-03** Định luật Newton F=ma (F, m → a, animation lực)
- **SIM-04** Mạch điện R nối tiếp / song song (R, V → I, power)
- **SIM-05** Con lắc đơn (L, θ₀, g → T, animation)

### Hóa học
- **SIM-06** Phản ứng axit-bazơ (pH chart, đổi màu indicator)
- **SIM-07** Oxi hóa khử (electron flow animation)

### Toán
- **SIM-08** Đồ thị hàm bậc 2 (a, b, c → parabola + vertex + roots)
- **SIM-09** Hàm lượng giác (A, B, C, D → sin/cos wave)
- **SIM-10** Hình học tương tác (tam giác + đường tròn, diện tích/chu vi real-time)

**Acceptance Criteria chung:**
- [ ] Mỗi sim có slider điều chỉnh tham số
- [ ] Play / Pause / Reset controls
- [ ] FPS ≥ 30 trên i5 Gen 10 / 8GB RAM
- [ ] Sai số tính toán ≤ 5%
- [ ] KaTeX render công thức toán đúng

---

## F3 — AI Explanation (SSE Streaming)
**Mô tả:** Sau simulation, AI giải thích theo 4 lớp bằng tiếng Việt.

**4 lớp giải thích:**
1. **Hiện tượng** — Mô tả trực quan điều gì đang xảy ra
2. **Công thức** — Phương trình/định luật áp dụng (KaTeX)
3. **Áp dụng** — Tính toán cụ thể với số liệu bài
4. **Thử nghiệm** — Gợi ý thay đổi tham số để khám phá thêm

**Acceptance Criteria:**
- [ ] SSE stream không bị ngắt trong điều kiện bình thường
- [ ] Follow-up questions nhớ context (trong cùng session)
- [ ] Timeout > 30s → hiện fallback message + retry button

---

## F4 — Quiz MCQ
**Mô tả:** Tự sinh 3–5 câu MCQ từ bài tập và simulation.

**Acceptance Criteria:**
- [ ] `POST /quiz/generate` trả MCQ trong ≤ 5 giây
- [ ] Mỗi câu 4 lựa chọn, 1 đúng
- [ ] Độ khó tăng dần (câu 1 dễ → câu 5 khó)
- [ ] Highlight đúng/sai tức thì sau khi chọn
- [ ] Màn hình kết quả + gợi ý ôn tập
- [ ] "Xem lại simulation" không mất state

---

## F5 — Sample Library
**Mô tả:** Thư viện 30 bài mẫu có thể filter và load trực tiếp.

**Acceptance Criteria:**
- [ ] 30 bài format JSON `{id, subject, topic, text, parameters[]}`
- [ ] Filter theo môn (Vật lý / Hóa học / Toán)
- [ ] Search full-text
- [ ] Click bài → load simulation < 1 giây
- [ ] Thumbnail preview simulation

---

## F6 — Session History
**Mô tả:** Lưu và khôi phục lịch sử học.

**Acceptance Criteria:**
- [ ] Lưu 20 session gần nhất/user
- [ ] Hiển thị: thumbnail + timestamp + môn + chủ đề
- [ ] Restore session < 500ms
- [ ] Persist qua logout/login
- [ ] Timezone Việt Nam (UTC+7)

---

## F7 — Auth
- Email/Password registration + login
- Google OAuth 2.0
- Guest mode (3 session/ngày/IP)
- JWT (access 1h) + refresh token (30 ngày)

---

## F8 — Teacher Share Mode
- `POST /sessions/:id/share` → public shareable URL
- QR code generation
- Guest xem link không thấy history của owner
