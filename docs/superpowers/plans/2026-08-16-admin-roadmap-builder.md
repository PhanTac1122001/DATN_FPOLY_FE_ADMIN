# Admin Roadmap Builder — Implementation Plan

> **For agentic workers:** thực thi theo superpowers:subagent-driven-development, mỗi task một subagent + 2 vòng review. Đây là FE (Next.js) — KHÔNG có unit test cho các màn CRUD đơn giản; verify bằng `npm run type-check`, `npm run lint:check`, `npm run build`, và browser preview. Steps dùng checkbox `- [ ]`.

**Goal:** Một màn "Roadmap builder" gộp trong admin (`/course-roadmap`) để set-up roadmap môn học ít bước nhất: xem môn xếp theo cột nhóm môn, chuyển môn giữa nhóm (đơn lẻ + hàng loạt), gắn tag nghề nghiệp, quản lý nhóm môn & tags ngay tại chỗ. Đồng thời thêm 2 field (nhóm môn + tags) vào form Môn học.

**Architecture:** Tiêu thụ staff API của lms-portal-api (`/staff/course-categories`, `/staff/tags`, `/staff/courses` + `/staff/courses/assign-category`). Nhân bản mẫu vertical-slice của feature `systems`. Không thêm thư viện kéo-thả: chuyển nhóm bằng menu trên card + tick chọn hàng loạt.

**Tech Stack:** Next.js App Router, react-query, react-aria-components, sonner toast, lucide-react, tailwind. Path alias `@/*` → `src/*`.

**Repo đang ở:** `C:\Users\ADMIN\Desktop\New folder\QLDT_ADMIN_FE`, nhánh `feat/roadmap-admin-setup`.

## Contract API staff (đã xác nhận từ backend đã build)

| Method | Path | Body / Query | Trả về (đã unwrap `{data}`) |
|---|---|---|---|
| GET | `/staff/course-categories` | — | `CourseCategory[]` (kể cả `isActive=false`), sort priority,name |
| GET | `/staff/course-categories/:id` | — | `CourseCategory` |
| POST | `/staff/course-categories` | `{name, description?, color?, icon?, priority?, isActive?}` | `CourseCategory` |
| PUT | `/staff/course-categories/:id` | như trên (mọi field optional) | `CourseCategory` |
| DELETE | `/staff/course-categories/:id` | — | 204; **409** nếu còn môn dùng (message VN trong `HttpError.message`) |
| GET | `/staff/tags` | — | `CareerTag[]` |
| POST | `/staff/tags` | `{name}` | `CareerTag` |
| PUT | `/staff/tags/:id` | `{name}` | `CareerTag` |
| DELETE | `/staff/tags/:id` | — | 204; **409** nếu còn môn dùng |
| GET | `/staff/courses` | `?search=` | `CourseBackendEntity[]` — **giờ có** `categoryId`, `careerTagIds`, populated `category{id,name,color,icon}`, `careerTags[{id,name}]` |
| POST/PUT | `/staff/courses`, `/staff/courses/:id` | course DTO + `categoryId?: string\|null`, `careerTagIds?: string[]` | `CourseBackendEntity` |
| POST | `/staff/courses/assign-category` | `{courseIds: string[], categoryId: string\|null}` | `{updated: number}` |

`CourseCategory` = `{ id, name, description?, color?, icon?, priority, isActive, createdAt }`.
`CareerTag` = `{ id, name, mysqlId?, createdAt }`.

Envelope: BE trả `{statusCode, data}`; service unwrap `data` (mẫu `session-type.service.ts`).
Lỗi: `httpClient` ném `HttpError{status, message, payload}` (`src/lib/http-client.ts`), `message` đã là message VN từ BE → toast trực tiếp `e.message` cho 409.

## Conventions bắt buộc

