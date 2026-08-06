# Design: Session Completion Rule (nút riêng)

**Date:** 2026-08-04  
**App:** `lms-portal-admin`  
**API spec:** `lms-portal-api/docs/dynamic_courseware_fe_spec.md` § Điều kiện hoàn thành

## Goal

Gỡ khối Session Rules legacy khỏi form session. Thêm nút **Điều kiện hoàn thành** (chỉ khi sửa buổi) mở modal soạn `completion-rule` qua API riêng.

## UX

- Form session: tên, loại, mô tả, học liệu cơ bản.
- Header edit: nút cạnh icon xóa → modal.
- Create mode: không có nút (chưa có `sessionId`).
- Modal nhãn: *“Buổi này được tính là hoàn thành khi:”*
- Save rule độc lập với “Lưu thay đổi” session.

## API

- `GET/PUT /api/staff/sessions/:sessionId/completion-rule`
- Catalog mục: `GET .../sessions/:id/blocks` + `GET .../lessons/session/:id`
- `items` vắng mặt = mọi mục bắt buộc; `items: []` = không mục; không gửi `groups: []`

## Out of scope

Lesson-level rule, block editor, validate/publish, course sequential unlock.
