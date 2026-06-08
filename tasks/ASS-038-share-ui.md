# ASS-038 — Teacher Share Mode — UI
**Sprint:** 4  
**Owner:** Frontend (A)  
**Status:** Todo  
**Branch:** feature/ASS-038-share-ui

## Mô tả
Xây dựng UI để giáo viên chia sẻ simulation: nút "Chia sẻ" mở modal với link copy và QR code. Đảm bảo QR code scan đúng URL share.

## Acceptance Criteria
- [ ] Nút "Chia sẻ" xuất hiện trên Simulation Screen (chỉ khi đã đăng nhập)
- [ ] Click nút → ShareModal hiển thị với link và QR code
- [ ] Copy link bằng 1 click
- [ ] QR code scan ra đúng share URL

## Ghi chú kỹ thuật
- `ShareModal` component: `src/frontend/src/components/ShareModal.tsx` (theo cấu trúc ADR-003)
- QR code: thư viện `qrcode.react` (`<QRCodeSVG value={shareUrl} size={200} />`)
- Copy link: `navigator.clipboard.writeText(shareUrl)` + toast "Đã sao chép!" 2s
- Fallback copy nếu clipboard API không available (HTTPS required): `document.execCommand('copy')` với hidden textarea
- Gọi `POST /sessions/:id/share` (xem `api-contracts.md`) khi mở modal lần đầu; cache URL trong state để không gọi lại
