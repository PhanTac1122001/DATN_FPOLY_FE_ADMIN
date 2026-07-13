# 01 — Design Tokens & Colors

> Đồng bộ màu từ **extracted-portal** vào FE. Cấm hex cứng trong JSX.

## Nguồn (phase cơ bản)

| | Path |
|--|------|
| CSS vars | `LMS_AI_SPEC/extracted-portal/template.html` — `#lms-shell` (`--wine`, `--gold`, `--cream`, …) |
| Preview | `http://localhost:4178/template.html` |
| Target | `lms-portal-fe/src/styles/theme.css` + `ICON_COLORS` |

> `chi-tiet/assets/design-system.css` (admin blue) **không** dùng ở phase này — xem supplemental sau.

## Brand = Wine EP

| Token | Hex | Tailwind |
|-------|-----|----------|
| Brand 500 (wine) | `#4B51C4` | `bg-brand-500` |
| Brand 600 (deep) | `#363C97` | `bg-brand-600` |
| Brand 400 (bright) | `#6C72E0` | `bg-brand-400` |
| Brand 50 (soft) | `#ECEDFB` | `bg-brand-50` |
| Nav | `#454A72` | `bg-nav-500` |
| Nav deep | `#30334D` | `bg-nav-700` |
| Gold | `#CE9A38` | `bg-gold-500` |
| Gold deep | `#A97A1F` | `bg-gold-600` |
| Gold soft | `#F8EED6` | `bg-gold-50` |
| Cream | `#F6F7FC` | `bg-cream` |
| Ink | `#20233A` | `text-slate-900` |
| Muted | `#5B6070` | `text-slate-500` |
| Line | `#E6E8F2` | `border-slate-200` |

Font prototype: **Be Vietnam Pro** (`font-display`).

## Checklist

- [x] `--color-brand-*` wine trong `theme.css`
- [x] `nav` / `gold` / `cream` / `ai`
- [x] Sync `ICON_COLORS`
- [ ] Mọi màn WP so màu với preview EP trước khi merge