- Chuỗi VN gom vào `src/constants/ui-text.constants.ts` — thêm namespace `UI_TEXT.courseRoadmap`, `UI_TEXT.courseCategories`, `UI_TEXT.careerTags`. KHÔNG hardcode chuỗi trong JSX.
- Toast: `import { toast } from "@/services/toast.service"` → `toast.success(title, desc)` / `toast.error(title, desc)`.
- Query key: mảng inline (`["course-categories"]`, `["career-tags"]`, `["courses", search]`).
- Mutation `onSuccess` → `queryClient.invalidateQueries({queryKey})` + toast + đóng modal.
- Service: object-style, `httpClient`, `HttpMethod`, `unwrap<T>` helper (copy từ session-type.service).
- Select 1 giá trị: `@/components/base/select/select` (`Select` + `Select.Item`, props `items/selectedKey/onSelectionChange`). Multi: `@/components/base/select/multi-combobox` (`MultiComboBox`, props `items: {id,label}[]`, `selectedKeys: string[]`, `onSelectionChange: (keys:string[])=>void`).
- Modal shell: `@/components/ui/custom-modal` (`CustomModal.Root`/`CustomModal.Content` + `Dialog` + `Heading slot="title"`).
- KHÔNG sửa/đụng `category-management-modal.tsx` và các hàm `getCourseCategories/addCourseCategory/...` trong `course.service.ts` — đó là stub scoring-method, KHÁC hẳn nhóm môn roadmap. Đặt tên feature mới rõ ràng để không lẫn.
- Verify mỗi task: `npm run type-check` (sạch), `npm run lint:check` (không lỗi mới). Commit không có trailer Co-Authored-By. Nhánh `feat/roadmap-admin-setup`.

## File structure (mới/sửa)

```
src/types/course-category.types.ts              # CREATE
src/types/career-tag.types.ts                   # CREATE
src/services/course-category.service.ts         # CREATE
src/services/career-tag.service.ts              # CREATE
src/schemas/course-category.schema.ts           # CREATE (zod)
src/types/course.types.ts                       # MODIFY: +categoryId, careerTagIds trên Backend/Item/Payload
src/services/course.service.ts                  # MODIFY: map field mới 2 chiều + assignCourseCategory()
src/constants/ui-text.constants.ts              # MODIFY: +3 namespace
src/constants/admin-sidebar.constants.ts        # MODIFY: +menu "Roadmap môn học"

src/components/application/modals/course-category-manager-modal.tsx  # CREATE (CRUD nhóm môn)
src/components/application/modals/career-tag-manager-modal.tsx       # CREATE (CRUD tags)

src/app/course-roadmap/page.tsx                              # CREATE
src/views/course-roadmap/course-roadmap-client-view.tsx     # CREATE
src/views/course-roadmap/course-roadmap-view.tsx            # CREATE (board hub)
src/components/application/course-roadmap/roadmap-column.tsx # CREATE
src/components/application/course-roadmap/course-card.tsx    # CREATE
src/components/application/course-roadmap/bulk-assign-bar.tsx# CREATE
src/components/application/course-roadmap/course-tags-popover.tsx # CREATE

src/components/application/modals/course-form-modal.tsx     # MODIFY: +2 field
```

---

### Task 1: Lớp data — types, services, course.service mapping, sidebar, ui-text

**Files:** `course-category.types.ts`, `career-tag.types.ts`, `course-category.service.ts`, `career-tag.service.ts`, `course.types.ts` (modify), `course.service.ts` (modify), `ui-text.constants.ts` (modify), `admin-sidebar.constants.ts` (modify).

- [ ] **Step 1: Types**

`src/types/course-category.types.ts`:
```ts
export interface CourseCategory {
    id: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    priority: number;
    isActive: boolean;
    createdAt: string;
}
export interface CreateCourseCategoryPayload {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    priority?: number;
    isActive?: boolean;
}
export type UpdateCourseCategoryPayload = Partial<CreateCourseCategoryPayload>;
```

`src/types/career-tag.types.ts`:
```ts
export interface CareerTag {
    id: string;
    name: string;
    mysqlId?: number;
    createdAt: string;
}
export interface CreateCareerTagPayload { name: string; }
export type UpdateCareerTagPayload = { name: string };
```

- [ ] **Step 2: Services** (mẫu `src/services/session-type.service.ts` — copy `unwrap` helper)

`src/services/course-category.service.ts`: object `courseCategoryService` với `getAll(): Promise<CourseCategory[]>` (GET `/staff/course-categories`), `create(dto)`, `update(id, dto)` (PUT), `remove(id)` (DELETE). Không nuốt lỗi — để `HttpError` ném ra cho caller toast.

