# Login Form Text Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the login form's header texts and layout to match the design screenshot.

**Architecture:** Change translation constants in UI text constants and update JSX layout in the login form component.

**Tech Stack:** React, Next.js, TypeScript

## Global Constraints

- Keep translations structured inside `UI_TEXT` in `src/constants/ui-text.constants.ts`.
- Ensure typescript and build checks pass successfully.

---

### Task 1: Update Login Form Text and Layout

**Files:**
- Modify: [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts)
- Modify: [login-form.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/ui/auth/login-form.tsx)

**Interfaces:**
- Consumes: None
- Produces: None

- [ ] **Step 1: Modify Translation Constants**

Modify lines 171-172 of `src/constants/ui-text.constants.ts` to update `title` and `welcomeBack` values:
```diff
-            title: "Đăng nhập",
-            welcomeBack: "Chào mừng bạn quay lại hành trình học",
+            title: "QUẢN LÝ ĐÀO TẠO",
+            welcomeBack: "Hệ thống - Quản lý đào tạo",
```

- [ ] **Step 2: Modify Login Form UI component**

Modify lines 106-110 in `src/components/ui/auth/login-form.tsx` to remove the waving hand icon:
```diff
                 <h1 className="font-display text-[22px] font-extrabold tracking-[-0.01em] text-slate-900">{UI_TEXT.auth.login.title}</h1>
                 <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-[13px] text-slate-500">
                     {UI_TEXT.auth.login.welcomeBack}
-                    <Image src={LMS_ICONS.WAVE} alt="" width={16} height={16} className="size-4" />
                 </p>
```

- [ ] **Step 3: Verification**

Verify that the local development server (already running) compiles the changes successfully without any errors.
