# Guided Help (Tour + Tooltip) — Pilot type-detail-course — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm tour onboarding (driver.js, chạy khi bấm nút "?") và 3 tooltip tra cứu nhanh cho màn builder khóa học `type-detail-course`, làm mẫu để nhân rộng.

**Architecture:** Một hook `useGuidedTour` bọc driver.js với style map qua CSS var. Các bước tour khai báo trong 1 file `*.tour.ts`, text nằm trong `UI_TEXT.guidedTour`. View gắn `data-tour` vào phần tử cần highlight + 1 nút "?" gọi `start()`. Tooltip dùng lại base `Tooltip`/`TooltipTrigger` có sẵn.

**Tech Stack:** Next 16 / React 19, TypeScript, Tailwind v4, react-aria-components, driver.js (mới). Repo không có test runner → nghiệm thu bằng `pnpm lint:check`, `pnpm type-check` và kiểm chứng trực quan trên dev server.

---

## Ghi chú chung (đọc trước)

- **Không hardcode string** trong `.tsx`: mọi text đi qua `UI_TEXT` (`src/constants/ui-text.constants.ts`).
- **Không hex/màu thô** trong TSX: màu của driver.js map trong file CSS riêng qua biến.
- **Import order** do prettier plugin tự sắp — chạy `pnpm format` hoặc để lint-staged xử lý; nếu sửa tay, giữ thứ tự: external → `@/...` → type imports.
- File view pilot: `src/views/type/type-detail-course-view.tsx`.
- Không có bước "viết test" vì repo không có test runner; mỗi task kết thúc bằng lint/type-check và (task cuối) kiểm chứng browser.

## File Structure

| File | Create/Modify | Trách nhiệm |
|---|---|---|
| `package.json` | Modify | Thêm dependency `driver.js` |
| `src/styles/guided-tour.css` | Create | Map biến `--driver-*` sang màu repo |
| `src/styles/globals.css` | Modify | `@import "./guided-tour.css";` |
| `src/constants/ui-text.constants.ts` | Modify | Thêm nhánh `guidedTour` + tooltip text |
| `src/hooks/use-guided-tour.ts` | Create | Hook bọc driver.js |
| `src/components/application/type-detail-course/type-detail-course.tour.ts` | Create | Mảng `steps` cho màn pilot |
| `src/views/type/type-detail-course-view.tsx` | Modify | Nút "?", `data-tour`, gọi hook, tooltip nút điều kiện hoàn thành |
| `src/components/application/type-detail-course/components/session-form.tsx` | Modify | Tooltip trường "Số lần AI chấm" |
| `src/components/application/type-detail-course/components/session-node.tsx` | Modify | `data-tour` không bắt buộc + tooltip kéo-thả (nếu có handle) |

---

### Task 1: Thêm dependency driver.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Cài driver.js**

Run:
```bash
pnpm add driver.js
```
Expected: `package.json` xuất hiện `"driver.js": "^1.x"` trong `dependencies`, `pnpm-lock.yaml` cập nhật.

- [ ] **Step 2: Kiểm tra type-check vẫn sạch**

Run:
```bash
pnpm type-check
```
Expected: PASS, không lỗi.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: them dependency driver.js cho guided tour"
```

---

### Task 2: CSS wrapper style cho driver.js

**Files:**
- Create: `src/styles/guided-tour.css`
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Tạo file CSS map biến driver.js sang màu repo**

Tạo `src/styles/guided-tour.css`. Dùng `var(--color-...)` của theme khi có; nếu theme chưa expose, dùng biến trung gian đặt trong file này (không rải hex trong TSX). Nội dung:

```css
/* Style cho driver.js guided tour — map sang token của app.
   Đặt màu tập trung ở đây để component/TSX không chứa hex. */
.driver-popover {
    --gt-bg: #ffffff;
    --gt-text: #1e293b; /* slate-800 */
    --gt-accent: #7b2d3b; /* wine */
    border-radius: 16px;
    background: var(--gt-bg);
    color: var(--gt-text);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.12);
    padding: 16px 18px;
    max-width: 320px;
}