`src/services/career-tag.service.ts`: `careerTagService` với `getAll`, `create`, `update` (PUT), `remove` → `/staff/tags`.

- [ ] **Step 3: `course.types.ts` — thêm field mới** (KHÔNG đụng field `category` cũ = scoringMethod)

Trong `CourseBackendEntity` thêm:
```ts
    categoryId?: string | null;
    careerTagIds?: string[];
    category?: { id: string; name: string; color?: string; icon?: string } | null;
    careerTags?: { id: string; name: string }[];
```
Trong `CourseItem` thêm:
```ts
    categoryId?: string | null;
    careerTagIds?: string[];
    categoryName?: string;          // từ populated category.name để hiển thị nhanh
    careerTags?: { id: string; name: string }[]; // populated để render chip
```
(`CreateCoursePayload`/`UpdateCoursePayload` tự kế thừa qua `Omit`/`Partial`.)

- [ ] **Step 4: `course.service.ts` — map 2 chiều + assign**

Trong `mapBackendToCourseItem` thêm:
```ts
        categoryId: raw.categoryId ?? null,
        careerTagIds: raw.careerTagIds ?? [],
        categoryName: raw.category?.name,
        careerTags: raw.careerTags ?? [],
```
Trong `mapPayloadToCreateDto` thêm vào object trả về:
```ts
        categoryId: payload.categoryId ?? null,
        careerTagIds: payload.careerTagIds ?? [],
```
Trong `updateCourse` thêm (kiểu sparse như các field khác):
```ts
    if (payload.categoryId !== undefined) dto.categoryId = payload.categoryId;
    if (payload.careerTagIds !== undefined) dto.careerTagIds = payload.careerTagIds;
```
Thêm hàm export:
```ts
export async function assignCourseCategory(courseIds: string[], categoryId: string | null): Promise<{ updated: number }> {
    const response = await httpClient<any>("/staff/courses/assign-category", {
        method: HttpMethod.POST,
        body: JSON.stringify({ courseIds, categoryId }),
    });
    return unwrapData<{ updated: number }>(response) ?? { updated: 0 };
}
```

- [ ] **Step 5: ui-text** — thêm 3 namespace `UI_TEXT.courseRoadmap`, `UI_TEXT.courseCategories`, `UI_TEXT.careerTags` với các chuỗi: tiêu đề màn, nút "Quản lý nhóm môn"/"Quản lý tags", "Chưa phân nhóm", "Gán vào nhóm", "Bỏ nhóm", nhãn form (tên/mô tả/màu/icon/thứ tự/hiện-ẩn), toast success/error, xác nhận xoá, thông báo khi 409, empty state. (Đọc namespace hiện có để theo format.)

- [ ] **Step 6: Sidebar** — trong `admin-sidebar.constants.ts`, import thêm 1 icon lucide chưa dùng (vd `Waypoints` hoặc `Milestone` hoặc `Route`) và thêm vào `dtItems` NGAY SAU mục "Môn học":
```ts
    { label: "Roadmap môn học", icon: Waypoints, path: "/course-roadmap" },
```

- [ ] **Step 7: Verify** — `npm run type-check` sạch, `npm run lint:check` không lỗi mới. Commit: `feat(roadmap): add course-category & career-tag data layer, course fields, sidebar entry`.

---

### Task 2: Modal quản lý Nhóm môn (CRUD)

**Files:** `src/schemas/course-category.schema.ts`, `src/components/application/modals/course-category-manager-modal.tsx`.

Mẫu cấu trúc: `src/components/application/modals/session-type-modal.tsx` (toggle `view: "list" | "form"`). Mẫu form RHF+zod: `system-modal.tsx` + `src/schemas/system.schema.ts`.

- [ ] **Step 1: Zod schema** `course-category.schema.ts`: `name` (bắt buộc, min 1, message VN), `description` optional, `color` optional (chấp nhận rỗng hoặc hex `#RRGGBB`), `icon` optional, `priority` number ≥ 0 (default 0), `isActive` boolean (default true). Export `courseCategorySchema` + `type CourseCategoryFormValues = z.infer<...>`.

