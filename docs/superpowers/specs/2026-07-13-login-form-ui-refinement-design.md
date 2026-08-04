# Design Specification: Login Form UI Refinement

This document outlines the design and implementation details for updating the Login Form UI in the staff portal to include placeholders, visible required indicators/validation behavior, and a password visibility toggle.

## Proposed Design Details

### 1. Placeholders
- Add `emailPlaceholder: "Nhập email"` and `passwordPlaceholder: "Nhập mật khẩu"` to `UI_TEXT.auth.login` in [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts).
- Update the `<input>` fields in [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx) to pass these placeholders.

### 2. Required Validation Indicators
- Modify the labels in [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx) to display a red asterisk (`*`) indicating required inputs:
  - `Email *`
  - `Mật khẩu *`
- Update the `useForm` initialization in [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx) to use `mode: "onTouched"`. This will trigger required validation when inputs are focused and blurred, improving the user feedback loop.

### 3. Password Visibility Toggle
- Introduce a state `showPassword` (boolean, default: `false`) in the `LoginForm` component.
- Wrap the password `<input>` in a container with a `relative` layout.
- Add an absolute-positioned button on the right side of the password field containing the `Eye` / `EyeSlash` icon.
- Dynamically toggle the `<input type="...">` attribute between `"password"` and `"text"` based on the state.
- Add right padding (`pr-10`) to the password input to prevent text overlap.

## Verification Plan

### Automated Tests
- Run `npm run type-check` to verify no TypeScript compilation errors.
- Run `npm run lint` to check for style/linting errors.

### Manual Verification
- Access the login page in the browser.
- Verify placeholders are displayed inside the email and password inputs.
- Verify the red asterisks `*` are rendered next to the labels.
- Blur empty fields and verify the validation messages are triggered dynamically.
- Click the eye icon to toggle visibility of the typed password.
