# 00 — Overview: luồng cơ bản (extracted-portal)

## 1. Nguồn duy nhất của phase hiện tại

| | |
|--|--|
| Preview | `node LMS_AI_SPEC/extracted-portal/server.mjs` → `http://localhost:4178/template.html` |
| UI | `LMS_AI_SPEC/extracted-portal/template.html` |
| Logic + mock | `LMS_AI_SPEC/extracted-portal/logic.js` |
| Icons | `LMS_AI_SPEC/extracted-portal/icons/svg/` |
| Logo | `LMS_AI_SPEC/extracted-portal/assets/rikkei-logo.png` |

**DoD visual:** so sánh side-by-side FE vs `localhost:4178` — layout, spacing, màu, typography, component hierarchy phải khớp.

`09_Giao_dien_Prototype/chi-tiet/` → chỉ dùng ở [`work-packages-supplemental/`](./work-packages-supplemental/) **sau** khi luồng EP xong.

## 2. Persona phase này

Chỉ **Sinh viên** (`STUDENT`). Không build shell GV/Admin trong WP-00…07.

## 3. Mapping `state.screen` → route

| `screen` / entry | Tiếng Việt | Route đề xuất | WP |
|------------------|------------|---------------|-----|
| `splash` / `login` | Splash + Đăng nhập | `/login` | WP-01 |
| `dashboard` | Trang chủ | `/` hoặc `/dashboard` | WP-03 |
| `path` | Lộ trình | `/learning-path` | WP-04 |
| `courses` | Môn học | `/courses` | WP-04 |
| `courses` detail | Chi tiết môn | `/courses/[id]` | WP-04 |
| study overlay | Chế độ học | `/courses/[id]/lessons/[lessonId]` | WP-04 |
| `result` | Kết quả | `/results` | WP-05 |
| `board` | Xếp hạng | `/leaderboard` | WP-05 |
| `todo` | Nhiệm vụ | `/tasks` | WP-05 |
| `news` | Bảng tin | `/announcements` | WP-05 |
| `contest` | Cuộc thi | `/contests` | WP-06 |
| `game` | Nhân vật & Pet | `/avatar` | WP-06 |
| `portfolio` | E-Portfolio | `/portfolio` | WP-06 |
| `aienglish` | Luyện NN | `/language-practice` | WP-06 |
| `admin` | Hành chính SV | `/student-services` | WP-07 |
| `schedule` | Lịch học | `/schedule` | WP-07 |
| `profile` | Hồ sơ | `/profile` | WP-07 |

Shell: `#lms-sidebar`, `#lms-topbar`, `#lms-bottomnav` → WP-02.

## 4. Cách đọc `template.html`

1. Mở preview `localhost:4178` để thấy màn thật.
2. Trong WP, dùng **line range** đã ghi.
3. Grep marker: `isDash`, `isPath`, `isLogin`, `#lms-sidebar`, …
4. Mock / labels: copy từ `logic.js` sang `src/mocks/<feature>.mock.ts`.

## 5. Definition of Done (mỗi màn)

- [ ] So với `localhost:4178`: layout + visual **100%** (desktop + mobile drawer/bottom nav nếu có)
- [ ] Chỉ nguồn EP — không lấy markup từ `chi-tiet/`
- [ ] Text trong `UI_TEXT`
- [ ] Màu từ theme / `ICON_COLORS`
- [ ] Mock data trong `src/mocks/` — không mảng mock inline trong view/component
- [ ] `page.tsx` → `*-view.tsx` → `components/ui/...`
- [ ] `pnpm run type-check` + `pnpm run lint:check` pass

## 6. Liên kết

- [Design tokens](./01-design-tokens-colors.md)
- [Reusable components](./02-reusable-components.md)
- [Screen index](./03-screen-index.md)
- [Work packages (cơ bản)](./work-packages/)
- [Work packages bổ sung](./work-packages-supplemental/)
