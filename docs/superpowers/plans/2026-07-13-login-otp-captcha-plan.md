# Staff Login Captcha Integration and OTP Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modify the login flow of the Next.js staff portal to send the login request to the backend `/v1/auth/login/staff` with a captcha token and clientId, and redirect to a new `/login/otp` page to complete authentication by verifying a 6-digit OTP code against `/v1/auth/login/staff/verify-otp`.

**Architecture:** 
- Keep Next.js routing clean using the App Router.
- Reuse the existing `@marsidev/react-turnstile` wrapper component (`TurnstileWidget`) for captcha validation.
- Store the user's email temporarily in `sessionStorage` between the `/login` and `/login/otp` pages.
- Handle API requests using the custom `httpClient` which will receive and save cookies (`lms_access_token`, `lms_refresh_token`) upon successful OTP verification.

**Tech Stack:** Next.js (App Router), React, TypeScript, TailwindCSS, js-cookie, Zod, @marsidev/react-turnstile

## Global Constraints
- Target login URL: `http://103.118.29.137:65432/v1/auth/login/staff`
- Target OTP verification URL: `http://103.118.29.137:65432/v1/auth/login/staff/verify-otp`
- ClientId: `"lms"`
- Captcha field name: `recaptchaToken`
- Checkbox captcha must be located below the login button on the login form.

---

### Task 1: Update API Endpoints and Type Definitions

**Files:**
- Modify: [api-endpoints.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/api-endpoints.constants.ts)
- Modify: [auth.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/auth.types.ts)

**Interfaces:**
- `API_ENDPOINTS.AUTH.LOGIN` becomes `"/v1/auth/login/staff"`
- Add `API_ENDPOINTS.AUTH.VERIFY_OTP` as `"/v1/auth/login/staff/verify-otp"`
- Update `LoginRequest` structure.
- Add `VerifyOtpRequest` structure.

- [ ] **Step 1: Modify types in auth.types.ts**
  Change lines 1-5 in `src/types/auth.types.ts` from:
  ```typescript
  export interface LoginRequest {
      email: string;
      password: string;
      turnstileToken?: string;
  }
  ```
  to:
  ```typescript
  export interface LoginRequest {
      email: string;
      password: string;
      recaptchaToken: string;
      clientId: string;
  }

  export interface VerifyOtpRequest {
      email: string;
      otp: string;
  }
  ```

- [ ] **Step 2: Update endpoints in api-endpoints.constants.ts**
  Change lines 5 in `src/constants/api-endpoints.constants.ts` from:
  ```typescript
  LOGIN: `${API_PREFIX}/auth/staff/login`,
  ```
  to:
  ```typescript
  LOGIN: "/v1/auth/login/staff",
  VERIFY_OTP: "/v1/auth/login/staff/verify-otp",
  ```

- [ ] **Step 3: Run typescript compilation to verify no compiler errors in existing codebase**
  Run: `npm run type-check` or `npx tsc --noEmit`
  Expected: Success or only errors related toLoginForm/authService changes (which we will fix next).

- [ ] **Step 4: Commit changes**
  ```bash
  git add src/types/auth.types.ts src/constants/api-endpoints.constants.ts
  git commit -m "feat(auth): update login API endpoints and request types for captcha/OTP"
  ```

---

### Task 2: Update Authentication Service

**Files:**
- Modify: [auth.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/auth.service.ts)

**Interfaces:**
- `login` accepts `LoginRequest` and returns `Promise<{ message?: string }>`
- `verifyOtp` accepts `VerifyOtpRequest` and returns `Promise<LoginResponse>`

- [ ] **Step 1: Modify auth.service.ts**
  Update the `login` function and add the `verifyOtp` function.
  Change lines 22-28 in `src/services/auth.service.ts`:
  ```typescript
  export async function login(data: LoginRequest): Promise<any> {
      return httpClient<any>(API_ENDPOINTS.AUTH.LOGIN, {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
          requireAuth: false,
      });
  }

  export async function verifyOtp(data: VerifyOtpRequest): Promise<LoginResponse> {
      return httpClient<LoginResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
          requireAuth: false,
      });
  }
  ```