- [ ] **Step 2: Modal** `course-category-manager-modal.tsx`, props `{ isOpen, onOpenChange }`:
  - `useQuery(["course-categories"], courseCategoryService.getAll)`.
  - View "list": bảng/danh sách nhóm (ô màu swatch, tên, priority, badge Ẩn/Hiện), nút Sửa/Xoá mỗi dòng, nút "Tạo nhóm môn" → sang view "form".
  - View "form": RHF+zod. `color` = bảng preset swatch (mảng hex cố định, ~8 màu) + ô nhập hex; `icon` = `Input` text (hint: "Tên icon theo bộ lms: của portal, vd code, globe"); `priority` = Input number; `isActive` = toggle/checkbox.
  - `createMutation`/`updateMutation` (courseCategoryService) → onSuccess invalidate `["course-categories"]` + toast + về view "list".
  - Xoá: xác nhận (confirm dialog/inline), gọi `remove`; **catch**: `if (e instanceof HttpError && e.status === 409) toast.error(UI_TEXT..., e.message)` (hiện message BE "đang được N môn dùng"), else toast lỗi chung. Import `HttpError` từ `@/lib/http-client`.
  - Sau xoá/sửa cũng invalidate `["courses"]` (vì builder hiển thị màu/tên nhóm).

- [ ] **Step 3: Verify** type-check + lint + render thử (task 4 sẽ mở modal từ builder; ở bước này chỉ cần compile sạch). Commit: `feat(roadmap): course category manager modal (CRUD)`.

---

### Task 3: Modal quản lý Tags nghề nghiệp (CRUD)

**Files:** `src/components/application/modals/career-tag-manager-modal.tsx`.

Đơn giản hơn Task 2 (chỉ field `name`). Có thể plain `useState` (mẫu `session-type-form-modal.tsx`) hoặc RHF — chọn cho gọn.

- [ ] **Step 1:** Modal props `{ isOpen, onOpenChange }`: `useQuery(["career-tags"], careerTagService.getAll)`; danh sách tag + nút Sửa/Xoá + ô thêm nhanh (input name + nút Thêm). create/update/remove qua `careerTagService`, invalidate `["career-tags"]` (+ `["courses"]`). Xoá 409 → toast `e.message` (tag đang được N môn dùng).
- [ ] **Step 2:** Verify type-check + lint. Commit: `feat(roadmap): career tag manager modal (CRUD)`.

---

### Task 4: Màn Roadmap builder (board hub)

**Files:** `src/app/course-roadmap/page.tsx`, `src/views/course-roadmap/course-roadmap-client-view.tsx`, `src/views/course-roadmap/course-roadmap-view.tsx`, `src/components/application/course-roadmap/{roadmap-column,course-card,bulk-assign-bar,course-tags-popover}.tsx`.

Mẫu page/client-view/auth/layout: `src/app/systems/page.tsx` + `src/views/systems/systems-client-view.tsx` (auth guard + `AdminLayout`).

- [ ] **Step 1: page + client-view** — `page.tsx` server (metadata + render `<CourseRoadmapClientView/>`). `course-roadmap-client-view.tsx`: `"use client"`, auth guard (`useAuth`, redirect `/login`), `<AdminLayout title="Roadmap môn học" subtitle=... disableScroll>` bọc `<CourseRoadmapView/>`.

- [ ] **Step 2: board view** `course-roadmap-view.tsx`:
  - Queries: `["course-categories"]` (getAll), `["courses", search]` (getCoursesList). `useMemo` gom courses theo `categoryId` → map các cột.
  - Cột = các category `isActive` (sort theo `priority` từ API, giữ nguyên) + cột cuối "Chưa phân nhóm" cho course có `categoryId == null` HOẶC categoryId trỏ nhóm không nằm trong danh sách active.
  - Toolbar trên: tiêu đề, ô search (lọc course theo name/code — client filter hoặc truyền vào query key), nút "Quản lý nhóm môn" (mở `CourseCategoryManagerModal`), nút "Quản lý tags" (mở `CareerTagManagerModal`).
  - State chọn: `selectedIds: Set<string>`. Khi `size>0` render `<BulkAssignBar>` (sticky trên cùng vùng board).
  - Mutation chuyển nhóm: `assignCourseCategory(courseIds, categoryId|null)` → onSuccess invalidate `["courses"]` + toast (dùng `{updated}`), clear selection.

