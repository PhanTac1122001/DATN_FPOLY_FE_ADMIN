# Remove Login Redirection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the post-login redirect mechanism so that users are always redirected to the default home screen upon logging in.

**Architecture:** Remove query parameter logic for `redirect` in `http-client.ts`, `login-form.tsx`, and `otp-form.tsx`. Successful logins will navigate directly to `ROUTES.HOME` (homepage).

**Tech Stack:** Next.js, React, TypeScript.

## Global Constraints

- No external redirect parameter should be parsed or constructed for auth redirection.
- Users must always land on the home dashboard page (`ROUTES.HOME`) after logging in successfully.

---

### Task 1: Update HTTP Client redirection logic

**Files:**
- Modify: `src/lib/http-client.ts`

**Interfaces:**
- Produces: Redirection directly to `/login` when token refresh/authorization fails.

- [ ] **Step 1: Modify handleAuthFailure**
  Locate `handleAuthFailure` function and change the redirect line to `/login` instead of `/login?redirect=...`.
  
  ```typescript
  // In src/lib/http-client.ts:65-79
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
  
          window.location.href = "/login";
      }
  }
  ```

- [ ] **Step 2: Commit changes**
  
  ```bash
  git add src/lib/http-client.ts
  git commit -m "refactor: remove redirect query param from handleAuthFailure"
  ```

---

### Task 2: Update LoginForm redirection logic

**Files:**
- Modify: `src/components/ui/auth/login-form.tsx`

**Interfaces:**
- Produces: Direct navigation to `ROUTES.HOME` upon successful email/password authentication.

- [ ] **Step 1: Remove redirectUrl extraction and update onSubmit redirect**
  Modify the `LoginForm` component to remove `useSearchParams`, `redirectUrl`, and update navigation to go to `ROUTES.HOME` directly.
  
  ```typescript
  // In src/components/ui/auth/login-form.tsx
  // Remove import: import { useSearchParams } from "next/navigation"; if not used elsewhere.
  // Remove searchParams and redirectUrl hooks:
  // const searchParams = useSearchParams();
  // const redirectUrl = searchParams.get("redirect");
  
  // Update onSubmit:
  toast.success(UI_TEXT.auth.login.toasts.successTitle, UI_TEXT.auth.login.toasts.successDescription);
  router.replace(ROUTES.HOME as Route);
  ```

- [ ] **Step 2: Commit changes**
  
  ```bash
  git add src/components/ui/auth/login-form.tsx
  git commit -m "refactor: remove redirect URL query parameter handling from LoginForm"
  ```

---

### Task 3: Update OtpForm redirection logic

**Files:**
- Modify: `src/components/ui/auth/otp-form.tsx`

**Interfaces:**
- Produces: Direct navigation to `ROUTES.HOME` upon successful OTP verification.

- [ ] **Step 1: Remove redirectUrl extraction and update routing**
  Modify `OtpForm` to remove `useSearchParams` and `redirectUrl`. Update submit success redirection to go directly to `ROUTES.HOME`. Update error redirection and footer links to use `ROUTES.LOGIN` directly.
  
  ```typescript
  // In src/components/ui/auth/otp-form.tsx:
  // Remove import: import { useSearchParams } from "next/navigation";
  // Remove hooks:
  // const searchParams = useSearchParams();
  // const redirectUrl = searchParams.get("redirect");
  
  // In handleSubmit success:
  toast.success(
      UI_TEXT.auth.otp.toasts.successTitle,
      UI_TEXT.auth.otp.toasts.successDesc,
  );
  sessionStorage.removeItem("login_email");
  router.replace(ROUTES.HOME as Route);
  
  // In handleSubmit error redirect:
  if (error instanceof HttpError) {
      if (error.status === HTTP_STATUS_FORBIDDEN || error.message.includes("quá số lần cho phép")) {
          sessionStorage.removeItem("login_email");
          router.replace(ROUTES.LOGIN as Route);
      }
  }
  
  // In JSX Link element:
  <Link
      href={ROUTES.LOGIN}
      onClick={() => {
          sessionStorage.removeItem("login_email");
      }}
      className="text-xs font-bold text-slate-500 hover:text-slate-700"
  >
      {UI_TEXT.auth.otp.backToLogin}
  </Link>
  ```

- [ ] **Step 2: Commit changes**
  
  ```bash
  git add src/components/ui/auth/otp-form.tsx
  git commit -m "refactor: remove redirect URL query parameter handling from OtpForm"
  ```
