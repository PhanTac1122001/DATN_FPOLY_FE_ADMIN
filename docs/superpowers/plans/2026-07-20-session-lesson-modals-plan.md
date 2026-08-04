# Thay thế Prompt bằng Modal khi Thêm Chương học và Bài học Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay thế các hộp thoại `prompt` mặc định của trình duyệt bằng `CustomModal` khi thêm chương học mới và thêm bài học mới.

**Architecture:** Sử dụng `CustomModal` và `Dialog` được cung cấp sẵn của hệ thống (sử dụng thư viện `react-aria-components`), quản lý trạng thái đóng/mở và tên nhập bằng React states trong các component tương ứng.

**Tech Stack:** React, Next.js, TypeScript, React Aria Components.

## Global Constraints
- Sử dụng đúng cấu trúc của `CustomModal` (`CustomModal.Root`, `CustomModal.Content`, `Dialog`).
- Không để trống tên chương học hoặc tên bài học khi thêm mới.
- CSS và Tailwind classes cần đồng bộ với các phần khác của ứng dụng.

---

### Task 1: Thay thế Prompt thêm Chương học (Session) bằng Modal trong TypeDetailCourseView

**Files:**
- Modify: `src/views/type/type-detail-course-view.tsx`

**Interfaces:**
- Consumes: `CustomModal`, `Dialog` từ `@/components/ui/custom-modal`
- Produces: Giao diện modal thêm chương học mới, thay thế cho prompt trình duyệt.

- [ ] **Step 1: Định nghĩa các State quản lý Modal thêm chương học**

Chèn thêm các state quản lý trạng thái mở/đóng và giá trị nhập của chương học mới vào bên dưới các hook state hiện tại (khoảng dòng 27-28):
```tsx
    const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
    const [newSessionName, setNewSessionName] = useState("");
```

- [ ] **Step 2: Cập nhật hàm handleAddSession**

Sửa đổi hàm `handleAddSession` (khoảng dòng 83-86) để mở modal thay vì gọi `prompt` trực tiếp:
```tsx
    const handleAddSession = () => {
        setNewSessionName("");
        setIsAddSessionOpen(true);
    };
```

- [ ] **Step 3: Thêm hàm xử lý khi Submit form thêm chương học**

Định nghĩa hàm `handleSubmitAddSession` để gọi mutation `addSessionMutation`:
```tsx
    const handleSubmitAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSessionName.trim()) {
            addSessionMutation.mutate(newSessionName.trim(), {
                onSuccess: () => {
                    setIsAddSessionOpen(false);
                    setNewSessionName("");
                }
            });
        }
    };
```

- [ ] **Step 4: Chèn CustomModal thêm chương học vào cấu trúc JSX của TypeDetailCourseView**

Thêm modal JSX vào cuối component `TypeDetailCourseView` (ngay trước thẻ đóng `</div>` của component chính, khoảng dòng 210):
```tsx
            {/* Custom Modal for Adding Session */}
            <CustomModal.Root open={isAddSessionOpen} onOpenChange={setIsAddSessionOpen}>
                <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <form onSubmit={handleSubmitAddSession} className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Thêm chương học mới</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Nhập tên chương học mới (Chapter name) để bắt đầu xây dựng cấu trúc khóa học.</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tên chương học</label>
                                <input
                                    type="text"
                                    value={newSessionName}
                                    onChange={(e) => setNewSessionName(e.target.value)}
                                    placeholder="Ví dụ: Giới thiệu về React, Phát triển ứng dụng..."
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddSessionOpen(false)}
                                    className="bg-slate-50 border-slate-200 text-slate-600 px-4 py-2 text-xs font-bold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addSessionMutation.isPending || !newSessionName.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-xs font-black rounded-xl"
                                >
                                    {addSessionMutation.isPending ? "Đang thêm..." : "Xác nhận"}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>
```

- [ ] **Step 5: Chạy ứng dụng để kiểm tra việc mở/đóng và thêm chương học**

Mở trình duyệt, nhấn nút thêm chương học "+", đảm bảo modal hiện lên đúng thiết kế, điền tên chương học và xác nhận, chương học mới phải được thêm thành công và modal tự động đóng.

---

### Task 2: Thay thế Prompt thêm Bài học (Lesson) bằng Modal trong SessionNode

**Files:**
- Modify: `src/views/type/type-detail-course-view.tsx`

**Interfaces:**
- Consumes: `CustomModal`, `Dialog` từ `@/components/ui/custom-modal`
- Produces: Giao diện modal thêm bài học mới, thay thế cho prompt trình duyệt.

- [ ] **Step 1: Định nghĩa các State quản lý Modal thêm bài học trong SessionNode**

Thêm state vào đầu component `SessionNode` (khoảng dòng 337-338):
```tsx
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [newLessonName, setNewLessonName] = useState("");
```

- [ ] **Step 2: Cập nhật hàm handleAddLesson**

Sửa đổi hàm `handleAddLesson` (khoảng dòng 383-387) để hiển thị modal thay vì prompt:
```tsx
    const handleAddLesson = (e: React.MouseEvent) => {
        e.stopPropagation();
        setNewLessonName("");
        setIsAddLessonOpen(true);
    };
```

