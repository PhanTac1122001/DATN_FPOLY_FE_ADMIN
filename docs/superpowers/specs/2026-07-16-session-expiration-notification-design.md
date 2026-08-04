# Design Specification: Session Expiration Notification

Add a notification when the authentication token is missing or expired, warning the user: "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại".

## Proposed Changes

### Approach

We will use **Cookie-based signaling** because it is robust across both full page reloads (triggered by `window.location.href`) and client-side route transitions (triggered by Next.js router), without polluting the URL with query parameters.

1. In [http-client.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/lib/http-client.ts), inside the `handleAuthFailure` function, we will set a temporary cookie `session_expired=1`.
2. In [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts), we will add the translation message for session expiration under `UI_TEXT.auth.login.toasts.sessionExpired`.
3. In [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx), we will add a `useEffect` hook to detect the `session_expired` cookie, trigger the toast notification, and immediately delete the cookie to prevent duplicate alerts on refresh.

### 1. Translation Constants

Add the session expired text to `UI_TEXT.auth.login.toasts`:

```typescript
// src/constants/ui-text.constants.ts
sessionExpired: "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại"
```

### 2. HTTP Client Redirection Signalling

Modify `handleAuthFailure` to set the temporary cookie:

```typescript
// src/lib/http-client.ts
function handleAuthFailure() {
    if (typeof window !== "undefined") {
        const path = window.location.pathname;
        if (path === "/login" || path === "/login/otp") {
            return;
        }
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY, { path: "/" });
        Cookies.remove(APP_CONFIG.ACCESS_TOKEN_KEY);
        Cookies.remove(APP_CONFIG.REFRESH_TOKEN_KEY, { path: "/" });
        Cookies.remove(APP_CONFIG.REFRESH_TOKEN_KEY);

        // Signal that the session has expired
        Cookies.set("session_expired", "1", { path: "/" });

        window.location.href = "/login";
    }
}
```

### 3. Login Form Toast Trigger

Check and show the toast in `LoginForm`:

```typescript
// src/components/ui/auth/login-form.tsx
useEffect(() => {
    const sessionExpired = Cookies.get("session_expired");
    if (sessionExpired) {
        toast.error(UI_TEXT.auth.login.toasts.sessionExpired);
        Cookies.remove("session_expired", { path: "/" });
    }
}, []);
```

## Verification Plan

1. Open the application.
2. Manually clear or corrupt the `access_token` and `refresh_token` cookies.
3. Try to navigate to a protected page (e.g., `/` or `/users`).
4. Verify that you are redirected to `/login` and a toast notification with the message "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại" is displayed.
5. Refresh the `/login` page and verify that the notification does not appear again.
6. Click "Đăng xuất" (Logout) and verify that you are redirected to `/login` *without* the session expiration notification.
