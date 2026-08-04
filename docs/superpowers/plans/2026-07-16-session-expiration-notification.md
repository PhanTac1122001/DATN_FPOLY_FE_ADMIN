# Session Expiration Notification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a toast notification "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại" when the user session has expired or is missing.

**Architecture:** Use a temporary client cookie `session_expired` set by the API helper upon authentication/authorization failures. The `LoginForm` component reads the cookie on mount, triggers the toast, and cleans up the cookie.

**Tech Stack:** React, Next.js, js-cookie, Sonner toast service

## Global Constraints
- Keep component and translation structures clean and consistent with current patterns.
- Do not clutter the URL with query parameters.
- Clean up any session signaling state immediately after use to avoid repetitive warnings.

---

### Task 1: Add Session Expiration Message to Translations

**Files:**
- Modify: `src/constants/ui-text.constants.ts:185-193`

**Interfaces:**
- Produces: `UI_TEXT.auth.login.toasts.sessionExpired` of type `string`.

- [ ] **Step 1: Modify translation file**

Modify [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts) to add the session expired message key under `UI_TEXT.auth.login.toasts`.

```typescript
            toasts: {
                successTitle: "Đăng nhập thành công",
                successDescription: "Chào mừng bạn quay trở lại!",
                errorTitle: "Đăng nhập thất bại",
                captchaRequiredTitle: "Vui lòng hoàn thành Captcha",
                captchaRequiredDesc: "Bạn cần xác minh danh tính trước khi đăng nhập.",
                otpSentTitle: "Mã OTP đã được gửi",
                otpSentDesc: "Vui lòng kiểm tra email để nhận mã xác thực.",
                sessionExpired: "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại",
            },
```

- [ ] **Step 2: Verify code syntax and TypeScript compilation**

Run type-checker command:
```powershell
pnpm run type-check
```
Expected: No type-check errors related to translation constants.

- [ ] **Step 3: Commit changes**

```bash
git add src/constants/ui-text.constants.ts
git commit -m "feat(auth): add sessionExpired translation constant"
```

---

### Task 2: Signal Expiration in HTTP Client

**Files:**
- Modify: `src/lib/http-client.ts:65-78`

**Interfaces:**
- Consumes: None
- Produces: Sets client cookie `session_expired` when authentication fails.

- [ ] **Step 1: Modify handleAuthFailure**

Modify [http-client.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/lib/http-client.ts) inside `handleAuthFailure` to set the `session_expired` cookie with a brief expiry time (e.g. 1 minute) before executing redirection.

```typescript
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

- [ ] **Step 2: Run type check**

Run command:
```powershell
pnpm run type-check
```
Expected: No errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/lib/http-client.ts
git commit -m "feat(auth): set session_expired cookie in handleAuthFailure"
```

---

### Task 3: Detect Cookie and Trigger Notification on Login Form

**Files:**
- Modify: `src/components/ui/auth/login-form.tsx:37-46`

**Interfaces:**
- Consumes: `session_expired` cookie and `UI_TEXT.auth.login.toasts.sessionExpired`.

- [ ] **Step 1: Check and toast inside LoginForm**

Modify [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx) by adding a `useEffect` on mount that checks for the `session_expired` cookie. If found, it triggers `toast.error` and removes the cookie.

```typescript
    useEffect(() => {
        const sessionExpired = Cookies.get("session_expired");
        if (sessionExpired) {
            toast.error(UI_TEXT.auth.login.toasts.sessionExpired);
            Cookies.remove("session_expired", { path: "/" });
        }
    }, []);
```

- [ ] **Step 2: Run verification and code builds**

Run commands:
```powershell
pnpm run type-check
pnpm run lint
```
Expected: Zero compilation or linting errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/components/ui/auth/login-form.tsx
git commit -m "feat(auth): detect session_expired cookie and trigger toast error in LoginForm"
```

---

## Verification Plan

### Manual Verification
1. Access the LMS app and log in.
2. Under the browser developer tools -> Application -> Cookies, delete the `access_token` and `refresh_token` cookies.
3. Refresh the page or click a page navigation tab.
4. Verify you are redirected to `/login` and see the toast error "Phiên đăng nhập của bạn đã hết vui lòng đăng nhập lại".
5. Refresh `/login` and verify the toast does not show again.
6. Log in, then click "Đăng xuất" (Logout). Confirm redirection to `/login` occurs without any warning toast.
