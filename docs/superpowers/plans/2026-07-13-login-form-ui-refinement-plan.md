# Login Form UI Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the staff login form to include input placeholders, display required field asterisks, trigger validation on touch, and add an eye toggle button to show/hide the password.

**Architecture:** Use react-hook-form's built-in validation triggered via `mode: "onTouched"`, import existing Eye icons from the repository's icons package, and apply standard Tailwind class styling to manually position the absolute eye toggle icon within a relative wrapper.

**Tech Stack:** Next.js (App Router), React, TypeScript, TailwindCSS, Zod, React Hook Form

## Global Constraints
- Do not modify current login page routing.
- Keep the existing styling: rounded-[13px] border-[1.5px] border-slate-200 bg-cream for inputs.
- Use `UI_TEXT` constants for all user-facing texts and placeholders.

---

### Task 1: Update UI Text Constants

**Files:**
- Modify: [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts:171-185)

**Interfaces:**
- Produces: `UI_TEXT.auth.login.emailPlaceholder` (string)
- Produces: `UI_TEXT.auth.login.passwordPlaceholder` (string)

- [ ] **Step 1: Add placeholder constants to login section**
  Modify lines 174-180 in `src/constants/ui-text.constants.ts` to add placeholder properties:
  ```typescript
          login: {
              title: "Đăng nhập",
              welcomeBack: "Chào mừng bạn quay lại hành trình học",
              emailLabel: "Email",
              emailPlaceholder: "Nhập email",
              passwordLabel: "Mật khẩu",
              passwordPlaceholder: "Nhập mật khẩu",
              submitButton: "Đăng nhập",
              submittingButton: "Đang đăng nhập…",
  ```

- [ ] **Step 2: Verify type safety of the constants**
  Run: `npx tsc --noEmit`
  Expected: Command runs without errors.

- [ ] **Step 3: Commit changes**
  ```bash
  git add src/constants/ui-text.constants.ts
  git commit -m "feat(auth): add email and password placeholders to login text constants"
  ```

---

### Task 2: Implement Refinements in LoginForm

**Files:**
- Modify: [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)

**Interfaces:**
- Consumes: `UI_TEXT.auth.login.emailPlaceholder` (string)
- Consumes: `UI_TEXT.auth.login.passwordPlaceholder` (string)
- Consumes: `Eye`, `EyeSlash` from `@/components/icons`

- [ ] **Step 1: Import Eye icons and configure password visibility state**
  Modify imports at the top of `src/components/ui/auth/login-form.tsx` to include `Eye` and `EyeSlash` from `@/components/icons`.
  Also declare state for password visibility in the component.

  Change lines 12-14 from:
  ```typescript
  import { LMS_ICONS } from "@/constants/lms-icons.constants";
  import { UI_TEXT } from "@/constants/ui-text.constants";
  import { useAppRouter } from "@/hooks/use-app-router";
  ```
  to:
  ```typescript
  import { LMS_ICONS } from "@/constants/lms-icons.constants";
  import { UI_TEXT } from "@/constants/ui-text.constants";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { Eye, EyeSlash } from "@/components/icons";
  ```

  And add state declaration inside `LoginForm` function (around line 27):
  ```typescript
      const router = useAppRouter();
      const [isLoading, setIsLoading] = useState(false);
      const [showPassword, setShowPassword] = useState(false);
      const [recaptchaToken, setRecaptchaToken] = useState<string>("");
  ```

- [ ] **Step 2: Update useForm validation mode**
  Set `mode: "onTouched"` in `useForm` initialization (lines 35-41) to enable dynamic on-blur validation.

  Change from:
  ```typescript
      } = useForm<LoginFormData>({
          resolver: zodResolver(loginSchema),
          defaultValues: {
              email: "",
              password: "",
          },
      });
  ```
  to:
  ```typescript
      } = useForm<LoginFormData>({
          resolver: zodResolver(loginSchema),
          mode: "onTouched",
          defaultValues: {
              email: "",
              password: "",
          },
      });
  ```

- [ ] **Step 3: Update Email Input field**
  Update the email field label to display a red asterisk, and add the placeholder attribute to the input.

  Change lines 92-99 from:
  ```tsx
              <label className="mb-1.5 block text-xs font-bold text-slate-500">{UI_TEXT.auth.login.emailLabel}</label>
              <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                      <input {...field} type="email" autoComplete="email" className={cx(inputClassName, "mb-3.5", errors.email && "border-error-500")} />
                  )}
              />
  ```
  to:
  ```tsx
              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  {UI_TEXT.auth.login.emailLabel} <span className="text-error-500">*</span>
              </label>
              <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                      <input
                          {...field}
                          type="email"
                          placeholder={UI_TEXT.auth.login.emailPlaceholder}
                          autoComplete="email"
                          className={cx(inputClassName, "mb-3.5", errors.email && "border-error-500")}
                      />
                  )}
              />
  ```

- [ ] **Step 4: Update Password Input field**
  Update the password field label to display a red asterisk, wrap the input inside a relative container, add the placeholder attribute, change type dynamically, add right-padding class (`pr-10`), and add the absolute show/hide toggle button.

  Change lines 102-109 from:
  ```tsx
              <label className="mb-1.5 block text-xs font-bold text-slate-500">{UI_TEXT.auth.login.passwordLabel}</label>
              <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                      <input {...field} type="password" autoComplete="current-password" className={cx(inputClassName, errors.password && "border-error-500")} />
                  )}
              />
  ```
  to:
  ```tsx
              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                  {UI_TEXT.auth.login.passwordLabel} <span className="text-error-500">*</span>
              </label>
              <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                      <div className="relative w-full">
                          <input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder={UI_TEXT.auth.login.passwordPlaceholder}
                              autoComplete="current-password"
                              className={cx(inputClassName, "pr-10", errors.password && "border-error-500")}
                          />
                          <button
                              type="button"
                              onClick={() => setShowPassword((prev) => !prev)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              aria-label={showPassword ? UI_TEXT.auth.login.hidePassword : UI_TEXT.auth.login.showPassword}
                          >
                              {showPassword ? (
                                  <EyeSlash size={16} className="size-4" />
                              ) : (
                                  <Eye size={16} className="size-4" />
                              )}
                          </button>
                      </div>
                  )}
              />
  ```

- [ ] **Step 5: Run TypeScript compilation and build to verify correctness**
  Run: `npx tsc --noEmit`
  Expected: Successful compilation.

- [ ] **Step 6: Commit changes**
  ```bash
  git add src/components/ui/auth/login-form.tsx
  git commit -m "feat(auth): add placeholder, required validation indicator, and password show/hide eye toggle"
  ```
