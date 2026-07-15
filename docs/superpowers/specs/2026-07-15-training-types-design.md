# Thiết kế Trang Hệ Đào Tạo E-Learning (/type)

Đại diện cho việc nâng cấp và thiết kế trang **Hệ đào tạo** thuộc phần quản lý E-Learning. Trang này sẽ đổi đường dẫn từ `/training-systems-el` sang `/type` và được hiển thị theo phong cách tương tự như trang quản lý nhân viên (Staff list).

## Yêu cầu thiết kế

1. **Đường dẫn URL**: Thay đổi từ `/training-systems-el` thành `/type`.
2. **Giao diện danh sách**:
   - Thiết kế dạng bảng phẳng, bo góc viền nhẹ tương tự giao diện Staff.
   - Hỗ trợ bộ lọc tìm kiếm cơ bản (nhập tên hệ, chuyên ngành).
   - Nút hành động hiển thị icon con mắt màu xanh biển để đi vào trang chi tiết.
3. **Giao diện chi tiết (`/type/[id]`)**:
   - Có thanh Breadcrumb ở trên cùng để quay lại danh sách (`Quản lý E-Learning / Hệ đào tạo / Chi tiết`).
   - Thẻ thông tin đầu trang chứa 3 cột: Mã hệ đào tạo, Tên hệ đào tạo, Ngày tạo.
   - Hỗ trợ thanh tìm kiếm kỳ học và nút Sắp xếp.
   - Bảng hiển thị danh sách kỳ học với cột: ID, Hệ đào tạo, Chuyên ngành, Kỳ học (Badge tương ứng: Hướng dẫn - màu vàng, Kỳ I - màu xanh biển, Kỳ II - màu xanh lá, Kỳ III - màu cam, Kỳ IV - màu đỏ), Hành động (Nút "Danh sách môn học" viền đỏ/nâu rượu).
4. **Dữ liệu giả lập**:
   - 9 hệ đào tạo chính xác theo danh sách trong ảnh chụp.
   - Dữ liệu kỳ học tương ứng cho từng hệ.

## Cấu trúc dữ liệu giả lập (Mock Data)

Tạo hằng số chứa dữ liệu tại `src/constants/type-mock.constants.ts`.

## Kế hoạch triển khai tập tin

- `src/constants/admin-sidebar.constants.ts` (Sửa path hệ đào tạo E-Learning thành `/type`)
- `src/app/type/page.tsx` (Trang Next.js danh sách)
- `src/app/type/[id]/page.tsx` (Trang Next.js chi tiết)
- `src/views/type-list-view.tsx` (View danh sách hệ đào tạo)
- `src/views/type-detail-view.tsx` (View chi tiết kỳ học)
- `src/constants/type-mock.constants.ts` (Mock data)
