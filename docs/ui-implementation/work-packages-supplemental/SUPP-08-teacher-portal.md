# SUPP-08 — Teacher Portal (bổ sung — làm sau)

> Chỉ làm khi luồng `work-packages/` (extracted-portal) đã ổn.

## Mục tiêu
Toàn bộ giao diện Giảng viên / Trợ giảng từ `chi-tiet` (không có trong extracted-portal SPA).

## Nguồn HTML (bắt buộc đọc `dac-ta.md` kèm theo)
| Nhóm | Files under `LMS_AI_SPEC/09_Giao_dien_Prototype/chi-tiet/` |
|------|-----------------------------------------------------------|
| Dashboard | `Chung/dashboard-giang-vien.html`, `chi-tiet-lop.html` |
| SRS-01 | `so-diem-mon-hoc.html`, `cau-hinh-trong-so-rpoint.html` |
| SRS-02 | `cau-hinh-ai-cham-bai.html`, `duyet-eportfolio-override.html` |
| SRS-03 | `de-thi-ca-thi.html` |
| SRS-04 | `soan-thong-bao-da-cap.html`, `bao-dong-do.html` |
| SRS-05 | `mo-khoa-session.html`, `bien-soan-khoa-lo-trinh.html`, `soan-chuan-bi-bai.html` |
| SRS-08 | `ngan-hang-cau-hoi.html`, `cau-hinh-ai-homework.html` |
| SRS-10 | `cau-hinh-mo-quiz.html` |
| SRS-11 | `diem-danh-buoi-hoc.html` |

Design tokens: `assets/design-system.css` — map sang brand wine (xem `01-design-tokens-colors.md`).

## Target structure
```
src/app/(dashboard)/teacher/...
src/views/teacher-*-view.tsx   ← phẳng, prefix teacher-
src/components/ui/teacher/
src/config/navigation.tsx → TEACHER_NAV_CONFIG
```

## Routes đề xuất (ưu tiên thứ tự implement)
1. `/teacher` — dashboard GV  
2. `/teacher/classes/[id]` — chi tiết lớp  
3. `/teacher/gradebook/[courseId]` — sổ điểm  
4. `/teacher/attendance/[sessionId]` — điểm danh  
5. `/teacher/announcements/compose`  
6. `/teacher/quiz` — mở quiz  
7. `/teacher/question-bank`  
8. `/teacher/courses/editor` + unlock session + prep editor  
9. `/teacher/ai-grading`, `/teacher/ai-homework`, `/teacher/portfolio-review`  
10. `/teacher/red-alerts`, `/teacher/exams`, `/teacher/rpoint/weights`  

## Components
`DataToolbar`, `GradebookTable`, class roster cards, attendance session UI, rich compose (reuse TipTap editor scaffold)

## Phụ thuộc
WP-00, WP-01, WP-02. Student portal không bắt buộc xong hết nhưng shell phải có.

## Cách chia nhỏ cho AI
Giao từng batch: **8a Dashboard+Class → 8b Gradebook+Attendance → 8c Content authoring → 8d AI configs → 8e Alerts/Quiz/Exams**.

## DoD (mỗi batch)
- [ ] HTML mockup → view + components
- [ ] Nav teacher hoạt động
- [ ] UI_TEXT + tokens; type-check + lint

## Prompt gợi ý
> Implement WP-08 batch 8a: teacher dashboard + class detail from chi-tiet/Chung HTML. Use DashboardLayout + TEACHER_NAV.
