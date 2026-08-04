# Design: Show Custom Spam Message for 429 Error on Login

When a user tries to log in and receives a `429 Too Many Requests` status code from the server, we want to display a user-friendly error message: "Tài khoản của bạn đang bị khóa do spam" instead of the raw HTTP error payload.

## Proposed Changes

### lms-portal-admin

#### [MODIFY] [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts)
Add `tooManyRequests` key to `UI_TEXT.auth.login.errors`.
```typescript
            errors: {
                emailRequired: "Email không được để trống",
                emailInvalid: "Email không hợp lệ",
                loginFailed: "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
                tooManyRequests: "Tài khoản của bạn đang bị khóa do spam",
            },
```

#### [MODIFY] [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)
Import `HttpError` and check if the caught error is an instance of `HttpError` with `status === 429`. If so, use the new error message.
```typescript
import { HttpError } from "@/lib/http-client";
// ...
        } catch (error: unknown) {
            console.error("Login failed:", error);
            let msg = error instanceof Error ? error.message : UI_TEXT.auth.login.errors.loginFailed;
            if (error instanceof HttpError && error.status === 429) {
                msg = UI_TEXT.auth.login.errors.tooManyRequests;
            }
            toast.error(UI_TEXT.auth.login.toasts.errorTitle, msg);
        }
```

## Verification Plan

### Manual Verification
- Simulate a 429 response for `/v1/auth/login/staff` API or limit login attempts until 429 is returned.
- Verify the toast error description shows "Tài khoản của bạn đang bị khóa do spam".
