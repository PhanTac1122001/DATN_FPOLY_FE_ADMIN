# WP-03 — Student Home (Dashboard)

## Mục tiêu
Trang chủ SV khớp `isDash` trên preview EP.

## Nguồn
| | |
|--|--|
| HTML | `template.html` `isDash` **~348–543** |
| Mock | `logic.js` (tasks, courses, badges, mini board, …) → `src/mocks/home.mock.ts` |
| Preview | `localhost:4178` → Trang chủ |

**Không** dùng `chi-tiet/Chung/trang-chu-sinh-vien.html`.

## Target
| File | Action |
|------|--------|
| `views/home-view.tsx` | Composition |
| `components/ui/home/*` | Hero, pinned news, week strip, character, badges, mini board, course progress |
| `src/mocks/home.mock.ts` | Data từ logic.js |

## Blocks (thứ tự EP)
1. Hero chào + XP/level + streak  
2. Thông báo ghim  
3. Lịch tuần strip  
4. Card nhân vật  
5. Lưới badge  
6. Mini leaderboard  
7. Tiến độ môn + dự báo  

## Phụ thuộc
WP-00, WP-02.

## DoD
- [ ] 100% vs preview desktop (+ stack mobile)
- [ ] Mock chỉ trong `src/mocks/`
- [ ] UI_TEXT + tokens; type-check + lint

## Prompt
> Implement WP-03 from template.html ~348–543. Match localhost:4178. Mock in src/mocks/home.mock.ts.
