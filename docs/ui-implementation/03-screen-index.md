# 03 — Screen Index (extracted-portal)

> Path HTML: `LMS_AI_SPEC/extracted-portal/template.html`  
> Preview: `http://localhost:4178/template.html`  
> Mock nguồn: `extracted-portal/logic.js` → copy sang `src/mocks/`

---

## A. Luồng cơ bản (làm ngay) — WP-00…07

| Screen | Marker / lines (approx) | Route FE | View | WP |
|--------|-------------------------|----------|------|-----|
| Splash | `isSplash` ~2099–2111 | `/login` (entry) | `views/login-view.tsx` | WP-01 |
| Login | `isLogin` ~2113–2127 | `/login` | `ui/auth/login-form.tsx` | WP-01 |
| Sidebar / Topbar / Bottom | `#lms-sidebar` ~210–340, bottom ~1770+ | layout | `layout/dashboard/*` | WP-02 |
| Dashboard | `isDash` ~348–543 | `/` | `views/home-view.tsx` | WP-03 |
| Path | `isPath` ~545–650 | `/learning-path` | `learning-path-view.tsx` | WP-04 |
| Courses list | `isCourses` + list ~787–839 | `/courses` | `courses-view.tsx` | WP-04 |
| Course detail | ~841–1138 | `/courses/[id]` | `course-detail-view.tsx` | WP-04 |
| Study mode | `isStudy` ~1797–1934 | `/courses/[id]/lessons/[lessonId]` | `study-mode-view.tsx` | WP-04 |
| Board | `isBoard` ~652–709 | `/leaderboard` | `leaderboard-view.tsx` | WP-05 |
| Todo | `isTodo` ~711–785 | `/tasks` | `tasks-view.tsx` | WP-05 |
| Result | `isResult` ~1140–1226 | `/results` | `results-view.tsx` | WP-05 |
| News | `isNews` ~1441–1510 | `/announcements` | `announcements-view.tsx` | WP-05 |
| Contest | `isContest` ~1228–1280 | `/contests` | `contests-view.tsx` | WP-06 |
| Admin SV | `isAdmin` ~1282–1325 | `/student-services` | `services-view.tsx` | WP-07 |
| Schedule | `isSchedule` ~1327–1383 | `/schedule` | `schedule-view.tsx` | WP-07 |
| Portfolio | `isPortfolio` ~1385–1439 | `/portfolio` | `portfolio-view.tsx` | WP-06 |
| AI English | `isAiEnglish` ~1512–1588 | `/language-practice` | `language-practice-view.tsx` | WP-06 |
| Profile | `isProfile` ~1591–1646 | `/profile` | `profile-view.tsx` | WP-07 |
| Game | `isGame` ~1648–1770 | `/avatar` | `avatar-view.tsx` | WP-06 |
| Modals | char/chest/feedback ~1936–2084 | overlays | `components/ui/shared/*` | WP-04/06 |

**Icons:** `extracted-portal/icons/svg/` → `public/icons/` / `LMS_ICONS`

---

## B. Luồng bổ sung (làm sau) — `work-packages-supplemental/`

| Nhóm | Nguồn | Doc |
|------|-------|-----|
| OTP / Google auth | `chi-tiet/SRS-06/` | [SUPP-01](./work-packages-supplemental/SUPP-01-auth-srs06.md) |
| Teacher | `chi-tiet/Chung` + SRS GV | [SUPP-08](./work-packages-supplemental/SUPP-08-teacher-portal.md) |
| Admin | `chi-tiet/Chung` + SRS admin | [SUPP-09](./work-packages-supplemental/SUPP-09-admin-portal.md) |
| Exam / Invigilator | `chi-tiet/SRS-03/` | [SUPP-10](./work-packages-supplemental/SUPP-10-exam-invigilator.md) |
| Parent / Enterprise | `chi-tiet/` peripheral | [SUPP-11](./work-packages-supplemental/SUPP-11-peripheral-roles.md) |

Chi tiết HTML từng SRS: xem `LMS_AI_SPEC/09_Giao_dien_Prototype/chi-tiet/00_Ban_do_man_hinh.md` khi làm supplemental.
