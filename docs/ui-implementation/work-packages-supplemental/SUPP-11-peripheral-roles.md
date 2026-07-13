# SUPP-11 — Peripheral roles (bổ sung — làm sau)

> Chỉ làm khi luồng `work-packages/` (extracted-portal) đã ổn.

## Mục tiêu
Các portal phụ: phụ huynh, doanh nghiệp, portfolio công khai.

## Nguồn HTML
| Màn | Path |
|-----|------|
| Theo dõi PH | `chi-tiet/Chung/theo-doi-phu-huynh.html` + `Chung/dac-ta.md` |
| Enterprise | `chi-tiet/SRS-12/khung-nhin-doanh-nghiep.html` + `SRS-12/dac-ta.md` |
| Portfolio public | `chi-tiet/SRS-07/portfolio-cong-khai.html` |

## Target
| Route | View / layout |
|-------|----------------|
| `/parent` | `views/parent-home-view.tsx` + parent nav tối giản |
| `/enterprise` | `views/enterprise-dashboard-view.tsx` |
| `/p/[slug]` | `views/public-portfolio-view.tsx` — **không** login shell |

## Việc cần làm
1. Parent: xem tiến độ con, cảnh báo, lịch (read-only cards).  
2. Enterprise: KPI kỹ năng, skill gap vs JD.  
3. Public portfolio: trang marketing-like, shareable.

## Phụ thuộc
WP-00. Có thể làm song song cuối phase.

## DoD
- [ ] 3 routes UI xong
- [ ] Public portfolio không lộ dashboard sidebar
- [ ] type-check + lint pass

## Prompt gợi ý
> Implement WP-11 public portfolio from SRS-07/portfolio-cong-khai.html as a public route without DashboardLayout.
