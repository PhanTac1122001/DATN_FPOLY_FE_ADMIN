# Refresh Token & Expiration Redirection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the refresh token endpoint and redirect users to the login page (with the original route path as a query parameter) when their tokens expire or fail to refresh.

**Architecture:** 
1. Point `API_ENDPOINTS.AUTH.REFRESH` to `/v1/auth/refresh-token`.
2. Add a `handleAuthFailure()` utility in `httpClient` to clear cookies and redirect to `/login?redirect=...`.
3. Call `handleAuthFailure()` when a `401 Unauthorized` response cannot be refreshed (both in regular requests and EventStreams).
4. Update `LoginForm` and `OtpForm` to read the `redirect` search param and navigate to it after successful login/verification.

**Tech Stack:** Next.js (App Router), React, TanStack Query, js-cookie.

## Global Constraints
- Do not use TailwindCSS classes unless already matching existing styles in the code.
- Keep components focused and follow existing coding standards.
- Clear cookies on both path `/` and without path options to ensure they are deleted cleanly.

---

### Task 1: Update API Endpoint Constants

**Files:**
- Modify: `src/constants/api-endpoints.constants.ts`

**Interfaces:**
- Produces: Updated `API_ENDPOINTS.AUTH.REFRESH` constant mapping to `"/v1/auth/refresh-token"`.

- [ ] **Step 1: Modify the constant value**
  Modify [api-endpoints.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/api-endpoints.constants.ts) to update `REFRESH` inside `API_ENDPOINTS.AUTH`.
  Code to replace:
  ```typescript
  REFRESH: `${API_PREFIX}/auth/staff/refresh`,
  ```
  with:
  ```typescript
  REFRESH: "/v1/auth/refresh-token",
  ```

- [ ] **Step 2: Commit changes**
  ```bash
  git add src/constants/api-endpoints.constants.ts
  git commit -m "config: update REFRESH token endpoint constant"
  ```

---

### Task 2: Implement Failure Redirection in HTTP Client

**Files:**
- Modify: `src/lib/http-client.ts`

**Interfaces:**
- Consumes: `API_ENDPOINTS.AUTH.REFRESH` from `src/constants/api-endpoints.constants.ts`.
- Produces: Global client-side redirect when unauthorized and token refresh fails.