- [ ] **Step 3: Thêm hàm xử lý khi Submit form thêm bài học**

Định nghĩa hàm `handleSubmitAddLesson` để gọi mutation `addLessonMutation`:
```tsx
    const handleSubmitAddLesson = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLessonName.trim()) {
            addLessonMutation.mutate(newLessonName.trim(), {
                onSuccess: () => {
                    setIsAddLessonOpen(false);
                    setNewLessonName("");
                }
            });
        }
    };
```

- [ ] **Step 4: Chèn CustomModal thêm bài học vào cấu trúc JSX của SessionNode**

Thêm modal JSX vào cuối component `SessionNode` (ngay trước thẻ đóng `</div>` cuối cùng của component `SessionNode` khoảng dòng 490):
```tsx
            {/* Custom Modal for Adding Lesson */}
            <CustomModal.Root open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <CustomModal.Content className="max-w-md !rounded-[20px] w-full">
                    <Dialog className="bg-white p-5 rounded-[20px] flex flex-col gap-4 outline-none shadow-2xl relative">
                        <form onSubmit={handleSubmitAddLesson} className="flex flex-col gap-4">
                            <div>
                                <h3 className="text-sm font-black text-slate-800">Thêm bài học mới</h3>
                                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Nhập tên bài học mới vào chương học <strong>"{session.name}"</strong>.</p>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Tên bài học</label>
                                <input
                                    type="text"
                                    value={newLessonName}
                                    onChange={(e) => setNewLessonName(e.target.value)}
                                    placeholder="Ví dụ: Tổng quan và cài đặt, Tạo component đầu tiên..."
                                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:outline-none focus:border-wine bg-white font-semibold"
                                    autoFocus
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    type="button"
                                    onClick={() => setIsAddLessonOpen(false)}
                                    className="bg-slate-50 border-slate-200 text-slate-600 px-4 py-2 text-xs font-bold"
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={addLessonMutation.isPending || !newLessonName.trim()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-none px-4 py-2 text-xs font-black rounded-xl"
                                >
                                    {addLessonMutation.isPending ? "Đang thêm..." : "Xác nhận"}
                                </Button>
                            </div>
                        </form>
                    </Dialog>
                </CustomModal.Content>
            </CustomModal.Root>
```

- [ ] **Step 5: Chạy ứng dụng kiểm tra tính năng thêm bài học**

Mở ứng dụng, nhấn nút "+" ở một chương học để thêm bài học. Xác nhận modal thêm bài học hoạt động tốt, thêm bài học thành công, danh sách bài học mở ra tự động và modal tự động đóng.

---

### Task 3: Trang chờ (Empty State) và Modal chọn loại tài liệu cho Bài đọc (Reading Material) trong ReadingConfigTab

**Files:**
- Modify: `src/constants/ui-text.constants.ts`
- Modify: `src/views/type/type-detail-course-view.tsx`

**Interfaces:**
- Consumes: `UI_TEXT`, `CustomModal`, `Dialog`
- Produces: Giao diện Empty State khi chưa có bài đọc, kèm theo Modal chọn nguồn tài liệu đồng bộ hoàn toàn với phần video.

- [ ] **Step 1: Khai báo các hằng số văn bản mới trong `ui-text.constants.ts`**

Thêm các văn bản sau vào cuối block `learningMaterials` trong [ui-text.constants.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/constants/ui-text.constants.ts):
```typescript
        emptyReadingTitle: "Tài liệu / Bài đọc hiện tại đang trống",
        emptyReadingDesc: "Vui lòng chọn hoặc tải lên tài liệu cho bài học này để tiếp tục cấu hình học liệu.",
        addReadingButton: "+ Thêm tài liệu / bài đọc",
        selectDocSourceTitle: "Chọn loại tài liệu",
        selectDocSourceDesc: "Chọn cách thức bạn muốn thêm tài liệu vào bài học này",
        uploadPdfTitle: "Tải tệp PDF",
        uploadPdfDesc: "Chọn tệp tài liệu từ máy tính",
        writeDocTitle: "Nội dung bài viết",
        writeDocDesc: "Nhập nội dung bài đọc bằng văn bản",
```

- [ ] **Step 2: Cập nhật State trong component ReadingConfigTab**

Tại component `ReadingConfigTab` trong [type-detail-course-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/type/type-detail-course-view.tsx):
- Thay thế state `isDropdownOpen` bằng `isSelectModalOpen` (boolean, mặc định `false`).
- Xóa bỏ các state và logic liên quan đến dropdown (như `openDirection`, `coords`, `dropdownRef`, `updateCoords`, các hook scroll/resize event listener).

- [ ] **Step 3: Cập nhật phần JSX hiển thị khi chưa chọn tài liệu (Empty State)**

Tại JSX của `ReadingConfigTab`, khi `readingType === ""`, thay thế khối dropdown select cũ bằng giao diện Empty State và Modal chọn loại tài liệu mới sử dụng `CustomModal` và `Dialog`.

- [ ] **Step 4: Chạy type-check và lint:check kiểm tra tính toàn vẹn**

Run: `pnpm run type-check` và `pnpm run lint:check` để đảm bảo code sạch, không có lỗi runtime hay vi phạm quy tắc ESLint.

