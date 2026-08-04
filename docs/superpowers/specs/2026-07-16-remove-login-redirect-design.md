# Design Spec: Remove Login Redirection Mechanism

This document specifies the design for removing the post-login redirection mechanism. When tokens expire or unauthenticated users access protected paths, they will be redirected to the login page, but their subsequent login will navigate directly to the default home page rather than returning to the original path.

## Proposed Changes

### [HTTP Client]

#### [MODIFY] [http-client.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/lib/http-client.ts)
- Modify the `handleAuthFailure` function to redirect unauthenticated users to `/login` instead of `/login?redirect=...`.

### [Authentication Forms]

#### [MODIFY] [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)
- Remove `useSearchParams` hook and `redirectUrl` parameter extraction.
- Update the login success callback to navigate directly to `ROUTES.HOME` instead of checking for `redirectUrl`.

#### [MODIFY] [otp-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/otp-form.tsx)
- Remove `useSearchParams` hook and `redirectUrl` parameter extraction.
- Update the OTP verification success callback to navigate directly to `ROUTES.HOME`.
- Update error redirection and back-to-login link to use `ROUTES.LOGIN` directly without appending `redirectUrl`.

## Verification Plan

### Manual Verification
1. Access a protected page (e.g. `/users`) without authentication or invalidate the authentication cookies manually.
2. Confirm the app redirects to `/login` without a `redirect` query parameter in the URL.
3. Log in successfully and verify that the user is navigated directly to the default homepage (`/`) instead of `/users`.
