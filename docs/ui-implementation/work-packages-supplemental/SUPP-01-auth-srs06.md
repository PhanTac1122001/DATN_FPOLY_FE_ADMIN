# SUPP-01 — Auth SRS-06 (OTP + Google) — làm sau

> Bổ sung sau khi WP-01 (EP splash/login) đã khớp `localhost:4178`.

## Mục tiêu
Thêm luồng nghiệp vụ auth đầy đủ từ chi-tiet SRS-06 — **không** thay visual login EP trừ khi product yêu cầu.

## Nguồn
| File | Path |
|------|------|
| Đăng nhập (Google, …) | `LMS_AI_SPEC/09_Giao_dien_Prototype/chi-tiet/SRS-06/dang-nhap.html` |
| OTP | `.../SRS-06/xac-thuc-otp.html` |
| Spec | `.../SRS-06/dac-ta.md` |

## Target gợi ý
| File | Ghi chú |
|------|---------|
| `/otp` + `otp-view.tsx` | Có thể đã scaffold — chỉnh theo SRS-06 |
| Google button | Chỉ khi SRS-06 / product bật |
| `src/mocks/otp.mock.ts` | TTL, attempts, mock code |

## Phụ thuộc
WP-01 (EP login) ổn định trước.

## DoD
- [ ] OTP flow theo dac-ta
- [ ] Không làm lệch login EP nếu vẫn là entry SV chính
- [ ] Mock trong `src/mocks/`; type-check + lint
