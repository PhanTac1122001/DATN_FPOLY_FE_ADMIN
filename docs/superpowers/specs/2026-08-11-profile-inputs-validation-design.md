# Design Spec: Standardize Profile Inputs & Validation

## Goal
Standardize the user profile forms in `lms-portal-admin` (`src/views/profile/profile-view.tsx`) by replacing native HTML `<input>` and `<select>` elements with the project's base UI components (`Input`, `Select`, `SelectItem`) and using `react-hook-form` paired with `zod` schemas for form state and inline validation.

## Scope of Changes

### 1. Schema Definitions (`src/schemas/auth.schema.ts`)
- Define `updateProfileSchema`:
  - `fullName`: required string with non-empty validation error message (`UI_TEXT.profile.toastFullNameRequired` or standard error message).
  - `phone`: optional string, validated against phone format or allows empty string.
  - `gender`: optional enum (`MALE`, `FEMALE`, `OTHER`).
  - `address`: optional string.
- Export `UpdateProfileFormData` type inferred from `updateProfileSchema`.
- Reuse existing `changePasswordSchema` for password updates.

### 2. UI & Form Components (`src/views/profile/profile-view.tsx`)
- **Tab 1: Personal Information (`Thông tin cá nhân`)**
  - Use `useForm<UpdateProfileFormData>` with `zodResolver(updateProfileSchema)`.
  - Populate default values when `user` data loads.
  - Form Fields:
    - **Họ và tên**: `<Controller>` rendering `<Input label="..." placeholder="..." isInvalid={!!errors.fullName} hint={errors.fullName?.message} />`
    - **Số điện thoại**: `<Controller>` rendering `<Input label="..." placeholder="..." isInvalid={!!errors.phone} hint={errors.phone?.message} />`
    - **Giới tính**: `<Controller>` rendering `<Select label="..." isInvalid={!!errors.gender} hint={errors.gender?.message}>` with `SelectItem` options (`MALE`, `FEMALE`, `OTHER`).
    - **Email**: `<Input label="..." type="email" value={user?.email || ""} isDisabled />`
    - **Địa chỉ liên hệ**: `<Controller>` rendering `<Input label="..." placeholder="..." isInvalid={!!errors.address} hint={errors.address?.message} />`
  - Form Submit: invoke `updateProfile` API service and show success toast on completion.

- **Tab 2: Change Password (`Đổi mật khẩu`)**
  - Use `useForm<ChangePasswordFormData>` with `zodResolver(changePasswordSchema)`.
  - Form Fields:
    - **Mật khẩu hiện tại**: `<Controller>` rendering `<Input type="password" label="..." showPassword={showCurrentPassword} onTogglePassword={() => setShowCurrentPassword(!showCurrentPassword)} isInvalid={!!errors.currentPassword} hint={errors.currentPassword?.message} />`
    - **Mật khẩu mới**: `<Controller>` rendering `<Input type="password" label="..." showPassword={showNewPassword} onTogglePassword={() => setShowNewPassword(!showNewPassword)} isInvalid={!!errors.newPassword} hint={errors.newPassword?.message} />`
    - **Xác nhận mật khẩu mới**: `<Controller>` rendering `<Input type="password" label="..." showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)} isInvalid={!!errors.confirmPassword} hint={errors.confirmPassword?.message} />`
  - Form Submit: invoke `changePassword` API service, reset form on success, and show success toast.

## Component Imports & Dependencies
- `Input` from `@/components/base/input/input`
- `Select` from `@/components/base/select/select`
- `SelectItem` from `@/components/base/select/select-item`
- `useForm`, `Controller` from `react-hook-form`
- `zodResolver` from `@hookform/resolvers/zod`
