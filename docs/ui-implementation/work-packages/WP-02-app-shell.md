# WP-02 — App Shell (Sidebar / Topbar / Bottom nav)

## Mục tiêu
Khung dashboard SV **giống 100%** EP. Chỉ persona Sinh viên.

## Nguồn HTML
| Phần | Marker / lines |
|------|----------------|
| Sidebar | `#lms-sidebar` ~210–290 |
| Topbar | `#lms-topbar` ~290–340 |
| Bottom nav | ~1770–1795 |
| Mobile drawer CSS | ~189+ |
| Nav labels | template HTML + `logic.js` |

Preview: `localhost:4178` sau khi đăng nhập.

## Target
| File | Action |
|------|--------|
| `layout/dashboard/dashboard-layout.tsx` | Tạo |
| `dashboard-sidebar.tsx` | Logo box, groups, Level/XP footer |
| `dashboard-topbar.tsx` | Title/subtitle, bell, avatar chip |
| `dashboard-bottom-nav.tsx` | 5 tab mobile |
| `src/config/navigation.tsx` | `STUDENT_NAV` theo EP |
| `src/mocks/student-shell.mock.ts` | level, xp, todoCount, user chip |

## Nav SV (khớp EP — không thêm/bớt)

**Tổng quan:** Trang chủ · Thông báo · Hành chính  
**Học tập:** Lộ trình học · Môn học · Kết quả · Luyện ngoại ngữ · Lịch học  
**Thành tích & Game:** Xếp hạng · Cuộc thi · Nhiệm vụ · Nhân vật · Portfolio  
**Footer:** Level + XP bar → Profile  

**Bottom nav:** Trang chủ · Môn học · Lộ trình · Xếp hạng · Nhiệm vụ

## Không làm
- Shell GV/Admin (`chi-tiet`) → supplemental

## DoD
- [ ] Desktop + mobile khớp preview
- [ ] Logo Rikkei trong sidebar
- [ ] UI_TEXT + mocks
- [ ] type-check + lint pass

## Prompt
> Implement WP-02 from extracted-portal sidebar/topbar/bottomnav. Match localhost:4178. Student only.
