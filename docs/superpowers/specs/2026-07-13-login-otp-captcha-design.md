# Tài liệu thiết kế: Tích hợp Captcha và trang OTP cho Đăng nhập Staff

Tài liệu này đặc tả việc thay đổi API Endpoint Login, tích hợp widget Captcha (Cloudflare Turnstile) vào trang Login của Staff, và tạo thêm trang xác thực mã OTP gửi về email.

---

## 1. Yêu cầu & Mục tiêu

* **Thay đổi Endpoint Login**: Chuyển đổi endpoint gọi API đăng nhập từ `/api/auth/staff/login` sang `/v1/auth/login/staff` trực tiếp trên backend (không qua proxy rewrite của Next.js).
* **Payload Đăng nhập mới**:
  ```json
  {
    "email": "tintert1703@gmail.com",
    "password": "tintert1703@gmail.com",
    "recaptchaToken": "string",
    "clientId": "lms"
  }
  ```
* **Tích hợp Captcha**: Thêm widget Cloudflare Turnstile ở phía dưới nút Đăng nhập tại trang `/login`. Khi xác thực thành công, nhận token và đưa vào trường `recaptchaToken` của payload đăng nhập.
* **Trang xác thực OTP**: 
  * Sau khi gửi yêu cầu login thành công (backend đã gửi mã OTP 6 số về email), chuyển hướng người dùng sang trang `/login/otp`.
  * Giao diện nhập mã OTP gồm 6 ô số liên tiếp, tự động focus, hỗ trợ paste và backspace.
  * Khi người dùng nhấn nút xác thực, gọi API xác thực OTP `/v1/auth/login/staff/verify-otp` với payload:
    ```json
    {
      "otp": "123456",
      "email": "teacher@example.com"
    }
    ```
  * Nhận `accessToken` và `refreshToken` từ kết quả API OTP, lưu vào cookies và chuyển hướng người dùng về trang chủ (`/`).

---

## 2. Thay đổi chi tiết các File

### Hằng số & Cấu hình (Constants & Types)

#### [MODIFY] [api-endpoints.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/api-endpoints.constants.ts)
* Cập nhật `AUTH.LOGIN` thành `/v1/auth/login/staff`.
* Thêm `AUTH.VERIFY_OTP` thành `/v1/auth/login/staff/verify-otp`.

#### [MODIFY] [auth.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/auth.types.ts)
* Cập nhật interface `LoginRequest` để nhận các thuộc tính: `email`, `password`, `recaptchaToken`, và `clientId`.
* Thêm interface `VerifyOtpRequest` chứa: `email` và `otp`.

### Dịch vụ xử lý API (Services)

#### [MODIFY] [auth.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/auth.service.ts)
* Hàm `login`: cập nhật kiểu tham số truyền vào thành `LoginRequest`. Do API Login chỉ kích hoạt gửi OTP và chưa trả về token trực tiếp, thay đổi kiểu trả về thành một kiểu dữ liệu chung (ví dụ `{ message?: string }`).
* Thêm hàm `verifyOtp(data: VerifyOtpRequest): Promise<LoginResponse>` để gọi API xác thực OTP và trả về token truy cập (`accessToken` & `refreshToken`).

### Giao diện & Components (Views & UIs)

#### [MODIFY] [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)
* Tích hợp component `TurnstileWidget` (đã có sẵn trong codebase) ở vị trí nằm ngay phía dưới nút Đăng nhập.
* Lưu `recaptchaToken` vào state khi widget kích hoạt `onVerify`.
* Khi submit form, gọi hàm `login` với payload:
  * `email`, `password` từ form.
  * `recaptchaToken` từ state của widget.
  * `clientId` là `"lms"`.
* Nếu login thành công, lưu `email` vào `sessionStorage` (để dùng ở trang OTP) và chuyển hướng sang `/login/otp`.

#### [NEW] Trang OTP (`/login/otp`)
Tạo cấu trúc thư mục và các file sau:
* **[NEW] Page & Layout**:
  * [layout.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/login/otp/layout.tsx): Kế thừa giao diện chung của Auth.
  * [page.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/login/otp/page.tsx): Khởi tạo và render `OtpView`.
* **[NEW] View**:
  * [otp-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/otp-view.tsx): Kiểm tra email từ `sessionStorage`. Nếu không có, redirect về trang đăng nhập `/login`. Render component `OtpForm` bên trong `AuthShell`.
* **[NEW] Component**:
  * [otp-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/otp-form.tsx): Giao diện nhập OTP.
    * 6 ô nhập chữ số riêng biệt với cơ chế focus chuyển tiếp tự động khi gõ.
    * Nút gửi lại mã OTP (gọi lại API Login để nhận mã mới).
    * Khi submit thành công, gọi API `/v1/auth/login/staff/verify-otp`, lưu token vào cookie và điều hướng vào trang chủ `/`.

---

## 3. Kế hoạch xác minh (Verification Plan)

### Kiểm thử thủ công (Manual Verification)
1. **Kiểm tra Captcha**:
   * Truy cập trang `/login`. 
   * Kiểm tra xem widget Cloudflare Turnstile có xuất hiện bên dưới nút Đăng nhập hay không.
   * Thử submit form khi chưa verify Captcha -> hiển thị thông báo lỗi.
2. **Kiểm tra quá trình Login & OTP**:
   * Điền đúng tài khoản, verify Captcha và nhấn Đăng nhập.
   * Kiểm tra xem tab Network có gọi tới `http://103.118.29.137:65432/v1/auth/login/staff` với payload chứa `recaptchaToken` và `clientId: "lms"` hay không.
   * Sau khi thành công, kiểm tra xem trình duyệt có tự động chuyển hướng sang `/login/otp`.
   * Nhập mã OTP gồm 6 số (mã gửi về email của bạn).
   * Nhấn xác thực và kiểm tra xem có gọi API `/v1/auth/login/staff/verify-otp` với mã otp và email hay không.
   * Khi OTP thành công, kiểm tra xem `lms_access_token` và `lms_refresh_token` đã được lưu vào cookie và chuyển hướng về trang chủ thành công hay chưa.
