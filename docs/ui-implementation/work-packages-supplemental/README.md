# Work packages bổ sung (chi-tiet / SRS)

> **Chưa làm** cho đến khi luồng cơ bản `work-packages/` (extracted-portal) ổn và UI khớp `localhost:4178`.

## Khi nào mở folder này?

Sau khi WP-00…07 xong và product muốn:
- OTP / Google OAuth (SRS-06)
- Portal Giảng viên / Admin
- Giám thị / thi
- Phụ huynh / Doanh nghiệp
- Màn SRS sâu hơn EP (prep 5 bước, heatmap, …)

## Nguồn

`LMS_AI_SPEC/09_Giao_dien_Prototype/chi-tiet/`  
Index: `chi-tiet/00_Ban_do_man_hinh.md`

## Danh sách

| File | Nội dung |
|------|----------|
| [SUPP-01-auth-srs06.md](./SUPP-01-auth-srs06.md) | OTP 2FA + Google login (đã tách khỏi WP-01) |
| [SUPP-08-teacher-portal.md](./SUPP-08-teacher-portal.md) | Portal GV |
| [SUPP-09-admin-portal.md](./SUPP-09-admin-portal.md) | Portal Admin |
| [SUPP-10-exam-invigilator.md](./SUPP-10-exam-invigilator.md) | Thi / giám thị |
| [SUPP-11-peripheral-roles.md](./SUPP-11-peripheral-roles.md) | PH / DN / portfolio public |

## Quy tắc khi làm supplemental

1. Vẫn giữ brand wine EP trừ khi doc nói rõ dual-theme.
2. Mock → `src/mocks/`.
3. Không phá layout SV đã khớp EP.
