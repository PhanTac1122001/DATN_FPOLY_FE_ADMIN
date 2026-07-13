# 02 — Reusable Components (xây trước, dùng lại)

> Build các khối UI dùng chung **trước** khi làm từng màn. Ưu tiên reuse `components/base/` + `components/application/` đã có; chỉ tạo mới khi prototype có pattern chưa cover.

## Nguyên tắc

1. Có sẵn trong `base/` / `application/` → **reuse**, style lại bằng class/token.
2. Pattern lặp ≥ 2 màn → đưa vào `components/application/` hoặc `components/ui/shared/`.
3. Chỉ 1 feature dùng → `components/ui/<feature>/`.
4. Types → `src/types/`; text → `UI_TEXT`.
5. Mock data → `src/mocks/*.mock.ts` (không inline trong component).
6. Visual source = `extracted-portal` preview (`localhost:4178`) — khớp 100%.

## A. Đã có trong scaffold (reuse)

| Component | Path | Dùng cho |
|-----------|------|----------|
| Button, Input, Checkbox, Select, Badge, Avatar, Modal, Tabs, Table, Pagination, DatePicker, Tooltip, Progress | `src/components/base/*`, `src/components/application/*` | Form, list, filter |
| Public layout | `src/components/layout/publiclayout/` | Auth / marketing |
| Auth forms | `src/components/ui/auth/` | Login (cần restyle theo prototype) |

## B. Cần tạo mới (theo prototype)

### B1. App shell (WP-02)

| Component | Path đề xuất | Nguồn tham chiếu |
|-----------|--------------|-----------------|
| `DashboardSidebar` | `src/components/layout/dashboard/dashboard-sidebar.tsx` | `template.html` `#lms-sidebar` (~210+) |
| `DashboardTopbar` | `src/components/layout/dashboard/dashboard-topbar.tsx` | `#lms-topbar` |
| `DashboardBottomNav` | `src/components/layout/dashboard/dashboard-bottom-nav.tsx` | `#lms-bottomnav` (mobile) |
| `DashboardLayout` | `src/components/layout/dashboard/dashboard-layout.tsx` | shell wrapper |
| `NavItem` / `NavGroup` | cùng folder | sidebar groups |

**Config nav (phase EP):** `src/config/navigation.tsx` — chỉ `STUDENT_NAV` khớp sidebar EP.  
`TEACHER_NAV` / `ADMIN_NAV` → khi làm supplemental.

### B2. Gamification / Student shared

| Component | Path đề xuất | Xuất hiện ở |
|-----------|--------------|-------------|
| `XpProgressRing` / `LevelBadge` | `src/components/ui/shared/xp-progress-ring.tsx` | dashboard, profile, game |
| `StreakChip` | `src/components/ui/shared/streak-chip.tsx` | dashboard, board |
| `HeroBanner` | `src/components/ui/shared/hero-banner.tsx` | hầu hết màn SV (gradient wine) |
| `StatCard` | `src/components/ui/shared/stat-card.tsx` | dashboard, result, admin |
| `PodiumTop3` | `src/components/ui/shared/podium-top3.tsx` | board, SRS-10 |
| `CourseCard` | `src/components/ui/courses/course-card.tsx` | courses list |
| `AnnouncementCard` | `src/components/ui/announcements/announcement-card.tsx` | news, dashboard pin |
| `AlertBanner` (red/yellow) | `src/components/ui/shared/alert-banner.tsx` | todo, SRS-04 |
| `SegmentedTabs` | reuse `application/tabs` hoặc wrap | todo, contest, game |
| `EmptyState` | `src/components/ui/shared/empty-state.tsx` | search empty |
| `ToastXp` / confetti hook | `src/components/ui/shared/` + hook | study complete |

### B3. Learning

| Component | Path đề xuất | Nguồn |
|-----------|--------------|-------|
| `SkillTreeRoadmap` | `src/components/ui/learning-path/skill-tree-roadmap.tsx` | path screen SVG |
| `JourneyMap` | `src/components/ui/courses/journey-map.tsx` | course detail map + chests |
| `CurriculumAccordion` | `src/components/ui/courses/curriculum-accordion.tsx` | course sessions |
| `StudyStepRail` | `src/components/ui/study/study-step-rail.tsx` | Video→Đọc→Quiz→Practice |
| `QuizPlayer` | `src/components/ui/study/quiz-player.tsx` | study + SRS exam/quiz |
| `FlashcardDeck` | `src/components/ui/study/flashcard-deck.tsx` | course flash |
| `MindmapCanvas` | `src/components/ui/study/mindmap-canvas.tsx` | mind + SRS-05 |
| `LessonContentPanel` | `src/components/ui/study/lesson-content-panel.tsx` | VOD/PDF |

### B4. Teacher / Admin shared

| Component | Path đề xuất | Nguồn |
|-----------|--------------|-------|
| `DataToolbar` (search+filters+actions) | `src/components/ui/shared/data-toolbar.tsx` | chi-tiet toolbars |
| `GradebookTable` | `src/components/ui/teacher/gradebook-table.tsx` | SRS-01 sổ điểm |
| `AttendanceHeatmap` | `src/components/ui/attendance/attendance-heatmap.tsx` | SRS-11 |
| `SeatMapGrid` | `src/components/ui/exam/seat-map-grid.tsx` | SRS-03 |
| `OtpInput` | `src/components/ui/auth/otp-input.tsx` | SRS-06 |
| `SignaturePad` | `src/components/ui/exam/signature-pad.tsx` | biên bản (cân nhắc lib sau) |

## C. Icons

| Nguồn | Path | Việc |
|-------|------|------|
| SVG collection | `LMS_AI_SPEC/extracted-portal/icons/svg/*.svg` | Copy cần dùng → `public/icons/` hoặc `src/components/icons/` |
| Registry | `extracted-portal/icons/lms-collection.js` | Tham chiếu tên icon |
| Hiện có | `src/components/icons/` | iconsax stubs — bổ sung theo màn |

## D. Thứ tự build component

1. Tokens (WP-00)  
2. Shell layout components (WP-02)  
3. `HeroBanner`, `StatCard`, `XpProgressRing`, `EmptyState`  
4. `CourseCard`, `AnnouncementCard`, `AlertBanner`, `PodiumTop3`  
5. Learning: JourneyMap, StudyStepRail, QuizPlayer  
6. Teacher/Admin specialized khi vào WP-08+

## Checklist

- [ ] Mỗi component mới có types trong `src/types/`
- [ ] Text qua `UI_TEXT`
- [ ] Story/usage tối thiểu: dùng được trong 1 view
- [ ] Không import `services` từ base components
