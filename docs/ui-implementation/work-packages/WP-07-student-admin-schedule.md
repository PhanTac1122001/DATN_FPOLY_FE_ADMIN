# WP-07 — Services / Schedule / Profile

## Mục tiêu
Hành chính SV, lịch học, hồ sơ — đúng EP.

## Nguồn (chỉ EP)
| Screen | Lines |
|--------|-------|
| Admin SV `isAdmin` | ~1282–1325 |
| Schedule `isSchedule` | ~1327–1383 |
| Profile `isProfile` | ~1591–1646 |
| Mock | `src/mocks/services.mock.ts`, `schedule.mock.ts`, `profile.mock.ts` |

**Không** làm one-stop leave / attendance heatmap từ SRS-11 (`chi-tiet`) ở phase này → supplemental.

## Routes
| Route | View |
|-------|------|
| `/student-services` | `services-view.tsx` |
| `/schedule` | `schedule-view.tsx` |
| `/profile` | `profile-view.tsx` |

## DoD
- [ ] 3 màn khớp preview
- [ ] Mock trong `src/mocks/`
- [ ] type-check + lint

## Prompt
> Implement WP-07 from extracted-portal schedule/profile/admin sections. EP only.
