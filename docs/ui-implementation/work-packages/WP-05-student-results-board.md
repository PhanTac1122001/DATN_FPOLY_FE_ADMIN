# WP-05 — Results / Leaderboard / Tasks / News

## Mục tiêu
4 màn theo dõi tiến độ & tin tức trong EP.

## Nguồn (chỉ EP)
| Screen | Lines | Mock file |
|--------|-------|-----------|
| Board `isBoard` | ~652–709 | `src/mocks/leaderboard.mock.ts` |
| Todo `isTodo` | ~711–785 | `src/mocks/tasks.mock.ts` |
| Result `isResult` | ~1140–1226 | `src/mocks/results.mock.ts` |
| News `isNews` | ~1441–1510 | `src/mocks/announcements.mock.ts` |

**Không** lấy SRS-01 / SRS-04 / SRS-10 chi-tiet ở phase này.

## Routes
| Route | View |
|-------|------|
| `/leaderboard` | `leaderboard-view.tsx` |
| `/tasks` | `tasks-view.tsx` |
| `/results` | `results-view.tsx` |
| `/announcements` | `announcements-view.tsx` |

## Blocks chính (EP)
- **Board:** podium Top3, scope, search, list  
- **Todo:** tabs Hôm nay / Cảnh báo  
- **Result:** GPA, bảng điểm, AI tips  
- **News:** list → detail  

## DoD
- [ ] 4 màn khớp preview
- [ ] Mock trong `src/mocks/`
- [ ] type-check + lint

## Prompt
> Implement WP-05 starting with board ~652–709. Extracted-portal only.
