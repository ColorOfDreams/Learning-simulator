# Báo cáo dự toán tài chính — gói Thường và Business

Cập nhật 08/09/2026. Bản này thay thế mô hình định giá theo học sinh/giáo viên/trung tâm trước đây. Kỳ kế hoạch: 12 tháng từ lúc bắt đầu thương mại hóa, dự kiến 10/2026–09/2027. Đơn vị tài chính: triệu đồng, trừ khi ghi khác. Tỷ giá ngân sách giả định 26.000 đồng/USD.

Đây là dự toán quản trị chưa có dữ liệu doanh thu, hóa đơn production và khảo sát sẵn sàng chi trả thực tế. Giá bán, số khách, nhân công và tỷ lệ chuyển đổi là giả định. Xem [phụ lục marketing, token và định tuyến nhiều model](PHU_LUC_MARKETING_VA_SU_DUNG_AI.md) để kiểm tra cách tính.

## 1. Chính sách sản phẩm và định giá

Có hai gói trả phí; người mua chọn theo nhu cầu cá nhân hay cộng tác, không theo nghề nghiệp. Chế độ dùng thử miễn phí là công cụ trải nghiệm, không phải gói thương mại thứ ba.

| Nội dung | Thường | Business |
|---|---|---|
| Giá thử nghiệm | 59.000 đồng/tháng | 1.500.000 đồng/tổ chức/tháng |
| Người mua | Bất kỳ cá nhân nào: học sinh, phụ huynh, giáo viên, gia sư | Bất kỳ nhóm/tổ chức nào cần quản lý nhiều tài khoản |
| Tài khoản | 1 tài khoản cá nhân | Tối đa 5 tài khoản quản lý và 100 tài khoản thành viên |
| Tính năng cơ bản | Mô phỏng, chat RAG, quiz, công cụ tạo nội dung theo quyền phù hợp | Toàn bộ tính năng cá nhân, thêm không gian nhóm, quản lý tài khoản, học liệu dùng chung, báo cáo tổng hợp |
| Hạn mức AI đề xuất | 100 credit/tháng | 2.000 credit/tháng dùng chung |
| Cách chọn model | Theo tác vụ và chất lượng cần thiết | Cùng chính sách chất lượng; thêm kiểm soát ngân sách tổ chức |
| Hỗ trợ | Hướng dẫn tự phục vụ và kênh hỗ trợ chung | Onboarding cơ bản và hỗ trợ nhóm trong phạm vi hợp đồng |

Không thu thêm chỉ vì người dùng là giáo viên. Quyền xem dữ liệu lớp, chấm bài và quản trị vẫn phải theo vai trò được cấp; cùng mức giá không đồng nghĩa mọi tài khoản được xem dữ liệu của nhau. Business trả tiền cho khả năng cộng tác/quản trị và dung lượng, không mua đặc quyền được AI trả lời đúng hơn.

Các khả năng quản trị bổ sung và thu phí cần kiểm tra khoảng cách với code trước khi quảng bá; bảng là phạm vi thương mại đề xuất, chưa khẳng định mọi tính năng đã hoàn thiện. Hạn mức 2.000 credit cho 105 tài khoản là mức sử dụng nhẹ dùng chung, không phải 2.000 mỗi người. Giá Business cần kiểm chứng qua pilot, không phải giá thị trường đã xác nhận.

## 2. Khách hàng và giá trị marketing

Giáo viên/gia sư là nhóm có thể giới thiệu sản phẩm; học sinh/phụ huynh là người dùng cá nhân; trung tâm/trường/nhóm dạy học là cơ hội Business. Đây là phân khúc tiếp cận marketing, không phải ba bảng giá.

