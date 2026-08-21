# Guided Help (Tour onboarding + Tooltip) — Pilot: `type-detail-course`

Date: 2026-08-21
Status: Approved design, pending spec review

## Mục tiêu

Giúp user dễ sử dụng các màn admin bằng 2 lớp hướng dẫn bổ trợ nhau:

1. **Tour onboarding từng bước** — highlight các phần tử chính của màn và giải thích, chạy khi user chủ động bấm.
2. **Tooltip (?) tra cứu nhanh** — chú thích ngắn cạnh các trường/nút khó hiểu, hover/click để xem.

Làm trọn vẹn cho **1 màn pilot phức tạp nhất** (`type-detail-course` — builder khóa học/lộ trình), chốt pattern rồi mới nhân rộng sang các màn khác.

## Quyết định đã chốt

- **Tour**: dùng thư viện `driver.js`, bọc 1 hook wrapper để style theo token repo và điều khiển vòng đời tour.
- **Tooltip**: dùng lại `Tooltip` base có sẵn (`src/components/base/tooltip/tooltip.tsx`, react-aria) — không thêm lib.
- **Kích hoạt**: **chỉ chạy khi bấm nút (?)** trên header. Không tự chạy lần đầu, **không** cần lưu trạng thái `localStorage`.
- **Nội dung**: 6 bước tour + 3 tooltip (chi tiết bên dưới).
- **Text**: tất cả chuỗi hiển thị nằm trong `UI_TEXT` (repo cấm hardcode string).

## Kiến trúc

### Thành phần

| Đơn vị | Vị trí | Trách nhiệm |
|---|---|---|
| `useGuidedTour(steps, options?)` | `src/hooks/use-guided-tour.ts` | Khởi tạo driver.js với config đã style theo token; trả về `{ start }` để mở tour; tự dọn dẹp instance khi unmount. Không có logic persistence. |
| `type-detail-course.tour.ts` | `src/components/application/type-detail-course/` | Export mảng `steps` cho màn pilot: mỗi step = `{ element: '[data-tour="..."]', popover: { title, description } }`, text lấy từ `UI_TEXT.guidedTour.typeDetailCourse`. |
| `guided-tour.css` | `src/styles/` (hoặc import global) | Map các biến `--driver-*` của driver.js sang màu/token repo (wine, brand, slate…). Tách riêng để không rải hex trong TSX/eslint. |
| `UI_TEXT.guidedTour` | `src/constants/ui-text.constants.ts` | Nhánh text mới: tiêu đề + mô tả 6 bước, nhãn nút "Hướng dẫn", nhãn Bắt đầu/Tiếp/Trước/Xong, 3 tooltip. |
| Nút "?" (Hướng dẫn) | Header của `type-detail-course-view.tsx` | Bấm để gọi `start()` mở tour. |
| Thuộc tính `data-tour` | Các phần tử neo trong view + SessionForm | Selector ổn định cho driver.js (không phụ thuộc class). |

### Luồng

1. View render, gọi `const { start } = useGuidedTour(typeDetailCourseSteps)`.
2. User bấm nút "?" → `start()` → driver.js highlight tuần tự các phần tử theo `data-tour`.
3. Tour tự kết thúc/đóng khi user bấm "Xong" hoặc Esc/overlay. Hook không lưu gì.
4. Độc lập với tour: các Tooltip (?) luôn sẵn sàng, hover/click để xem.

### Neo phần tử (`data-tour`)

| Bước | `data-tour` | Phần tử trong `type-detail-course-view.tsx` |
|---|---|---|
| 1. Tổng quan | `workspace` | container chính 2 cột (dòng ~431) |
| 2. Cấu trúc khóa học (kéo-thả) | `course-structure` | cột trái danh sách session (dòng ~433) |
| 3. Thêm buổi học | `add-session` | nút "Thêm chương/buổi học" (dòng ~537) |
| 4. Vùng cấu hình | `config-panel` | cột phải (dòng ~548) |
| 5. Điều kiện hoàn thành | `completion-conditions` | nút "Điều kiện hoàn thành" (dòng ~398) |
| 6. Lưu thay đổi | `save` | nút "Lưu thay đổi" (dòng ~409) |