- [ ] **Step 1: Add handleAuthFailure helper & Update check path condition**
  In [http-client.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/lib/http-client.ts), define the `handleAuthFailure` helper at the top level and ensure it doesn't cause redirect loops.
  Update the skip refresh check condition to also check `/v1/auth/refresh-token`.
  Show code to add/modify:
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

          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
  }
  ```

  And change line 169-172 check:
  ```typescript
          if (error instanceof HttpError && error.status === HTTP_STATUS_UNAUTHORIZED) {
              if (path.includes("/auth/refresh") || path.includes("/auth/refresh-token") || path.includes("/auth/login")) {
                  throw error;
              }
  ```

- [ ] **Step 2: Call handleAuthFailure on refresh token fail**
  In `httpClient` (inside the `try` block of the `error.status === HTTP_STATUS_UNAUTHORIZED` handler):
  ```typescript
              try {
                  const refreshed = await refreshAccessToken(baseUrl);

                  if (refreshed) {
                      processQueue(null);
                      return httpClient<TResponse>(path, options);
                  }

                  const refreshError = new HttpError(HTTP_STATUS_UNAUTHORIZED, "Token refresh failed");
                  processQueue(refreshError);
                  handleAuthFailure();
                  throw refreshError;
              } catch (refreshError) {
                  processQueue(refreshError as Error);
                  Sentry.captureException(refreshError);
                  handleAuthFailure();
                  throw refreshError;
              }
  ```

- [ ] **Step 3: Call handleAuthFailure in eventStreamClient runEventStream**
  Update `runEventStream` (inside `onopen` failure and the outer `catch` block) to call `handleAuthFailure()` when unauthorized.
  In `onopen`:
  ```typescript
                  if (
                      requireAuth &&
                      response.status === HTTP_STATUS_UNAUTHORIZED &&
                      !hasRetriedUnauthorized &&
                      !path.includes("/auth/refresh") &&
                      !path.includes("/auth/refresh-token") &&
                      !path.includes("/auth/login")
                  ) {
                      const refreshed = await refreshAccessToken(baseUrl);
                      if (refreshed) {
                          throw new StreamUnauthorizedRetryError();
                      } else {
                          handleAuthFailure();
                      }
                  }
  ```
  In outer `catch (error)` block:
  ```typescript
          if (error instanceof HttpError && error.status === HTTP_STATUS_UNAUTHORIZED) {
              handleAuthFailure();
          }
  ```

- [ ] **Step 4: Update refreshAccessToken server guard**
  Add the check `if (typeof window === "undefined") return false;` to the top of `refreshAccessToken`.

- [ ] **Step 5: Commit changes**
  ```bash
  git add src/lib/http-client.ts
  git commit -m "feat: implement auth failure clearing and redirection in http client"
  ```

---

### Task 3: Support Redirect Query Param on Login Form

**Files:**
- Modify: `src/components/ui/auth/login-form.tsx`

**Interfaces:**
- Consumes: `redirect` search query parameter from Next.js.
- Produces: Navigation to redirect URL or default home page after successful login.

- [ ] **Step 1: Import useSearchParams and extract redirect param**
  In [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx):
  ```typescript
  import { useSearchParams } from "next/navigation";
  ```
  Inside `LoginForm`:
  ```typescript
      const searchParams = useSearchParams();
      const redirectUrl = searchParams.get("redirect");
  ```

- [ ] **Step 2: Update onSubmit redirection logic**
  After successful login cookies are set, replace:
  ```typescript
                  router.replace(ROUTES.HOME as Route);
  ```
  with:
  ```typescript
                  const targetRoute = redirectUrl ? (decodeURIComponent(redirectUrl) as Route) : (ROUTES.HOME as Route);
                  router.replace(targetRoute);
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/components/ui/auth/login-form.tsx
  git commit -m "feat: support redirect parameter in LoginForm navigation"
  ```

---

### Task 4: Support Redirect Query Param on OTP Form

**Files:**
- Modify: `src/components/ui/auth/otp-form.tsx`

**Interfaces:**
- Consumes: `redirect` search query parameter from Next.js.
- Produces: Navigation to redirect URL or default home page after successful OTP verification.

- [ ] **Step 1: Import useSearchParams and extract redirect param**
  In [otp-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/otp-form.tsx):
  ```typescript
  import { useSearchParams } from "next/navigation";
  ```
  Inside `OtpForm`:
  ```typescript
      const searchParams = useSearchParams();
      const redirectUrl = searchParams.get("redirect");
  ```

- [ ] **Step 2: Update handleSubmit redirection logic**
  After successful OTP verification cookies are set, replace:
  ```typescript
              router.replace(ROUTES.HOME as Route);
  ```
  with:
  ```typescript
              const targetRoute = redirectUrl ? (decodeURIComponent(redirectUrl) as Route) : (ROUTES.HOME as Route);
              router.replace(targetRoute);
  ```

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/components/ui/auth/otp-form.tsx
  git commit -m "feat: support redirect parameter in OtpForm navigation"
  ```

---

## Verification Plan

### Build Check
Run `npm run build` in the terminal to verify no TypeScript compilation or bundling errors.

### Manual Behavior Test
1. Log in to the application.
2. Open DevTools -> Application -> Cookies -> clear or corrupt `access_token`.
3. Try to navigate to any protected route (e.g. `http://localhost:3000/systems` or staging url).
4. Verify the page detects token expiration, tries to refresh via `/v1/auth/refresh-token`, fails, deletes cookies, and redirects you to `/login?redirect=%2Fsystems`.
5. Log in again. Verify you are automatically redirected back to `/systems` instead of `/`.