Giá trị cần chứng minh: giáo viên tiết kiệm thời gian chuẩn bị sau khi trừ thời gian sửa AI; học sinh hiểu hiện tượng tốt hơn; tổ chức quản lý và triển khai nội dung đồng nhất. PhET đã có mô phỏng miễn phí nên không thể chỉ bán số lượng mô phỏng. Nguồn: [PhET](https://phet.colorado.edu/).

Không định giá doanh nghiệp bằng lượt xem hoặc số user đăng ký. Cần khách trả phí, retention, chi phí phục vụ, quyền khai thác học liệu và dữ liệu chuyển đổi trước khi thảo luận định giá.

## 3. Ngân sách và nguyên tắc dự báo

Giữ mô hình nhân sự tinh gọn: sáng lập tự làm phần lớn. Chi cố định 12 triệu/tháng giai đoạn 1–6; 20 triệu/tháng giai đoạn 7–12. Chi hoàn thiện web một lần 20 triệu, giải ngân 12 triệu tháng 1 và 8 triệu tháng 2.

| Chi cố định/tháng | Tháng 1–6 | Tháng 7–12 |
|---|---:|---:|
| Hạ tầng, backup và công cụ nền | 1,5 | 2,5 |
| Bảo trì kỹ thuật trả ngoài | 4,0 | 6,0 |
| Biên tập/kiểm duyệt học liệu | 2,0 | 3,0 |
| Marketing và tìm khách | 3,0 | 6,0 |
| CSKH, hành chính, đệm nhỏ | 1,5 | 2,5 |
| Tổng | 12,0 | 20,0 |

Chi biến đổi giữ hệ số dự trù 15% doanh thu: 10% AI/embedding/tải tăng thêm, 3% thanh toán/hoàn tiền, 2% hỗ trợ theo lượng khách. Không coi AI thực sự biến đổi tuyến tính theo doanh thu; phụ lục có cách thay bằng token đo được. Không cộng lại toàn bộ ngân sách AI lên hệ số 15%.

Marketing năm: 54 triệu (18 triệu nửa đầu, 36 triệu nửa sau). Đây là ngân sách thử nghiệm, chưa chứng minh đủ tạo số khách dự kiến. Nếu không có doanh thu mà giữ nguyên chi tiêu, tiền cần cho cả năm là 212 triệu trước dự phòng.

Ngân sách 20 triệu hoàn thiện gồm 12 triệu kỹ thuật/test/thu phí, 5 triệu học liệu và 3 triệu hướng dẫn/onboarding. Chưa có báo giá triển khai router nhiều nhà cung cấp; chưa đưa lợi ích tiết kiệm AI vào chi cơ sở, xem phụ lục về chi phí thử nghiệm bổ sung.

## 4. Dự báo từng tháng sau khi đổi gói

Gộp nhóm khách cá nhân cũ vào gói Thường, giữ nguyên tổng số khách để chỉ đo tác động thay chính sách giá. Điều này không phải khẳng định giá thấp hơn không làm tăng cầu; tác động đến chuyển đổi/gia hạn chưa biết nên chưa tự tăng số khách.

Số tài khoản trong bảng là bình quân trả phí trong tháng, không phải đăng ký hay cuối kỳ. Tài khoản thuộc Business không tính thêm vào Thường. Giả định thu tiền đúng tháng, không giảm giá/công nợ; nếu bán năm phải tách tiền thu trước và doanh thu phân bổ.

Doanh thu = số Thường × 0,059 + số Business × 1,5.
Chi tiền = chi cố định + 15% doanh thu + chi hoàn thiện theo tháng.

| Tháng | Gói Thường | Gói Business | Doanh thu | Chi tiền | Chênh lệch |
|---|---:|---:|---:|---:|---:|
| 1 | 0 | 0 | 0.00 | 24.00 | -24.00 |
| 2 | 0 | 0 | 0.00 | 20.00 | -20.00 |
| 3 | 25 | 0 | 1.48 | 12.22 | -10.75 |
| 4 | 60 | 0 | 3.54 | 12.53 | -8.99 |
| 5 | 108 | 1 | 7.87 | 13.18 | -5.31 |
| 6 | 175 | 2 | 13.33 | 14.00 | -0.67 |
| 7 | 232 | 2 | 16.69 | 22.50 | -5.82 |
| 8 | 300 | 3 | 22.20 | 23.33 | -1.13 |
| 9 | 378 | 4 | 28.30 | 24.25 | 4.06 |
| 10 | 468 | 5 | 35.11 | 25.27 | 9.85 |
| 11 | 570 | 6 | 42.63 | 26.39 | 16.24 |
| 12 | 685 | 8 | 52.42 | 27.86 | 24.55 |

| Kỳ | Doanh thu lũy kế | Chi tiền lũy kế | Chênh lệch |
|---|---:|---:|---:|
| 6 tháng | 26,21 | 95,93 | −69,72 |
| 12 tháng | 223,56 | 245,53 | −21,97 |

MRR bình quân tháng 6: 13,325 triệu; tháng 12: 52,415 triệu. Không lấy tháng 12 ×12 gọi là doanh thu năm đầu.

Vốn hụt sâu nhất khoảng 76,67 triệu cuối tháng 8; đề xuất chuẩn bị 90–110 triệu cho web theo kịch bản này, gồm đệm. Số vốn đó chỉ phù hợp khi sáng lập chưa nhận lương và khách trả đúng kỳ.

Kết quả trước thuế, lương sáng lập, khấu hao, tài trợ, mobile và chi phí phát triển quá khứ. Giả định công sức sáng lập 2 người ×60 giờ/tháng ×250.000 đồng =30 triệu/tháng; nếu tính vào chi kinh tế, năm đầu âm 381,97 triệu. Nếu trả bằng tiền ngay, cần tính lại runway; riêng sáu tháng chi thêm 180 triệu.

## 5. Kịch bản và hòa vốn

Thận trọng: đạt 40% doanh thu cơ sở, giữ chi cố định. Tăng trưởng tốt: đạt 180% doanh thu cơ sở, chi cố định tăng 30%. Chi hoàn thiện vẫn 20 triệu và biến đổi 15%. Đây là độ nhạy toán học, không phải xác suất dự báo.

| Kịch bản | DT 6T | Chi 6T | Chênh lệch 6T | DT 12T | Chi 12T | Chênh lệch 12T |
|---|---:|---:|---:|---:|---:|---:|
| Thận trọng | 10.48 | 93.57 | -83.09 | 89.42 | 225.41 | -135.99 |
| Cơ sở | 26.21 | 95.93 | -69.72 | 223.56 | 245.53 | -21.97 |
| Tăng trưởng tốt | 47.18 | 120.68 | -73.50 | 402.41 | 329.96 | 72.45 |

Hòa vốn vận hành tháng: chi cố định /0,85 =14,12 triệu giai đoạn đầu và 23,53 triệu giai đoạn sau. Nếu chỉ bán Thường, tương đương 240 và 399 tài khoản; nếu đã có 8 Business tạo 12 triệu, cần khoảng 196 Thường để bù chi vận hành giai đoạn sau. Đây không phải hoàn vốn lũy kế.

Có thêm 30 triệu/tháng lương sáng lập ở giai đoạn sau: hòa vốn cần 58,82 triệu doanh thu/tháng. MRR tháng 12 cơ sở 52,42 triệu chưa đủ. Tháng có lãi vận hành từ tháng 9 nhưng lũy kế năm vẫn âm.

## 6. Hạ tầng, deploy và độ ổn định

Theo code và README: web UmiJS/React, mô phỏng Three.js phía client, NestJS và PostgreSQL/pgvector. Chưa xác minh runtime production trong đợt lập báo cáo; lần kiểm tra local chưa có công cụ/dependencies/env để chạy test.

Railway tính phí theo gói và tài nguyên, không coi mức phí tối thiểu là toàn bộ hóa đơn. Nguồn: [Railway pricing](https://railway.com/pricing).

| Khoản kỹ thuật/tháng | Pilot | Tăng trưởng |
|---|---:|---:|
| Web/API/DB và lưu trữ chính | 0,6–1,5 | 1,5–4,0 |
| Backup/file/băng thông bổ sung | 0,15–0,5 | 0,4–1,2 |
| Domain phân bổ/email/monitoring | 0,1–0,4 | 0,3–0,8 |
| AI/embedding tham khảo theo tải | 0,1–0,8 | 0,8–3,5 |

Bảng là dải dự trù tham khảo, không phải bảo đảm đủ mọi MAU/quota. Phần nền đã nằm trong chi cố định; AI/tải tăng thêm trong phần 10% hoặc thay bằng số đo thực. Không cộng trùng. Cần staging, test CI, sao lưu/thử restore, thay đổi schema có kiểm soát, đo AI, quota và thanh toán trước khi bán rộng.

## 7. Mobile — khoản đầu tư riêng

Không phải chuyển nguyên giao diện UmiJS/Ant Design sang React Native. Có thể dùng chung backend/API và một phần logic; cần kiểm tra Three.js/WebGL, touch và pin trên thiết bị thật.

| Phương án | Giờ giả định ×250.000 đồng | Chi phát triển | Bảo trì thêm/tháng |
|---|---|---:|---:|
| Web mobile/PWA | 80–160 giờ | 20–40 | 1–2 |
| Hybrid Android+iOS | 200–360 giờ | 50–90 | 2–4 |
| Mobile thiết kế lại | 600–1.000 giờ | 150–250 | 4–8 |

Đây là dự toán phạm vi nhỏ, không phải báo giá thị trường; chưa gồm làm lại toàn bộ mô phỏng/offline, thiết bị (đệm 15–35 triệu nếu thiếu) và nội dung mới. Không cộng ba phương án thay thế vào nhau.

Apple Developer: 99 USD/năm; Google Play: 25 USD một lần. Nguồn: [Apple](https://developer.apple.com/support/compare-memberships/), [Google](https://support.google.com/googleplay/android-developer/answer/6112435?hl=en). Thuê bao trong app cần tính phí store riêng: Google công bố 15% cho thuê bao tự gia hạn; Apple Small Business 15% khi đủ điều kiện/tham gia. Nguồn: [Google fees](https://support.google.com/googleplay/android-developer/answer/112622?hl=en-GB), [Apple Small Business](https://developer.apple.com/app-store/small-business-program/).

Hybrid triển khai nửa cuối năm: thêm 50–90 triệu phát triển +12–24 triệu bảo trì +3,224 triệu tài khoản =khoảng 65–117 triệu, chưa thiết bị/store commission. Mô hình web hai gói chưa gồm khoản này; không giả định có app là doanh thu tự tăng.

## 8. Quyết định theo mốc

Tháng 1–2: ổn định web, phỏng vấn 10–20 cá nhân và 2–3 tổ chức, thử chất lượng model. Tháng 3–4: xác minh trả tiền và gia hạn cùng hai gói. Tháng 5–6: thử đạt 175 Thường, 2 Business bình quân tháng; đo CAC và token thật.

Tháng 7–12: chỉ tăng chi khi cohort giữ được, xác minh Business có nhu cầu cộng tác đủ trả 1,5 triệu. Mục tiêu tháng 12: 685 Thường và 8 Business, không coi là khách đã ký. Cân nhắc PWA trước app store.

Chưa đưa doanh thu credit bổ sung, hợp đồng tùy chỉnh hoặc định giá doanh nghiệp vào dự toán. Cần cập nhật hóa đơn, giá nhân công, nhu cầu trả phí, mùa vụ, chất lượng học liệu và thuế theo pháp nhân trước khi dùng để gọi vốn.

Tài liệu nguồn nội bộ: [README](../README.md), [DEMO_DAY](../DEMO_DAY.md), [phụ lục](PHU_LUC_MARKETING_VA_SU_DUNG_AI.md).

