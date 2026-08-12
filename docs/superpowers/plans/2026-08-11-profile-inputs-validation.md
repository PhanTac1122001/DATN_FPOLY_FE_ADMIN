# Profile Inputs & Validation Standardizing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Standardize inputs and validation in `src/views/profile/profile-view.tsx` using `Input`, `Select`, `SelectItem`, `react-hook-form`, and `zod` schemas.

**Architecture:** Add `updateProfileSchema` to `auth.schema.ts`. In `ProfileView`, replace native HTML input & select controls with `@/components/base/input/input` and `@/components/base/select/select`. Wire form states and error hints using `react-hook-form` `Controller` and `zodResolver`.

**Tech Stack:** Next.js (React 19), React Hook Form, Zod, React Aria Components, Lucide React, Tailwind CSS.

## Global Constraints

- Use `@/components/base/input/input` for text/password/email inputs.
- Use `@/components/base/select/select` and `@/components/base/select/select-item` for dropdowns.
- Use `react-hook-form` + `@hookform/resolvers/zod` for forms.
- Preserved existing toast notifications on success/error.

---

### Task 1: Add `updateProfileSchema` in `src/schemas/auth.schema.ts`

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/schemas/auth.schema.ts`

**Interfaces:**
- Produces: `updateProfileSchema`, `UpdateProfileFormData`

- [ ] **Step 1: Write `updateProfileSchema` definition**

Add the schema and type export to `src/schemas/auth.schema.ts`:
```typescript
export const updateProfileSchema = z.object({
    fullName: z.string().min(1, UI_TEXT.profile.toastFullNameRequired),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === "") return true;
                const sanitized = val.replace(/\s+/g, "").trim();
                return /^\d+$/.test(sanitized) && /^(03|05|07|08|09)/.test(sanitized) && sanitized.length === 10;
            },
            { message: UI_TEXT.auth.register.errors.phoneNumberFormat }
        ),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    address: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
```

- [ ] **Step 2: Check TypeScript compilation for schema changes**

Run: `npx tsc --noEmit` inside `lms-portal-admin`
Expected: No errors in `src/schemas/auth.schema.ts`.

---

### Task 2: Refactor Personal Information Tab in `src/views/profile/profile-view.tsx`

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/profile/profile-view.tsx`

**Interfaces:**
- Consumes: `updateProfileSchema`, `UpdateProfileFormData` from `@/schemas/auth.schema.ts`, `Input` from `@/components/base/input/input`, `Select`, `SelectItem` from `@/components/base/select/select` and `@/components/base/select/select-item`

- [ ] **Step 1: Import form & UI dependencies in `profile-view.tsx`**

Add imports:
```typescript
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { updateProfileSchema, changePasswordSchema, type UpdateProfileFormData, type ChangePasswordFormData } from "@/schemas/auth.schema";
```

- [ ] **Step 2: Initialize `useForm` for profile info**

```typescript
const {
    handleSubmit: handleInfoSubmit,
    control: infoControl,
    reset: resetInfo,
    clearErrors: clearInfoErrors,
    formState: { errors: infoErrors },
} = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
        fullName: "",
        phone: "",
        address: "",
        gender: "MALE",
    },
});
```

- [ ] **Step 3: Replace native inputs with `Controller` + `Input`/`Select` in Personal Information tab**

Replace fields for `fullName`, `phone`, `gender`, `email`, and `address` with `Controller` wrappers using `Input` and `Select`.

- [ ] **Step 4: Verify form submission & profile update**

Check that submitting valid info triggers `updateProfile` service call and invalid inputs show inline error messages.

---

### Task 3: Refactor Change Password Tab in `src/views/profile/profile-view.tsx`

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/profile/profile-view.tsx`

**Interfaces:**
- Consumes: `changePasswordSchema`, `ChangePasswordFormData` from `@/schemas/auth.schema.ts`, `Input` from `@/components/base/input/input`

- [ ] **Step 1: Initialize `useForm` for password change**

```typescript
const {
    handleSubmit: handlePasswordSubmit,
    control: passwordControl,
    reset: resetPasswordForm,
    clearErrors: clearPasswordErrors,
    formState: { errors: passwordErrors },
} = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    },
});
```

- [ ] **Step 2: Replace password inputs with `Controller` + `Input`**

Use `Input` with `type="password"`, `showPassword={showCurrentPassword}`, `onTogglePassword={() => setShowCurrentPassword((prev) => !prev)}`, `isInvalid={!!passwordErrors.currentPassword}`, `hint={passwordErrors.currentPassword?.message}`. Repeat for `newPassword` and `confirmPassword`.

- [ ] **Step 3: Verify password change submission**

Check that password validation rules (minimum length, mismatch, same as old) display error hints under the respective fields.

---

### Task 4: Type Check & Final Verification

- [ ] **Step 1: Run TypeScript check**

Run: `npx tsc --noEmit` inside `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin`
Expected: 0 errors.

- [ ] **Step 2: Test in browser**

Verify UI rendering of `ProfileView` tab 1 and tab 2 in `http://localhost:3000`.