- [ ] **Step 2: Run type check**
  Run: `npm run type-check`
  Expected: Success.

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/services/auth.service.ts
  git commit -m "feat(auth): update login service and implement verifyOtp API call"
  ```

---

### Task 3: Integrate Captcha into LoginForm

**Files:**
- Modify: [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)

**Interfaces:**
- Uses `TurnstileWidget` component from `src/components/common/turnstile-widget`
- Form submission sends `recaptchaToken` and `clientId` to `login` service.
- Redirects to `/login/otp` and sets `login_email` in `sessionStorage` on success.

- [ ] **Step 1: Update imports and captcha state**
  Add imports for `TurnstileWidget` in `src/components/ui/auth/login-form.tsx`:
  ```typescript
  import { TurnstileWidget } from "@/components/common/turnstile-widget";
  ```
  Add recaptcha state in `LoginForm` component:
  ```typescript
  const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";
  ```

- [ ] **Step 2: Update form submission handler**
  Update the `onSubmit` logic to validate that captcha token is present, call `login`, save `email` to `sessionStorage` and redirect to `/login/otp`:
  ```typescript
  const onSubmit = async (data: LoginFormData) => {
      if (!recaptchaToken) {
          toast.error("Vui lòng hoàn thành Captcha", "Bạn cần xác minh danh tính trước khi đăng nhập.");
          return;
      }
      setIsLoading(true);
      try {
          await login({
              email: data.email,
              password: data.password,
              recaptchaToken,
              clientId: "lms",
          });

          // Store email for OTP step
          sessionStorage.setItem("login_email", data.email);

          toast.success("Mã OTP đã được gửi", "Vui lòng kiểm tra email để nhận mã xác thực.");
          router.replace("/login/otp" as Route);
      } catch (error: unknown) {
          console.error("Login failed:", error);
          const msg =
              error instanceof Error
                  ? error.message
                  : UI_TEXT.auth.login.errors.loginFailed;
          toast.error(UI_TEXT.auth.login.toasts.errorTitle, msg);
      } finally {
          setIsLoading(false);
      }
  };
  ```

- [ ] **Step 3: Render Captcha Widget**
  Add the `TurnstileWidget` right below the Submit button in the form:
  ```tsx
  <button
      type="submit"
      disabled={isLoading}
      className="mt-2 w-full rounded-[14px] bg-linear-to-br from-brand-400 to-brand-500 p-3.5 text-left text-[15px] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(60,66,150,0.6)] transition hover:brightness-110 disabled:opacity-70"
  >
      {isLoading ? UI_TEXT.auth.login.submittingButton : UI_TEXT.auth.login.submitButton}
  </button>

  <div className="mt-4">
      <TurnstileWidget
          siteKey={turnstileSiteKey}
          onVerify={(token) => setRecaptchaToken(token)}
      />
  </div>
  ```

- [ ] **Step 4: Verify type safety**
  Run: `npm run type-check`
  Expected: Success.

- [ ] **Step 5: Commit changes**
  ```bash
  git add src/components/ui/auth/login-form.tsx
  git commit -m "feat(auth): integrate Turnstile Captcha and redirect login to OTP screen"
  ```

---

### Task 4: Create OTP Verification Page, Layout, View, and Form

**Files:**
- Create: [layout.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/login/otp/layout.tsx)
- Create: [page.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/app/login/otp/page.tsx)
- Create: [otp-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/otp-view.tsx)
- Create: [otp-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/otp-form.tsx)

**Interfaces:**
- `/login/otp` route renders `OtpView`.
- `OtpView` reads email from `sessionStorage`. If missing, redirects back to `/login`.
- `OtpForm` renders a clean UI for inputting a 6-digit OTP code, supports paste/auto-navigation/backspace, and triggers OTP verification against `/v1/auth/login/staff/verify-otp`.
- If successful, cookies are set and user is redirected to `/`.

- [ ] **Step 1: Create OTP layout.tsx**
  Write file `src/app/login/otp/layout.tsx`:
  ```typescript
  import type { Metadata } from "next";

  export const metadata: Metadata = {
      title: "Xác thực OTP - LMS Portal",
      description: "Nhập mã OTP được gửi đến email của bạn để hoàn tất đăng nhập.",
  };

  export default function OtpLayout({ children }: { children: React.ReactNode }) {
      return <>{children}</>;
  }
  ```

- [ ] **Step 2: Create OTP page.tsx**
  Write file `src/app/login/otp/page.tsx`:
  ```typescript
  import { OtpView } from "@/views/otp-view";

  export default function OtpPage() {
      return <OtpView />;
  }
  ```

- [ ] **Step 3: Create OTP view in otp-view.tsx**
  Write file `src/views/otp-view.tsx`:
  ```typescript
  "use client";

  import { useEffect, useState } from "react";
  import type { Route } from "next";
  import { AuthShell } from "@/components/layout/auth/auth-shell";
  import { OtpForm } from "@/components/ui/auth/otp-form";
  import { ROUTES } from "@/constants/app.constants";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { useAuth } from "@/hooks/use-auth";

  export function OtpView() {
      const router = useAppRouter();
      const { user, isLoading } = useAuth();
      const [email, setEmail] = useState<string | null>(null);
      const [isVerifying, setIsVerifying] = useState(true);

      useEffect(() => {
          if (!isLoading && user) {
              router.replace(ROUTES.HOME as Route);
              return;
          }

          const storedEmail = sessionStorage.getItem("login_email");
          if (!storedEmail) {
              router.replace(ROUTES.LOGIN as Route);
              return;
          }
          setEmail(storedEmail);
          setIsVerifying(false);
      }, [user, isLoading, router]);

      if (isLoading || isVerifying || !email) {
          return (
              <div className="flex min-h-dvh items-center justify-center bg-cream">
                  <div className="flex flex-col items-center gap-4">
                      <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-brand-500" />
                      <p className="text-sm text-slate-600">Đang tải...</p>
                  </div>
              </div>
          );
      }

      return (
          <AuthShell>
              <OtpForm email={email} />
          </AuthShell>
      );
  }
  ```

- [ ] **Step 4: Create OtpForm component in otp-form.tsx**
  Write file `src/components/ui/auth/otp-form.tsx`:
  ```typescript
  "use client";

  import { useRef, useState, useEffect } from "react";
  import type { Route } from "next";
  import Image from "next/image";
  import Link from "next/link";
  import Cookies from "js-cookie";
  import { RIKKEI_LOGO_LOGIN_WIDTH, RIKKEI_LOGO_PATH } from "@/constants/auth.constants";
  import { APP_CONFIG, ROUTES } from "@/constants/app.constants";
  import { LMS_ICONS } from "@/constants/lms-icons.constants";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { verifyOtp, login } from "@/services/auth.service";
  import { toast } from "@/services/toast.service";

  interface OtpFormProps {
      email: string;
  }

  export function OtpForm({ email }: OtpFormProps) {
      const router = useAppRouter();
      const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
      const [isLoading, setIsLoading] = useState(false);
      const [countdown, setCountdown] = useState(60);
      const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

      // Countdown Timer for Resend OTP
      useEffect(() => {
          if (countdown <= 0) return;
          const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
          return () => clearTimeout(timer);
      }, [countdown]);

      const handleChange = (element: HTMLInputElement, index: number) => {
          const value = element.value.replace(/[^0-9]/g, "");
          const newOtp = [...otp];
          newOtp[index] = value;
          setOtp(newOtp);

          // Focus next input
          if (value !== "" && index < 5) {
              inputRefs.current[index + 1]?.focus();
          }
      };

      const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
          if (e.key === "Backspace" && otp[index] === "" && index > 0) {
              inputRefs.current[index - 1]?.focus();
          }
      };

      const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
          e.preventDefault();
          const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
          if (pastedData.length === 6) {
              const newOtp = pastedData.split("");
              setOtp(newOtp);
              inputRefs.current[5]?.focus();
          }
      };

      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          const otpCode = otp.join("");
          if (otpCode.length !== 6) {
              toast.error("Mã OTP không hợp lệ", "Vui lòng nhập đủ 6 chữ số.");
              return;
          }

          setIsLoading(true);
          try {
              const response = await verifyOtp({
                  email,
                  otp: otpCode,
              });

              // Save cookies
              Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, response.accessToken, { expires: 1 });
              Cookies.set(APP_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken, { expires: 7 });

              toast.success("Xác thực thành công", "Chào mừng bạn đã đăng nhập hệ thống.");
              
              // Clear temporary email from sessionStorage
              sessionStorage.removeItem("login_email");
              
              router.replace(ROUTES.HOME as Route);
          } catch (error: unknown) {
              console.error("OTP verification failed:", error);
              const msg = error instanceof Error ? error.message : "Xác thực OTP thất bại. Vui lòng thử lại.";
              toast.error("Xác thực thất bại", msg);
          } finally {
              setIsLoading(false);
          }
      };

      const handleResend = async () => {
          if (countdown > 0) return;
          setIsLoading(true);
          try {
              // We trigger login flow again with mock empty credentials or we notify the user.
              // Note: since we don't have password stored, we redirect back to login to perform a fresh login
              // Alternatively, we can let user know they should go back to login screen.
              toast.info("Yêu cầu gửi lại mã", "Vui lòng quay lại trang đăng nhập để gửi lại OTP.");
              router.replace(ROUTES.LOGIN as Route);
          } catch (error) {
              toast.error("Gửi lại thất bại", "Không thể gửi lại OTP lúc này.");
          } finally {
              setIsLoading(false);
          }
      };

      return (
          <form
              onSubmit={handleSubmit}
              className="relative w-full max-w-[410px] rounded-[26px] bg-white px-8 py-[34px] text-slate-900 shadow-[0_34px_74px_-22px_rgba(0,0,0,0.55)]"
          >
              <div className="mb-[22px] text-center">
                  <Image
                      src={RIKKEI_LOGO_PATH}
                      alt="Logo"
                      width={RIKKEI_LOGO_LOGIN_WIDTH}
                      height={64}
                      className="mx-auto mb-3.5 block h-auto w-full max-w-[188px]"
                      priority
                  />
                  <h1 className="font-display text-[22px] font-extrabold tracking-[-0.01em] text-slate-900">
                      Xác thực hai bước
                  </h1>
                  <p className="mt-1 text-[13px] text-slate-500 px-2 leading-relaxed">
                      Mã OTP đã được gửi đến email <span className="font-semibold text-slate-800">{email}</span>. Vui lòng kiểm tra và nhập mã bên dưới.
                  </p>
              </div>

              <div className="flex justify-between gap-2.5 my-6">
                  {otp.map((data, index) => (
                      <input
                          key={index}
                          ref={(el) => {
                              inputRefs.current[index] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={data}
                          onChange={(e) => handleChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onPaste={index === 0 ? handlePaste : undefined}
                          className="w-12 h-14 text-center rounded-[12px] border-[1.5px] border-slate-200 bg-cream text-lg font-bold text-slate-950 focus:border-brand-500 focus:bg-white outline-none transition"
                      />
                  ))}
              </div>

              <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-[14px] bg-linear-to-br from-brand-400 to-brand-500 p-3.5 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(60,66,150,0.6)] transition hover:brightness-110 disabled:opacity-70"
              >
                  {isLoading ? "Đang xác thực..." : "Xác nhận"}
              </button>

              <div className="mt-6 text-center text-xs text-slate-500">
                  {countdown > 0 ? (
                      <p>Gửi lại mã sau <span className="font-semibold text-brand-500">{countdown}s</span></p>
                  ) : (
                      <button
                          type="button"
                          onClick={handleResend}
                          className="font-bold text-brand-500 hover:text-brand-600 hover:underline"
                      >
                          Gửi lại mã OTP
                      </button>
                  )}
              </div>

              <div className="mt-4 text-center">
                  <Link href={ROUTES.LOGIN} className="text-xs font-bold text-slate-500 hover:text-slate-700">
                      Quay lại trang Đăng nhập
                  </Link>
              </div>
          </form>
      );
  }
  ```

- [ ] **Step 5: Run type-check to confirm page compile successfully**
  Run: `npm run type-check`
  Expected: Success.

- [ ] **Step 6: Commit changes**
  ```bash
  git add src/app/login/otp src/views/otp-view.tsx src/components/ui/auth/otp-form.tsx
  git commit -m "feat(auth): add OTP verification page routing, view and OTP form components"
  ```

---

## 4. Verification Plan

### Automated Verification
Run typescript and eslint checks:
- `npm run type-check`
- `npm run lint`

### Manual Verification
1. Access `/login`, submit credentials, check Turnstile render below submit button.
2. Confirm API request goes to `http://103.118.29.137:65432/v1/auth/login/staff` with token and clientId: "lms".
3. Verify routing to `/login/otp`.
4. Test OTP pasting (6 digits) and keyboard arrow navigation.
5. Verify OTP API request details to `http://103.118.29.137:65432/v1/auth/login/staff/verify-otp`.
6. Confirm cookie storage and redirect on success.