- [ ] **Step 3: components**
  - `roadmap-column.tsx`: header (ô màu từ `category.color` fallback xám, tên, số môn, menu "⋯" Sửa/Ẩn nhóm mở manager modal ở đúng nhóm), list `<CourseCard>`.
  - `course-card.tsx`: checkbox chọn, mã + tên môn, chip `careerTags`, một control "Chuyển nhóm" (dùng `Select` nhỏ hoặc menu) liệt kê các nhóm active + "Bỏ nhóm" → gọi mutation `assignCourseCategory([courseId], target)`. Nút/icon mở `<CourseTagsPopover>` để sửa tag của môn.
  - `bulk-assign-bar.tsx`: hiện "Đã chọn N môn", `Select` chọn nhóm đích (+ "Bỏ nhóm"), nút Áp dụng → `assignCourseCategory([...selected], target)`; nút Bỏ chọn.
  - `course-tags-popover.tsx`: `MultiComboBox` items = career tags (`["career-tags"]`), `selectedKeys` = careerTagIds hiện tại của môn; Lưu → `updateCourse(courseId, { careerTagIds })` → invalidate `["courses"]` + toast. (updateCourse đã hỗ trợ gửi mỗi careerTagIds.)

- [ ] **Step 4: Verify** type-check + lint + build. Commit: `feat(roadmap): course roadmap builder board screen`.

---

### Task 5: Field nhóm môn + tags trong form Môn học

**Files:** `src/components/application/modals/course-form-modal.tsx`.

- [ ] **Step 1:** Thêm 2 field vào form (đặt gần đầu, tách khỏi khối "category"=scoringMethod, nhãn rõ ràng "Nhóm môn (roadmap)" và "Tags nghề nghiệp"):
  - `Select` nhóm môn: items từ `useQuery(["course-categories"])` lọc `isActive` (nhưng luôn thêm giá trị hiện `initialData?.categoryId` nếu nhóm đó đã ẩn, để không mất giá trị), thêm tuỳ chọn rỗng "Không phân nhóm". State `categoryId`.
  - `MultiComboBox` tags: items từ `["career-tags"]`, `selectedKeys` = state `careerTagIds`.
  - Khởi tạo state từ `initialData?.categoryId` / `initialData?.careerTagIds` (đọc từ CourseItem đã map ở Task 1).
  - Đưa `categoryId`, `careerTagIds` vào payload `onSubmit` (CreateCoursePayload đã có field sau Task 1).
- [ ] **Step 2:** Verify type-check + lint + build. Kiểm tra form môn vẫn tạo/sửa như cũ (không vỡ). Commit: `feat(roadmap): category + career tag fields in course form`.

---

### Task 6: Verify tổng thể + browser preview + review

- [ ] **Step 1:** `npm run type-check` (sạch), `npm run lint:check` (không lỗi mới), `npm run build` (thành công).
- [ ] **Step 2:** Browser preview: tạo `.claude/launch.json` cho `npm run dev` (port từ script/next mặc định 3000) nếu chưa có; mở `/course-roadmap`. Nếu cần đăng nhập mà không có tài khoản/BE, ít nhất xác minh route render, không lỗi console nghiêm trọng, layout cột hiển thị. Ghi lại điều gì verify được / không.
- [ ] **Step 3:** Final review toàn nhánh: coverage đủ 4 phần + form field; nhất quán convention; không đụng stub scoring-method; không hardcode chuỗi. Ghi follow-up nếu có.

## Self-review

- Coverage: 4 phần user chốt (nhóm môn CRUD, tags CRUD, field form môn, bulk assign) + gộp vào 1 màn builder → Task 1 (data) + 2 (nhóm) + 3 (tags) + 4 (builder: board + move + bulk + tag popover) + 5 (form). Đủ.
- Không đụng `category-management-modal`/scoring-method stub. Field mới đặt tên `categoryId`/`careerTagIds` tách khỏi `category`(=scoringMethod).
- Verify FE bằng type-check/lint/build/browser (không TDD vì repo không unit-test màn CRUD).
