# WP-06 — Game / Portfolio / Contest / Language

## Mục tiêu
Gamification & luyện NN đúng các screen EP.

## Nguồn (chỉ EP)
| Screen | Lines |
|--------|-------|
| Contest `isContest` | ~1228–1280 |
| Portfolio `isPortfolio` | ~1385–1439 |
| AI English `isAiEnglish` | ~1512–1588 |
| Game `isGame` | ~1648–1770 + modals |
| Mock | `logic.js` → `src/mocks/game.mock.ts`, `portfolio.mock.ts`, `contests.mock.ts`, `language-practice.mock.ts` |

**Không** làm SRS-02 / SRS-07 chi-tiet ở phase này.

## Routes
| Route | View |
|-------|------|
| `/avatar` | `avatar-view.tsx` |
| `/portfolio` | `portfolio-view.tsx` |
| `/contests` | `contests-view.tsx` |
| `/language-practice` | `language-practice-view.tsx` |

## DoD
- [ ] Tabs Nhân vật / Pet / Shop khớp EP
- [ ] Contest / Portfolio / AI English khớp preview
- [ ] Mock trong `src/mocks/`; type-check + lint

## Prompt
> Implement WP-06 avatar first from template.html game ~1648–1770. EP only.
