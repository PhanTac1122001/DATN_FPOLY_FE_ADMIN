# Show Custom Spam Message for 429 Error on Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Intercept 429 Too Many Requests status code during login and display a custom error message: "Tài khoản của bạn đang bị khóa do spam".

**Architecture:** 
1. Add translation key `tooManyRequests` inside `UI_TEXT.auth.login.errors`.
2. Modify `LoginForm` catch block to check if error is `HttpError` and status is 429. If so, override message with `UI_TEXT.auth.login.errors.tooManyRequests`.

**Tech Stack:** React, Next.js, TypeScript

## Global Constraints

- Do not use hardcoded Vietnamese strings in component files where possible, keep translations in `UI_TEXT`.

---

### Task 1: Add translation key to UI_TEXT

**Files:**
- Modify: `src/constants/ui-text.constants.ts`

**Interfaces:**
- Produces: `UI_TEXT.auth.login.errors.tooManyRequests` string with value `"Tài khoản của bạn đang bị khóa do spam"`

- [ ] **Step 1: Add new key under `auth.login.errors` in `ui-text.constants.ts`**

Open [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts) and add the key:
```typescript
            errors: {
                emailRequired: "Email không được để trống",
                emailInvalid: "Email không hợp lệ",
                loginFailed: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
                tooManyRequests: "Tài khoản của bạn đang bị khóa do spam",
            },
```

- [ ] **Step 2: Commit changes**

```bash
git add src/constants/ui-text.constants.ts
git commit -m "chore: add tooManyRequests translation key for login error"
```

---

### Task 2: Update LoginForm component to display custom message on 429

**Files:**
- Modify: `src/components/ui/auth/login-form.tsx`

**Interfaces:**
- Consumes: `UI_TEXT.auth.login.errors.tooManyRequests` from `src/constants/ui-text.constants.ts`
- Consumes: `HttpError` from `src/lib/http-client.ts`

- [ ] **Step 1: Modify imports in `login-form.tsx` to include `HttpError`**

Import `HttpError` from `@/lib/http-client`.

```typescript
import { type LoginFormData, loginSchema } from "@/schemas/auth.schema";
import { login } from "@/services/auth.service";
import { toast } from "@/services/toast.service";
import { cx } from "@/utils/cx";
import { HttpError } from "@/lib/http-client";
```

- [ ] **Step 2: Update catch block in `onSubmit` to check for 429 error**

In [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx) around line 86, change the catch block:

```typescript
        } catch (error: unknown) {
            console.error("Login failed:", error);
            let msg = error instanceof Error ? error.message : UI_TEXT.auth.login.errors.loginFailed;
            if (error instanceof HttpError && error.status === 429) {
                msg = UI_TEXT.auth.login.errors.tooManyRequests;
            }
            toast.error(UI_TEXT.auth.login.toasts.errorTitle, msg);
        }
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build` in `lms-portal-admin` or verify dev server compiles successfully without type errors.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/ui/auth/login-form.tsx
git commit -m "feat: display custom spam message on 429 login error"
```