> Lưu ý bước 5: nút "Điều kiện hoàn thành" chỉ render khi `sortedSessions.length > 0`. Step tour trỏ tới nó cần bỏ qua an toàn nếu phần tử không tồn tại (driver.js tự skip step khi selector không match; xác nhận bằng option `element` optional).

### Vị trí Tooltip (?) (3 chỗ)

| Tooltip | File | Nội dung ngắn |
|---|---|---|
| Nút "Điều kiện hoàn thành" | `type-detail-course-view.tsx` | Thiết lập điều kiện học viên phải đạt để hoàn thành buổi học. |
| Trường "Số lần AI chấm" (`maxAiGradeAttempts`) | `session-form.tsx` (hoặc `practice-form-fields.tsx` nơi render field) | Giới hạn số lần AI chấm lại bài của học viên. |
| Kéo-thả session node | `session-node.tsx` (hoặc icon handle) | Kéo để đổi thứ tự buổi học. |

## Nội dung 6 bước tour (bản nháp text, sẽ nằm trong UI_TEXT)

1. **Tổng quan** — "Đây là khu vực dựng khóa học. Bên trái là cấu trúc, bên phải là nơi cấu hình chi tiết."
2. **Cấu trúc khóa học** — "Danh sách các buổi học. Bạn có thể kéo-thả để đổi thứ tự."
3. **Thêm buổi học** — "Bấm đây để thêm một buổi học mới vào khóa học."
4. **Vùng cấu hình** — "Chọn một buổi/bài học ở bên trái để cấu hình video, tài liệu đọc hoặc quiz tại đây."
5. **Điều kiện hoàn thành** — "Thiết lập điều kiện học viên phải đạt để được tính hoàn thành."
6. **Lưu thay đổi** — "Nhớ bấm Lưu sau khi chỉnh sửa. Hệ thống sẽ cảnh báo nếu bạn rời trang khi chưa lưu."

(Text tiếng Việt cuối cùng sẽ được tinh chỉnh khi implement.)

## Ràng buộc & quy ước repo

- ESLint cực nghiêm (`--max-warnings=0`): không hardcode string trong component, không hex/màu thô, không `interface` trong file component. → text vào `UI_TEXT`, màu driver map qua CSS var.
- Import order theo `@trivago/prettier-plugin-sort-imports`.
- `driver.js` là dependency mới → thêm qua `pnpm add driver.js`.

## Ngoài phạm vi (YAGNI)

- Không tự chạy tour lần đầu, không lưu trạng thái đã xem.
- Không làm tour cho các màn khác trong đợt này.
- Không đa ngôn ngữ (chỉ tiếng Việt như phần còn lại của app).
- Không phân tích/telemetry lượt xem tour.

## Kiểm thử / nghiệm thu

- `pnpm lint:check` và `pnpm type-check` sạch trên các file thay đổi.
- Bấm nút "?" mở tour, đi hết 6 bước, highlight đúng phần tử; Esc/Xong đóng gọn.
- Khi khóa học chưa có buổi học nào (không có nút "Điều kiện hoàn thành"), tour vẫn chạy không lỗi (skip step 5).
- 3 tooltip hiện đúng nội dung khi hover/click.
- Kiểm chứng trực quan trên dev server (screenshot).

## Nhân rộng (sau pilot)

Mỗi màn mới chỉ cần: (1) tạo file `*.tour.ts`, (2) gắn `data-tour` vào phần tử, (3) thêm nhánh text trong `UI_TEXT.guidedTour`, (4) đặt nút "?" + gọi `useGuidedTour`. Hook và CSS wrapper dùng chung.
