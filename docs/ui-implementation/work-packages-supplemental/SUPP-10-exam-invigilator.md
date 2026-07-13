# SUPP-10 — Exam & Invigilator (bổ sung — làm sau)

> Chỉ làm khi luồng `work-packages/` (extracted-portal) đã ổn.

## Mục tiêu
Phòng thi SV (lock-down) + màn Giám thị + placement test full-screen.

## Nguồn HTML
| Màn | Path |
|-----|------|
| Lobby thi | `chi-tiet/SRS-03/thi-cuoi-ky.html` |
| Làm bài thi | `SRS-03/lam-cau-hoi-thi.html` |
| Sơ đồ chỗ ngồi | `SRS-03/so-do-cho-ngoi.html` |
| Biên bản | `SRS-03/lap-bien-ban-vi-pham.html` |
| Placement take | `SRS-09/lam-bai-dau-vao.html` |
| Spec | `SRS-03/dac-ta.md`, `SRS-09/dac-ta.md` |

## Target
| Route | Layout note |
|-------|-------------|
| `/exam/[sessionId]/lobby` | Có thể full-bleed, **không** sidebar |
| `/exam/[sessionId]/take` | Full-screen anti-cheat shell |
| `/placement/take` | Full-screen |
| `/invigilator/seats/[roomId]` | Invigilator layout |
| `/invigilator/violations/new` | Form + signature |

## Components
`QuizPlayer` (reuse), `SeatMapGrid`, `SignaturePad`, exam timer, lock banner

## Đặc biệt
- Layout riêng: `src/components/layout/exam/exam-layout.tsx` (no dashboard chrome)
- UI cảnh báo gian lận, fullscreen API (stub OK phase UI)

## Phụ thuộc
WP-00. QuizPlayer từ WP-04 nếu đã có.

## DoD
- [ ] Take-exam UI + timer + question nav
- [ ] Seat map grid
- [ ] Violation form UI
- [ ] type-check + lint pass

## Prompt gợi ý
> Implement WP-10 exam take screen from SRS-03/lam-cau-hoi-thi.html with ExamLayout (no sidebar).
