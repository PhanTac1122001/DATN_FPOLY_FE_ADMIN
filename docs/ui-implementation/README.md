# UI Implementation Docs — LMS Portal FE

> Triển khai giao diện từ prototype **extracted-portal** sang Next.js.  
> Preview chuẩn: chạy `server.mjs` → `http://localhost:4178/template.html`.

## Cách dùng

1. Mở **một** WP trong `work-packages/` (luồng cơ bản).
2. Prompt: *"Implement theo file này, tuân thủ `.cursor/rules/frontend.mdc`"*.
3. AI đọc **Nguồn HTML** (line range trong `template.html`) → so sánh với preview `localhost:4178` → code **giống 100%** layout/visual.
4. **Không** làm `work-packages-supplemental/` cho đến khi luồng EP xong.

## Preview prototype (bắt buộc đối chiếu)

```bash
cd LMS_AI_SPEC/extracted-portal
node server.mjs
# → http://localhost:4178/template.html
```

| File server phục vụ | Vai trò |
|---------------------|---------|
| `template.html` | **Nguồn UI duy nhất** của luồng cơ bản |
| `logic.js` | State, navigation, **mock data** (copy sang `src/mocks/`) |
| `assets/`, `icons/` | Logo, SVG |

`server.mjs` chỉ là static server — **không** chứa UI.

## Cấu trúc tài liệu

```
docs/ui-implementation/
├── README.md
├── 00-overview.md
├── 01-design-tokens-colors.md
├── 02-reusable-components.md
├── 03-screen-index.md
├── work-packages/                    ← LUỒNG CƠ BẢN (extracted-portal)
│   ├── WP-00-foundation.md
│   ├── WP-01-auth.md
│   ├── WP-02-app-shell.md
│   ├── WP-03-student-home.md
│   ├── WP-04-student-learning.md
│   ├── WP-05-student-results-board.md
│   ├── WP-06-student-game-portfolio.md
│   └── WP-07-student-admin-schedule.md
└── work-packages-supplemental/       ← LUỒNG BỔ SUNG (chi-tiet / SRS) — làm SAU
    ├── README.md
    ├── SUPP-01-auth-srs06.md
    ├── SUPP-08-teacher-portal.md
    ├── SUPP-09-admin-portal.md
    ├── SUPP-10-exam-invigilator.md
    └── SUPP-11-peripheral-roles.md
```

## Nguồn prototype

| Phase | Path | Khi nào dùng |
|-------|------|--------------|
| **Cơ bản (hiện tại)** | `LMS_AI_SPEC/extracted-portal/` | Mọi WP-00…07 |
| **Bổ sung (sau)** | `LMS_AI_SPEC/09_Giao_dien_Prototype/chi-tiet/` | Chỉ `work-packages-supplemental/` |

## Quy tắc UI (luồng cơ bản)

- Giao diện FE **giống 100%** màn tương ứng trên `http://localhost:4178/template.html`.
- Chỉ đọc `template.html` + `logic.js` — **không** trộn HTML từ `chi-tiet/` vào WP cơ bản.
- Mock data → `src/mocks/*.mock.ts` (không hardcode mảng dữ liệu trong view/component).
- Text → `UI_TEXT`; màu → theme tokens / `ICON_COLORS`.

## Thứ tự triển khai

| Phase | WP | Mục tiêu |
|-------|-----|----------|
| **0** | WP-00 | Tokens + icons từ EP |
| **1** | WP-01, WP-02 | Splash/Login + App shell |
| **2** | WP-03 → WP-07 | Toàn bộ màn SV trong `template.html` |
| **3+** | `work-packages-supplemental/` | SRS / đa vai — sau khi phase 2 ổn |

## Target codebase

| Layer | Path |
|-------|------|
| Rules AI | `.cursor/rules/frontend.mdc` |
| Mock data | `src/mocks/` |
| Theme | `src/styles/theme.css` |
| UI text | `src/constants/ui-text.constants.ts` |
| Views | `src/views/*-view.tsx` (phẳng, không subfolder) |
| Feature UI | `src/components/ui/` |
| Layout | `src/components/layout/` |