.driver-popover-title {
    font-weight: 800;
    font-size: 15px;
    color: var(--gt-text);
    margin-bottom: 4px;
}

.driver-popover-description {
    font-size: 13px;
    line-height: 1.55;
    color: #475569; /* slate-600 */
}

.driver-popover-progress-text {
    font-size: 12px;
    color: #94a3b8; /* slate-400 */
}

.driver-popover-navigation-btns button.driver-popover-next-btn,
.driver-popover-navigation-btns button.driver-popover-done-btn {
    background: var(--gt-accent);
    color: #ffffff;
    border: none;
    border-radius: 9999px;
    padding: 6px 16px;
    font-weight: 700;
    font-size: 12px;
    text-shadow: none;
}

.driver-popover-navigation-btns button.driver-popover-prev-btn {
    background: #f1f5f9; /* slate-100 */
    color: #475569;
    border: none;
    border-radius: 9999px;
    padding: 6px 16px;
    font-weight: 700;
    font-size: 12px;
    text-shadow: none;
}

.driver-popover-close-btn {
    color: #94a3b8;
}
```

> Lưu ý: hex chỉ nằm trong file `.css` này (eslint không quét màu trong CSS thuần), TSX vẫn sạch. driver.js cần CSS gốc của nó — sẽ import trong hook ở Task 4.

- [ ] **Step 2: Import file CSS vào globals**

Modify `src/styles/globals.css` — thêm dòng import cuối danh sách (sau `customStyles.css`):

```css
@import "tailwindcss";
@import "./theme.css";
@import "./typography.css";
@import "./customStyles.css";
@import "./guided-tour.css";
```

- [ ] **Step 3: Lint file mới**

Run:
```bash
pnpm exec prettier --check src/styles/guided-tour.css
```
Expected: nếu báo format thì chạy `pnpm exec prettier --write src/styles/guided-tour.css`.

- [ ] **Step 4: Commit**

```bash
git add src/styles/guided-tour.css src/styles/globals.css
git commit -m "style: css wrapper cho driver.js guided tour"
```

---

### Task 3: Thêm text vào UI_TEXT

**Files:**
- Modify: `src/constants/ui-text.constants.ts`

- [ ] **Step 1: Thêm text tooltip vào nhánh `typeDetailCourse` hiện có**

Modify `src/constants/ui-text.constants.ts` tại block `typeDetailCourse` (dòng ~2954). Thay:

```ts
    typeDetailCourse: {
        completionConditions: "Điều kiện hoàn thành",
    },
```

thành:

```ts
    typeDetailCourse: {
        completionConditions: "Điều kiện hoàn thành",
        helpButtonLabel: "Hướng dẫn",
        tooltipCompletionConditions: "Thiết lập điều kiện học viên phải đạt để được tính hoàn thành buổi học.",
        tooltipMaxAiGrade: "Giới hạn số lần AI được chấm lại bài của học viên.",
        tooltipDragSession: "Kéo để đổi thứ tự buổi học.",
    },
```

- [ ] **Step 2: Thêm nhánh `guidedTour` mới (đặt ngay sau block `typeDetailCourse`)**

Chèn block mới sau dấu `},` đóng `typeDetailCourse`:

```ts
    guidedTour: {
        common: {
            next: "Tiếp",
            prev: "Trước",
            done: "Xong",
        },
        typeDetailCourse: {
            step1Title: "Khu vực dựng khóa học",
            step1Desc: "Bên trái là cấu trúc khóa học, bên phải là nơi cấu hình chi tiết cho từng phần.",
            step2Title: "Cấu trúc khóa học",
            step2Desc: "Danh sách các buổi học. Bạn có thể kéo-thả để đổi thứ tự.",
            step3Title: "Thêm buổi học",
            step3Desc: "Bấm vào đây để thêm một buổi học mới vào khóa học.",
            step4Title: "Vùng cấu hình",
            step4Desc: "Chọn một buổi hoặc bài học ở bên trái để cấu hình video, tài liệu đọc hoặc quiz tại đây.",
            step5Title: "Điều kiện hoàn thành",
            step5Desc: "Thiết lập điều kiện học viên phải đạt để được tính hoàn thành.",
            step6Title: "Lưu thay đổi",
            step6Desc: "Nhớ bấm Lưu sau khi chỉnh sửa. Hệ thống sẽ cảnh báo nếu bạn rời trang khi chưa lưu.",
        },
    },
