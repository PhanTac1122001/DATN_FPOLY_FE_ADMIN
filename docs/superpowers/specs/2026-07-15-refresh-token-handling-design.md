# Design Spec: Refresh Token and Expiration Redirection

This document specifies the design for updating the refresh token endpoint and ensuring that when tokens expire, users are cleared of authentication state and redirected back to the login page (preserving their current path for post-login redirect).

## Goals

1. Update the refresh token API endpoint to `/v1/auth/refresh-token` (which routes to `http://103.118.29.137:65432/v1/auth/refresh-token` via Next.js rewrites on staging).
2. When the refresh token expires or cannot refresh successfully, clear authentication cookies and redirect the user back to the login page (`/login`).
3. Preserve the user's current route location as a `redirect` query parameter on the login page URL so they can resume their session after logging back in.
4. Apply the redirect to the redirect path after logging in successfully (both on the normal login form and the OTP verification form).

---

## Proposed Changes

### 1. API Endpoints Configuration

Modify `src/constants/api-endpoints.constants.ts` to point the `REFRESH` endpoint to the new path.

#### [MODIFY] [api-endpoints.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/api-endpoints.constants.ts)
- Update `REFRESH` to `"/v1/auth/refresh-token"` from `${API_PREFIX}/auth/staff/refresh`.

---

### 2. HTTP Client Logic

Modify `src/lib/http-client.ts` to handle auth failures and perform redirection.

#### [MODIFY] [http-client.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/lib/http-client.ts)
- Implement `handleAuthFailure()` helper:
  - Check if `typeof window !== "undefined"`.
  - Check if the current pathname is already `/login` or `/login/otp` to prevent infinite redirect loops.
  - Delete authentication cookies: `access_token` and `refresh_token`.
  - Capture current URL path (pathname + query string) using `window.location.pathname + window.location.search`.
  - Set `window.location.href = /login?redirect=${encodeURIComponent(currentPath)}`.
- In `refreshAccessToken()`:
  - Skip execution if `typeof window === "undefined"`.
- In `httpClient()`:
  - Update paths checks from `/auth/refresh` to also check for `/v1/auth/refresh-token` so it does not retry refresh requests indefinitely.
  - Call `handleAuthFailure()` when token refresh fails or throws an error.
- In `runEventStream()`:
  - Call `handleAuthFailure()` when a `401 Unauthorized` error is caught.

---

### 3. Login / OTP Navigation Support

Modify the login and OTP forms to support redirecting back to the original page.

#### [MODIFY] [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)
- Extract the `redirect` query parameter from the URL using `useSearchParams`.
- After successful login, redirect the user to the `redirect` path if present, otherwise default to `ROUTES.HOME`.

#### [MODIFY] [otp-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/otp-form.tsx)
- Retrieve the `redirect` query parameter from `useSearchParams`.
- After successful OTP verification, redirect to the `redirect` path if present, otherwise default to `ROUTES.HOME`.

---

## Verification Plan

### Automated Verification
- Verify the build compiles without errors: `npm run build`.

### Manual Verification
1. Open the application and log in.
2. In the browser Developer Tools -> Application -> Cookies, manually corrupt the `access_token` cookie or set a wrong token to trigger a 401.
3. Perform an action that triggers an API call (e.g., refresh a list).
4. Verify that:
   - The token refresh logic is triggered.
   - Upon refresh failure, the cookies are cleared.
   - The application redirects the user to `/login?redirect=<original-path>`.
5. Log in again and verify that the user is redirected back to the `<original-path>`.
