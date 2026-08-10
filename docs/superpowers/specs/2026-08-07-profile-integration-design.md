# Profile API Integration & Personal Profile Page Spec

## 1. Overview
The goal is to connect the backend Staff Profile APIs (`GET /api/staff/profile/me`, `PUT /api/staff/profile/me`, `POST /api/staff/profile/avatar/upload`, `PUT /api/staff/password/change`) with the `lms-portal-admin` frontend Header and a dedicated Personal Profile Page (`/profile`).

## 2. Core Features & User Experience

### 2.1 Admin Header Profile Dropdown (`AdminHeader`)
- Transform the static user box into an interactive User Profile Menu (`UserDropdown`).
- Displays:
  - User Full Name & Role label.
  - Avatar image or dynamic Initials badge.
  - Dropdown Menu containing:
    - User Header Summary (Avatar, Name, Email, Role badge).
    - Link to **Trang cá nhân** (`/profile`).
    - Link to **Đổi mật khẩu** (`/profile?tab=password`).
    - **Đăng xuất** action button.

### 2.2 Personal Profile Page (`/profile`)
- Route: `/profile` (Next.js App router: `src/app/profile/page.tsx`).
- Components & Views: `src/views/profile/profile-view.tsx`.
- Layout:
  - **Profile Summary Header / Side Card**:
    - Interactive Avatar Uploader with hover overlay / file drop.
    - Staff Code, Full Name, Email, Roles, Status badge, Member since date.
  - **Tab Navigation**:
    - **Tab 1: Thông tin cá nhân (Personal Information)**
      - Fields: Họ và tên (`fullName`), Số điện thoại (`phone`), Địa chỉ (`address`), Giới tính (`gender`: `MALE`, `FEMALE`, `OTHER`).
      - Read-only details: Email, Mã nhân viên (`staffCode`), Quyền hạn (`roles`).
      - "Lưu thay đổi" (Save Changes) button with loading state & `toast.success`.
    - **Tab 2: Đổi mật khẩu (Change Password)**
      - Fields: Mật khẩu hiện tại (`currentPassword`), Mật khẩu mới (`newPassword`), Xác nhận mật khẩu mới (`confirmPassword`).
      - Client-side validation for password match & min length.
      - "Đổi mật khẩu" button with backend error handling & success feedback.

### 2.3 API Service & Data Layer (`auth.service.ts`)
- **API Mapping Updates**:
  - `getProfile()`: Ensure `phone`, `address`, `gender`, `staffCode`, `avatar` are properly parsed into `UserProfile`.
  - `updateProfile(data)`: Sends `PUT /api/staff/profile/me` with `{ fullName, phone, address, gender, avatar }`.
  - `uploadAvatar(file)`: Sends `POST /api/staff/profile/avatar/upload` with FormData `avatar`.
  - `changePassword(data)`: Sends `PUT /api/staff/password/change` with `{ currentPassword, newPassword, confirmPassword }`.
- **Query Cache Management**:
  - React Query mutation invalidates `queryKeys.profile()` upon profile/avatar update, triggering instant header & UI updates.

## 3. UI Aesthetics & Accessibility
- Follow existing design system with glassmorphism header, brand wine/slate color palette, smooth micro-interactions, responsive tabs, and clear loading/error feedback.
