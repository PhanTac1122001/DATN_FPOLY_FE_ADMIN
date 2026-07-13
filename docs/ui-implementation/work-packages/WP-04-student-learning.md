# WP-04 — Student Learning (Lộ trình / Môn / Study)

## Mục tiêu
Cụm học tập trong EP: path, courses, detail, study overlay.

## Nguồn (chỉ EP)
| Screen | Lines |
|--------|-------|
| Path `isPath` | ~545–650 |
| Courses list | ~787–839 |
| Course detail + map | ~841–1138 |
| Study `isStudy` | ~1797–1934 |
| Mock curriculum | `logic.js` → `src/mocks/courses.mock.ts`, `learning-path.mock.ts` |

**Không** làm Prep 5 bước / Practice hub / Quiz đầu giờ từ `chi-tiet` (→ supplemental sau).

## Routes
| Route | View |
|-------|------|
| `/learning-path` | `learning-path-view.tsx` |
| `/courses` | `courses-view.tsx` |
| `/courses/[id]` | `course-detail-view.tsx` |
| `/courses/[id]/lessons/[lessonId]` | `study-mode-view.tsx` |

## Việc làm (batch)
1. **4a** Learning path  
2. **4b** Courses list + search  
3. **4c** Course detail (map + accordion + side panel)  
4. **4d** Study mode (Video → Đọc → Quiz → Practice)

## Phụ thuộc
WP-00, WP-02.

## DoD
- [ ] Navigate list → detail → study khớp EP
- [ ] Mock trong `src/mocks/`
- [ ] 100% visual vs preview; type-check + lint

## Prompt
> Implement WP-04 section 4a first from template.html path ~545–650. EP only.
