# WP-00 — Foundation (Tokens + Icons)

## Mục tiêu
Nền visual khớp preview EP trước mọi màn.

## Nguồn (chỉ EP)
| | |
|--|--|
| Preview | `http://localhost:4178/template.html` |
| Tokens | `template.html` `#lms-shell` CSS vars |
| Icons | `extracted-portal/icons/svg/` |
| Doc | [`../01-design-tokens-colors.md`](../01-design-tokens-colors.md) |

## Target
| File | Action |
|------|--------|
| `src/styles/theme.css` | Brand wine + nav/gold/cream |
| `src/constants/app.constants.ts` | `ICON_COLORS` sync |
| `src/styles/globals.css` | Body cream |
| `public/icons/` + `LMS_ICONS` | SVG từ EP |

## Không làm
- Không lấy token từ `chi-tiet/design-system.css`
- Không build sidebar (→ WP-02)

## DoD
- [x] Wine brand + gold/nav/cream
- [x] Icons EP trong `public/icons/`
- [x] type-check + lint pass
