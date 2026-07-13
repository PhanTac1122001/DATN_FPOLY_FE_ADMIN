# SUPP-09 — Admin Portal (bổ sung — làm sau)

> Chỉ làm khi luồng `work-packages/` (extracted-portal) đã ổn.

## Mục tiêu
Giao diện Quản trị / Giáo vụ / Đào tạo.

## Nguồn HTML
| Files | Path prefix `chi-tiet/` |
|-------|-------------------------|
| Dashboard QT | `Chung/dashboard-quan-tri.html` |
| Hệ thống & hệ ĐT | `Chung/he-thong-he-dao-tao.html` |
| RPOINT hệ | `SRS-01/cau-hinh-rpoint-xp-toan-he.html` |
| Sau thi | `SRS-03/xu-ly-sau-thi.html` |
| Placement | `SRS-09/ket-qua-xep-lop-ai.html` |
| Duyệt đơn | `SRS-11/duyet-don-mot-cua.html` |
| Reports | `SRS-12/bao-cao-skill-gap.html`, `bao-cao-thong-ke.html` |
| Specs | tương ứng `dac-ta.md` |

## Target
```
src/app/(dashboard)/admin/...
src/views/admin-*-view.tsx   ← phẳng, prefix admin-
src/components/ui/admin/
ADMIN_NAV_CONFIG
```

## Routes ưu tiên
1. `/admin` — dashboard  
2. `/admin/systems` — hệ đào tạo  
3. `/admin/leave-requests`  
4. `/admin/placement`  
5. `/admin/rpoint`  
6. `/admin/exams/post`  
7. `/admin/reports`, `/admin/reports/skill-gap`  

## Phụ thuộc
WP-00, WP-02.

## DoD
- [ ] Admin shell + dashboard
- [ ] Ít nhất leave-requests + reports list UI
- [ ] type-check + lint pass

## Prompt gợi ý
> Implement WP-09 admin dashboard from chi-tiet/Chung/dashboard-quan-tri.html.