```

> Nếu `UI_TEXT` có kiểu `as const` hoặc typed object, việc thêm key mới là an toàn. Kiểm tra dấu phẩy sau block để không lỗi cú pháp.

- [ ] **Step 3: Type-check**

Run:
```bash
pnpm type-check
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/constants/ui-text.constants.ts
git commit -m "feat: them text guided tour + tooltip cho type-detail-course"
```

---

### Task 4: Hook useGuidedTour

**Files:**
- Create: `src/hooks/use-guided-tour.ts`

- [ ] **Step 1: Viết hook bọc driver.js**

Tạo `src/hooks/use-guided-tour.ts`:

```ts
"use client";

import { useCallback, useEffect, useRef } from "react";
import { type Config, type DriveStep, driver } from "driver.js";
import "driver.js/dist/driver.css";
import { UI_TEXT } from "@/constants/ui-text.constants";

type GuidedTourReturn = {
    start: () => void;
};

/**
 * Bọc driver.js: nhận danh sách bước, trả về `start()` để mở tour khi user bấm.
 * Không tự chạy, không lưu trạng thái. Instance được huỷ khi component unmount.
 */
export function useGuidedTour(steps: DriveStep[], config?: Partial<Config>): GuidedTourReturn {
    const driverRef = useRef<ReturnType<typeof driver> | null>(null);

    useEffect(() => {
        return () => {
            driverRef.current?.destroy();
            driverRef.current = null;
        };
    }, []);

    const start = useCallback(() => {
        driverRef.current?.destroy();
        const instance = driver({
            showProgress: true,
            allowClose: true,
            nextBtnText: UI_TEXT.guidedTour.common.next,
            prevBtnText: UI_TEXT.guidedTour.common.prev,
            doneBtnText: UI_TEXT.guidedTour.common.done,
            steps,
            ...config,
        });
        driverRef.current = instance;
        instance.drive();
    }, [steps, config]);

    return { start };
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
pnpm type-check
```
Expected: PASS. (Nếu báo thiếu type cho `driver.js/dist/driver.css`, đó là CSS import — Next hỗ trợ sẵn; nếu TS phàn nàn, thêm `// @ts-expect-error css import` phía trên dòng import CSS.)

- [ ] **Step 3: Lint**

Run:
```bash
pnpm exec eslint src/hooks/use-guided-tour.ts --max-warnings=0
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/use-guided-tour.ts
git commit -m "feat: hook useGuidedTour boc driver.js"
```

---

### Task 5: Khai báo các bước tour

**Files:**
- Create: `src/components/application/type-detail-course/type-detail-course.tour.ts`

- [ ] **Step 1: Viết mảng steps**

Tạo `src/components/application/type-detail-course/type-detail-course.tour.ts`:

```ts
import type { DriveStep } from "driver.js";
import { UI_TEXT } from "@/constants/ui-text.constants";

const t = UI_TEXT.guidedTour.typeDetailCourse;

/**
 * Các bước tour cho màn builder khóa học.
 * Bước trỏ tới phần tử có thể không tồn tại (vd nút "Điều kiện hoàn thành" chỉ hiện khi có buổi học)
 * sẽ được driver.js tự bỏ qua khi selector không match.
 */
export const typeDetailCourseTourSteps: DriveStep[] = [
    {
        element: '[data-tour="workspace"]',
        popover: { title: t.step1Title, description: t.step1Desc },
    },
    {
        element: '[data-tour="course-structure"]',
        popover: { title: t.step2Title, description: t.step2Desc },
    },
    {
        element: '[data-tour="add-session"]',
        popover: { title: t.step3Title, description: t.step3Desc },
    },
    {
        element: '[data-tour="config-panel"]',
        popover: { title: t.step4Title, description: t.step4Desc },
    },
    {
        element: '[data-tour="completion-conditions"]',
        popover: { title: t.step5Title, description: t.step5Desc },
    },
    {
        element: '[data-tour="save"]',
        popover: { title: t.step6Title, description: t.step6Desc },
    },
];
```

- [ ] **Step 2: Type-check + lint**

Run:
```bash
pnpm type-check && pnpm exec eslint src/components/application/type-detail-course/type-detail-course.tour.ts --max-warnings=0
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/application/type-detail-course/type-detail-course.tour.ts
git commit -m "feat: khai bao 6 buoc tour cho type-detail-course"
```

---

### Task 6: Gắn tour vào view (nút "?", data-tour, tooltip nút điều kiện)

**Files:**
- Modify: `src/views/type/type-detail-course-view.tsx`

- [ ] **Step 1: Thêm import**

Trong `src/views/type/type-detail-course-view.tsx`, thêm vào cụm import:

```ts
import { CircleHelp } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { useGuidedTour } from "@/hooks/use-guided-tour";
import { typeDetailCourseTourSteps } from "@/components/application/type-detail-course/type-detail-course.tour";
```

> `CircleHelp` là icon có trong `lucide-react` (đã dùng ở repo). Nếu muốn gộp, thêm `CircleHelp` vào dòng import lucide hiện có: `import { ArrowLeft, CircleHelp, FileText, Play, Plus, Save, ShieldAlert } from "lucide-react";`

- [ ] **Step 2: Gọi hook trong component**

Ngay sau `const queryClient = useQueryClient();` (dòng ~30), thêm:

```ts
    const { start: startTour } = useGuidedTour(typeDetailCourseTourSteps);
```

- [ ] **Step 3: Thêm nút "?" ở header, cạnh tiêu đề**

Thay block tiêu đề (dòng ~391-393):

```tsx
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black tracking-tight text-slate-800">{courseDisplayName}</h1>
                    </div>
```

thành:

```tsx
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-black tracking-tight text-slate-800">{courseDisplayName}</h1>
                        <Tooltip title={UI_TEXT.typeDetailCourse.helpButtonLabel} placement="bottom">
                            <TooltipTrigger
                                onPress={startTour}
                                className="flex size-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-wine"
                            >
                                <CircleHelp className="size-5" />
                            </TooltipTrigger>
                        </Tooltip>
                    </div>
```

> `TooltipTrigger` (react-aria Button) dùng `onPress`, không phải `onClick`.

- [ ] **Step 4: Gắn `data-tour="workspace"`**

Tại container main content (dòng ~431):

```tsx
            <div className="flex min-h-0 flex-1 overflow-hidden" data-tour="workspace">
```

- [ ] **Step 5: Gắn `data-tour="course-structure"`**

Tại cột trái (dòng ~433):

```tsx
                <div
                    className="flex h-full w-[340px] shrink-0 flex-col overflow-hidden bg-white p-4 min-[1440px]:w-[380px]"
                    data-tour="course-structure"
                >
```

- [ ] **Step 6: Gắn `data-tour="add-session"`**

Tại nút "Thêm chương/buổi học" (dòng ~537), thêm attribute vào `<button ...>`:

```tsx
                        <button
                            onClick={handleStartAddSession}
                            data-tour="add-session"
                            className="hover:bg-wine-hover flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-4 py-3 text-xs font-black text-white shadow-xs transition duration-150 active:scale-[0.98]"
                        >
```

- [ ] **Step 7: Gắn `data-tour="config-panel"`**

Tại cột phải (dòng ~548):

```tsx
                <div className="h-full flex-1 overflow-hidden bg-slate-50 p-5" data-tour="config-panel">
```

- [ ] **Step 8: Gắn `data-tour="completion-conditions"` + tooltip cho nút điều kiện**

Tại nút "Điều kiện hoàn thành" (dòng ~398-408), bọc bằng Tooltip và thêm `data-tour`:

```tsx
                    {sortedSessions.length > 0 && (
                        <Tooltip title={UI_TEXT.typeDetailCourse.tooltipCompletionConditions} placement="bottom">
                            <button
                                type="button"
                                data-tour="completion-conditions"
                                onClick={() => {
                                    setIsSessionSelectModalOpen(true);
                                }}
                                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-brand-300 px-4 py-2 text-xs font-bold text-brand-800 shadow-xs transition hover:bg-brand-50"
                            >
                                <ShieldAlert className="size-4 text-brand-600" />
                                <span>{UI_TEXT.typeDetailCourse.completionConditions}</span>
                            </button>
                        </Tooltip>
                    )}
```

> `Tooltip` bọc trực tiếp phần tử làm trigger; ở đây trigger là `<button>` thường (dùng `title` prop của Tooltip cho nội dung). Nếu react-aria yêu cầu trigger là focusable — `<button>` đã focusable nên hợp lệ.

- [ ] **Step 9: Gắn `data-tour="save"`**

Tại nút `<Button ...>` "Lưu thay đổi" (dòng ~409), thêm prop:

```tsx
                    <Button
                        data-tour="save"
                        onClick={async () => {
```

> `Button` base truyền các prop DOM còn lại xuống element gốc; nếu type của `Button` không cho `data-*`, bọc nút trong `<span data-tour="save">...</span>` thay thế.

- [ ] **Step 10: Type-check + lint**

Run:
```bash
pnpm type-check && pnpm exec eslint src/views/type/type-detail-course-view.tsx --max-warnings=0
```
Expected: PASS. Nếu lỗi `data-tour` trên `Button` → dùng phương án `<span data-tour="save">` ở Step 9.

- [ ] **Step 11: Commit**

```bash
git add src/views/type/type-detail-course-view.tsx
git commit -m "feat: nut huong dan + data-tour + tooltip dieu kien hoan thanh"
```

---

### Task 7: Tooltip "Số lần AI chấm"

**Files:**
- Modify: `src/components/application/type-detail-course/components/session-form.tsx`

- [ ] **Step 1: Import Tooltip + icon (nếu chưa có)**

Kiểm tra đầu file `session-form.tsx`. Nếu chưa import, thêm:

```ts
import { HelpCircle } from "@untitledui/icons";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
```

- [ ] **Step 2: Thêm icon (?) cạnh label "Số lần AI chấm"**

Tại label field (dòng ~120), thay:

```tsx
                                <label className="text-sm font-medium text-slate-500">{UI_TEXT.courseDetail.maxAiGradeAttemptsLabel}</label>
```

thành:

```tsx
                                <label className="flex items-center gap-1 text-sm font-medium text-slate-500">
                                    {UI_TEXT.courseDetail.maxAiGradeAttemptsLabel}
                                    <Tooltip title={UI_TEXT.typeDetailCourse.tooltipMaxAiGrade} placement="top">
                                        <TooltipTrigger isDisabled={false} className="cursor-pointer text-slate-400 transition hover:text-slate-600">
                                            <HelpCircle className="size-3.5" />
                                        </TooltipTrigger>
                                    </Tooltip>
                                </label>
```

- [ ] **Step 3: Type-check + lint**

Run:
```bash
pnpm type-check && pnpm exec eslint src/components/application/type-detail-course/components/session-form.tsx --max-warnings=0
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/application/type-detail-course/components/session-form.tsx
git commit -m "feat: tooltip so lan AI cham trong session form"
```

---

### Task 8: Tooltip kéo-thả trên session node

**Files:**
- Modify: `src/components/application/type-detail-course/components/session-node.tsx`

- [ ] **Step 1: Xác định điểm neo**

Đọc `session-node.tsx`, tìm phần header của node (tên buổi học hoặc icon handle/số thứ tự). Mục tiêu: đặt 1 icon (?) hoặc bọc tooltip vào phần tử biểu thị "kéo được".

- [ ] **Step 2: Thêm tooltip kéo-thả**

Nếu node có icon handle (vd `GripVertical`/số thứ tự), bọc nó:

```tsx
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
```

```tsx
<Tooltip title={UI_TEXT.typeDetailCourse.tooltipDragSession} placement="right">
    <TooltipTrigger isDisabled={false} className="cursor-grab text-slate-400">
        {/* icon handle hiện có, ví dụ <GripVertical className="size-4" /> */}
    </TooltipTrigger>
</Tooltip>
```

> Nếu node **không** có handle riêng, KHÔNG thêm icon mới gây rối — thay vào đó đặt `title` HTML gốc lên phần tử ngoài cùng của node như fallback nhẹ:
> ```tsx
> <div ... title={UI_TEXT.typeDetailCourse.tooltipDragSession}>
> ```
> Chọn 1 trong 2 tuỳ cấu trúc thực tế của node; ưu tiên `Tooltip` base nếu có handle.

- [ ] **Step 3: Type-check + lint**

Run:
```bash
pnpm type-check && pnpm exec eslint src/components/application/type-detail-course/components/session-node.tsx --max-warnings=0
```
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/application/type-detail-course/components/session-node.tsx
git commit -m "feat: tooltip keo-tha tren session node"
```

---

### Task 9: Nghiệm thu toàn màn trên dev server

**Files:** (không sửa code, chỉ kiểm chứng; sửa nếu phát hiện lỗi)

- [ ] **Step 1: Lint + type-check toàn bộ thay đổi**

Run:
```bash
pnpm type-check && pnpm lint:check
```
Expected: PASS (nếu `lint:check` báo nhiều lỗi CRLF pre-existing không liên quan file mình sửa, bỏ qua — chỉ quan tâm file trong plan này; xem memory "lms-portal-api CRLF" tương tự).

- [ ] **Step 2: Chạy dev server và mở màn builder**

Dùng preview_start với dev server, điều hướng tới 1 khóa học có buổi học: `/type/<id>/<courseId>` (hoặc `/elearning/<courseId>`). Xác định URL thật từ danh sách khóa học.

- [ ] **Step 3: Kiểm tra tour**

- Bấm nút "?" cạnh tiêu đề → tour mở, highlight lần lượt: workspace → cấu trúc → thêm buổi học → vùng cấu hình → điều kiện hoàn thành → lưu.
- Kiểm tra popover style (bo góc, nút wine "Tiếp"/"Xong").
- Bấm Esc / "Xong" → tour đóng gọn, không kẹt overlay.
- Kiểm tra `read_console_messages` không có lỗi.

- [ ] **Step 4: Kiểm tra khi khóa học rỗng (không có buổi học)**

Mở 1 khóa học chưa có buổi học → nút "Điều kiện hoàn thành" không hiển thị. Bấm "?" → tour vẫn chạy, tự bỏ qua bước 5, không lỗi console.

- [ ] **Step 5: Kiểm tra 3 tooltip**

- Hover nút "Điều kiện hoàn thành" → hiện chú thích.
- Mở form buổi học (Thêm/Sửa) → hover icon (?) cạnh "Số lần AI chấm" → hiện chú thích.
- Hover phần kéo-thả trên session node → hiện chú thích.

- [ ] **Step 6: Chụp screenshot làm bằng chứng**

Dùng `computer {action: "screenshot"}` chụp tour đang mở + 1 tooltip. Gửi cho user.

- [ ] **Step 7: (Nếu có lỗi) sửa và commit lại**

Chẩn đoán từ console/source, sửa file tương ứng, chạy lại type-check/lint, commit với message mô tả fix.

---

## Self-Review (đã chạy khi viết plan)

- **Spec coverage:** 6 bước tour (Task 5+6), 3 tooltip (Task 6/7/8), hook wrapper (Task 4), CSS token (Task 2), text trong UI_TEXT (Task 3), nút "?" chỉ chạy khi bấm (Task 6), xử lý nút điều kiện hoàn thành ẩn (Task 5 note + Task 9 Step 4). ✔ Khớp spec.
- **Placeholder scan:** Không có TBD/TODO; mọi step có code hoặc lệnh cụ thể. Task 8 có 2 nhánh rõ ràng tuỳ cấu trúc node thực tế (cần đọc file khi thực thi) — đây là quyết định phụ thuộc runtime, đã nêu tiêu chí chọn.
- **Type consistency:** `useGuidedTour` trả `{ start }`; view dùng `const { start: startTour }`. `typeDetailCourseTourSteps` khớp `DriveStep[]`. Text key `UI_TEXT.guidedTour.*` và `UI_TEXT.typeDetailCourse.tooltip*` nhất quán giữa Task 3 và Task 5-8. ✔
