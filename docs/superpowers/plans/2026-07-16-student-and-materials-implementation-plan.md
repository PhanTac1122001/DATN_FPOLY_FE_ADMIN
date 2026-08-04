# Student Management & Learning Materials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a premium management interface in `lms-portal-admin` for Managing Students, mapping Course-Classes, and configuring Learning Materials with a rich Embedded Student Player Preview.

**Architecture:** Use App Router page endpoints (`/users`, `/classes`, `/courses`), modular client-side view components (`src/views/`), dynamic state control via React Hook Form + Zod validation schemas, and fetch state synchronization using TanStack React Query hooks.

**Tech Stack:** React 19, Next.js 16, TypeScript, TanStack Query, React Hook Form, Zod, Lucide Icons, Tailwind CSS v4, sonner (toast).

## Global Constraints
- Target workspace: `lms-portal-admin`
- UI Text: Utilize `UI_TEXT` constants in `src/constants/ui-text.constants.ts` and add appropriate new keys.
- Styling: Premium, HSL-colors, rounded-2xl panels, soft shadow effects matching the systems & staff dashboard.
- API rewrites: `/v1/*` maps to `${apiUrl}/v1/*` in `next.config.ts`.
- Student status values: `ĐANG HỌC`, `BẢO LƯU`, `CHỜ BẢO LƯU`, `BỎ HỌC`, `TỐT NGHIỆP`, `TỐT NGHIỆP SỚM`, `ĐÌNH CHỈ`.
- Location values: `HN`, `HCM`.
- Gender values: `MALE`, `FEMALE`, `OTHER`.

---

### Task 1: Type Definitions

**Files:**
- Create: `src/types/student.types.ts`
- Create: `src/types/material.types.ts`

**Interfaces:**
- Consumes: None
- Produces: TypeScript types `Student`, `StudentReport`, `Enrollment`, `Course`, `Session`, `Lesson`, `Quiz` for frontend services.

- [ ] **Step 1: Write Student types**
  Create `src/types/student.types.ts`:
  ```typescript
  export type StudentLocation = "HN" | "HCM";
  export type StudentStatus = "ĐANG HỌC" | "BẢO LƯU" | "CHỜ BẢO LƯU" | "BỎ HỌC" | "TỐT NGHIỆP" | "TỐT NGHIỆP SỚM" | "ĐÌNH CHỈ";
  export type GenderType = "MALE" | "FEMALE" | "OTHER";

  export interface Student {
      id: string;
      studentCode: string;
      fullName: string;
      email: string;
      phone: string;
      dateOfBirth: string;
      gender: GenderType;
      status: StudentStatus;
      location: StudentLocation;
      avatar?: string;
      isLocked: boolean;
      lockedUntil?: string | null;
      systemIds: string[];
      createdAt: string;
      updatedAt: string;
  }

  export interface StudentReport {
      systemId: string;
      systemName: string | null;
      systemCode: string | null;
      total: number;
      byStatus: Record<string, number>;
  }

  export interface StudentClassEnrollment {
      id: string;
      studentId: string;
      classId: string;
      isActive: boolean;
      status: "STUDYING" | "DROPOFF" | "RESERVED";
      createdAt: string;
  }

  export interface Classroom {
      id: string;
      className: string;
      courseId: string;
      status: string;
      createdAt: string;
  }
  ```

- [ ] **Step 2: Write Material types**
  Create `src/types/material.types.ts`:
  ```typescript
  export interface EmbeddedOption {
      content: string;
      isCorrect: boolean;
  }

  export interface EmbeddedQuestion {
      _id?: string;
      content: string;
      type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
      timeInVideo?: number; // seconds
      points: number;
      options: EmbeddedOption[];
  }

  export interface VideoMaterial {
      url: string;
      durationTime: number;
      questions: EmbeddedQuestion[];
  }

  export interface ReadingMaterial {
      content: string;
      pdf?: string;
      questions: EmbeddedQuestion[];
  }

  export interface Lesson {
      id: string;
      name: string;
      sessionId: string;
      status: boolean;
      videoUrl?: string;
      pdf?: string;
      video?: VideoMaterial | null;
      reading?: ReadingMaterial | null;
      quizId?: string | null;
  }

  export interface Session {
      id: string;
      name: string;
      courseId: string;
      position: number;
      createdAt: string;
  }

  export interface Course {
      id: string;
      name: string;
      courseCode: string;
      position: number;
      hour: number;
      courseCover?: string;
      description?: string;
      isVisible: boolean;
  }

  export interface Quiz {
      id: string;
      title: string;
      createdAt: string;
  }
  ```

- [ ] **Step 3: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Command finishes with no errors.

- [ ] **Step 4: Commit**
  ```bash
  git add src/types/student.types.ts src/types/material.types.ts
  git commit -m "feat: define student and learning material Typescript models"
  ```

---

### Task 2: API Integration Services

**Files:**
- Create: `src/services/student.service.ts`
- Create: `src/services/material.service.ts`

**Interfaces:**
- Consumes: `httpClient` from `src/lib/http-client`, Types from Task 1.
- Produces: API request handlers for students and curriculum databases.

- [ ] **Step 1: Write Student Service**
  Create `src/services/student.service.ts`:
  ```typescript
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { Student, StudentReport, StudentClassEnrollment, Classroom } from "@/types/student.types";

  export async function getStudentsReport(): Promise<StudentReport[]> {
      return httpClient<StudentReport[]>("/v1/students/report/by-system", { method: HttpMethod.GET });
  }

  export async function getStudentsList(params: {
      page?: number;
      pageSize?: number;
      name?: string;
      studentCode?: string;
      systemId?: string;
      studentStatusSearch?: string;
  }): Promise<{ items: Student[]; total: number; page: number; pageSize: number }> {
      const query = new URLSearchParams();
      if (params.page) query.append("page", String(params.page));
      if (params.pageSize) query.append("pageSize", String(params.pageSize));
      if (params.name) query.append("name", params.name);
      if (params.studentCode) query.append("studentCode", params.studentCode);
      if (params.systemId) query.append("systemId", params.systemId);
      if (params.studentStatusSearch) query.append("studentStatusSearch", params.studentStatusSearch);

      const res = await httpClient<any>(`/v1/students?${query.toString()}`, { method: HttpMethod.GET });
      return res.data || res;
  }

  export async function getStudentById(id: string): Promise<Student> {
      const res = await httpClient<any>(`/v1/students/${id}`, { method: HttpMethod.GET });
      return res.data || res;
  }

  export async function createStudent(data: Partial<Student> & { systemId: string }): Promise<Student> {
      const res = await httpClient<any>("/v1/students", {
          method: HttpMethod.POST,
          body: JSON.stringify(data),
      });
      return res.data || res;
  }

  export async function updateStudent(id: string, formData: FormData): Promise<Student> {
      const res = await httpClient<any>(`/v1/students/${id}`, {
          method: HttpMethod.PUT,
          body: formData,
      });
      return res.data || res;
  }

  export async function deleteStudent(id: string): Promise<void> {
      await httpClient<any>(`/v1/students/${id}`, { method: HttpMethod.DELETE });
  }

  export async function importStudentsExcel(systemId: string, file: File): Promise<{ inserted: number; updated: number }> {
      const formData = new FormData();
      formData.append("file", file);
      const res = await httpClient<any>(`/v1/students/import/${systemId}`, {
          method: HttpMethod.POST,
          body: formData,
      });
      return res.data || res;
  }

  export async function getStudentClasses(studentId: string): Promise<StudentClassEnrollment[]> {
      const res = await httpClient<any>(`/v1/staff/student-classes/student/${studentId}`, { method: HttpMethod.GET });
      return res.data || res;
  }

  export async function enrollStudentInClass(body: {
      studentId: string;
      classId: string;
      isActive: boolean;
      status: string;
  }): Promise<StudentClassEnrollment> {
      const res = await httpClient<any>("/v1/staff/student-classes", {
          method: HttpMethod.POST,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function updateStudentClass(id: string, body: { isActive: boolean; status: string }): Promise<StudentClassEnrollment> {
      const res = await httpClient<any>(`/v1/staff/student-classes/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function deleteStudentFromClass(id: string): Promise<void> {
      await httpClient<any>(`/v1/staff/student-classes/${id}`, { method: HttpMethod.DELETE });
  }

  export async function getClassesList(): Promise<Classroom[]> {
      const res = await httpClient<any>("/v1/staff/classes", { method: HttpMethod.GET });
      return res.data || res || [];
  }
  ```

- [ ] **Step 2: Write Material Service**
  Create `src/services/material.service.ts`:
  ```typescript
  import { httpClient } from "@/lib/http-client";
  import { HttpMethod } from "@/types/api-types";
  import type { Course, Session, Lesson, Quiz } from "@/types/material.types";

  export async function getCoursesBySystem(systemId: string): Promise<Course[]> {
      const res = await httpClient<any>(`/v1/staff/courses/system/${systemId}`, { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function getSessionsByCourse(courseId: string): Promise<Session[]> {
      const res = await httpClient<any>(`/v1/staff/sessions/course/${courseId}`, { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function createSession(body: { name: string; courseId: string }): Promise<Session> {
      const res = await httpClient<any>("/v1/staff/sessions", {
          method: HttpMethod.POST,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function getLessonsBySession(sessionId: string): Promise<Lesson[]> {
      const res = await httpClient<any>(`/v1/staff/lessons/session/${sessionId}`, { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function createLesson(body: { name: string; sessionId: string }): Promise<Lesson> {
      const res = await httpClient<any>("/v1/staff/lessons", {
          method: HttpMethod.POST,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function configureLessonVideo(lessonId: string, formData: FormData): Promise<Lesson> {
      const res = await httpClient<any>(`/v1/staff/lessons/${lessonId}/video`, {
          method: HttpMethod.POST,
          body: formData,
      });
      return res.data || res;
  }

  export async function configureLessonReading(lessonId: string, formData: FormData): Promise<Lesson> {
      const res = await httpClient<any>(`/v1/staff/lessons/${lessonId}/reading`, {
          method: HttpMethod.POST,
          body: formData,
      });
      return res.data || res;
  }

  export async function linkLessonQuiz(lessonId: string, quizId: string): Promise<Lesson> {
      const res = await httpClient<any>(`/v1/staff/lessons/${lessonId}/quiz`, {
          method: HttpMethod.PUT,
          body: JSON.stringify({ quizId }),
      });
      return res.data || res;
  }

  export async function getQuizzesList(): Promise<Quiz[]> {
      const res = await httpClient<any>("/v1/staff/quizzes", { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function getLessonDetails(id: string): Promise<Lesson> {
      const res = await httpClient<any>(`/v1/staff/lessons/${id}`, { method: HttpMethod.GET });
      return res.data || res;
  }

  export async function mapCourseClass(body: {
      classId: string;
      courseId: string;
      teacherId: string;
      taId?: string;
      status: string;
      startDate?: string;
      endDate?: string;
  }): Promise<any> {
      const res = await httpClient<any>("/v1/staff/course-classes", {
          method: HttpMethod.POST,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function getCourseClassesByClass(classId: string): Promise<any[]> {
      const res = await httpClient<any>(`/v1/staff/course-classes/class/${classId}`, { method: HttpMethod.GET });
      return res.data || res || [];
  }

  export async function updateCourseClass(id: string, body: Partial<{ teacherId: string; status: string; endDate: string }>): Promise<any> {
      const res = await httpClient<any>(`/v1/staff/course-classes/${id}`, {
          method: HttpMethod.PUT,
          body: JSON.stringify(body),
      });
      return res.data || res;
  }

  export async function deleteCourseClass(id: string): Promise<void> {
      await httpClient<any>(`/v1/staff/course-classes/${id}`, { method: HttpMethod.DELETE });
  }
  ```

- [ ] **Step 3: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 4: Commit**
  ```bash
  git add src/services/student.service.ts src/services/material.service.ts
  git commit -m "feat: implement API services for students and learning materials config"
  ```

---

### Task 3: Student Management Screen

**Files:**
- Create: `src/app/users/page.tsx`
- Create: `src/views/users-client-view.tsx`
- Create: `src/views/users-view.tsx`

**Interfaces:**
- Consumes: `StudentReport`, `Student` from Task 1, `getStudentsReport`, `getStudentsList`, `deleteStudent` from Task 2.
- Produces: Complete list page with HSL metrics cards, filters, and standard grid.

- [ ] **Step 1: Write routing page**
  Create `src/app/users/page.tsx`:
  ```typescript
  import type { Metadata } from "next";
  import { UsersClientView } from "@/views/users-client-view";

  export const metadata: Metadata = {
      title: "Quản lý học viên | LMS Portal",
      description: "Danh sách học viên và quản lý xếp lớp học viên",
  };

  export default function UsersPage() {
      return <UsersClientView />;
  }
  ```

- [ ] **Step 2: Write users-client-view**
  Create `src/views/users-client-view.tsx` incorporating authorization checking:
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { AdminLayout } from "@/components/layout/admin/admin-layout";
  import { useAuth } from "@/hooks/use-auth";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { UsersView } from "./users-view";

  export function UsersClientView() {
      const { user, isLoading } = useAuth();
      const router = useAppRouter();

      useEffect(() => {
          if (!isLoading && !user) {
              router.replace("/login");
          }
      }, [user, isLoading, router]);

      if (isLoading) {
          return (
              <div className="flex min-h-screen items-center justify-center bg-cream">
                  <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
              </div>
          );
      }

      if (!user) return null;

      return (
          <AdminLayout title="Quản lý học viên" subtitle="Danh sách và cấu hình thông tin học tập của học viên">
              <UsersView />
          </AdminLayout>
      );
  }
  ```

- [ ] **Step 3: Write users-view core UI component**
  Create `src/views/users-view.tsx` rendering top stats and filtering logic:
  ```typescript
  "use client";

  import { useState } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { AlertTriangle, Plus, FileSpreadsheet, Layers, Trash2, Edit } from "lucide-react";
  import { Button } from "@/components/base/buttons/button";
  import { TablePagination } from "@/components/application/pagination/table-pagination";
  import { getStudentsReport, getStudentsList, deleteStudent } from "@/services/student.service";
  import { getSystemsList } from "@/services/system.service";
  import { toast } from "@/services/toast.service";
  import type { Student } from "@/types/student.types";

  export function UsersView() {
      const queryClient = useQueryClient();
      const [name, setName] = useState("");
      const [studentCode, setStudentCode] = useState("");
      const [systemId, setSystemId] = useState("");
      const [status, setStatus] = useState("");
      const [page, setPage] = useState(1);
      const [pageSize, setPageSize] = useState(10);

      // Modal Triggers
      const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
      const [isExcelOpen, setIsExcelOpen] = useState(false);
      const [isEnrollOpen, setIsEnrollOpen] = useState(false);
      const [activeStudent, setActiveStudent] = useState<Student | null>(null);

      const { data: report = [] } = useQuery({
          queryKey: ["students-report"],
          queryFn: getStudentsReport,
      });

      const { data: systems = [] } = useQuery({
          queryKey: ["systems"],
          queryFn: getSystemsList,
      });

      const { data: studentsData, isLoading } = useQuery({
          queryKey: ["students-list", name, studentCode, systemId, status, page, pageSize],
          queryFn: () => getStudentsList({
              page,
              pageSize,
              name: name || undefined,
              studentCode: studentCode || undefined,
              systemId: systemId || undefined,
              studentStatusSearch: status || undefined,
          }),
      });

      const deleteMutation = useMutation({
          mutationFn: deleteStudent,
          onSuccess: () => {
              toast.success("Thành công", "Đã xóa học viên");
              queryClient.invalidateQueries({ queryKey: ["students-list"] });
              queryClient.invalidateQueries({ queryKey: ["students-report"] });
          },
          onError: () => {
              toast.error("Lỗi", "Không thể xóa học viên");
          }
      });

      const handleDelete = (id: string) => {
          if (confirm("Bạn có chắc chắn muốn xóa học viên này?")) {
              deleteMutation.mutate(id);
          }
      };

      const items = studentsData?.items || [];
      const total = studentsData?.total || 0;
      const totalPages = Math.ceil(total / pageSize) || 1;

      return (
          <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
              {/* Report Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {report.slice(0, 4).map((r, i) => (
                      <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4.5 shadow-xs">
                          <span className="text-xs font-bold text-slate-400 uppercase">{r.systemName || "Hệ Khác"}</span>
                          <div className="flex items-baseline gap-2 mt-1">
                              <span className="text-2xl font-black text-slate-800">{r.total}</span>
                              <span className="text-xs font-semibold text-slate-500">học viên</span>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                  <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Tìm theo họ tên..."
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-48"
                  />
                  <input
                      type="text"
                      value={studentCode}
                      onChange={(e) => setStudentCode(e.target.value)}
                      placeholder="Mã học viên..."
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-36"
                  />
                  <select
                      value={systemId}
                      onChange={(e) => setSystemId(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-44"
                  >
                      <option value="">Tất cả hệ học</option>
                      {systems.map((sys) => (
                          <option key={sys.id} value={sys.id}>{sys.name}</option>
                      ))}
                  </select>
                  <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-44"
                  >
                      <option value="">Tất cả trạng thái</option>
                      {["ĐANG HỌC", "BẢO LƯU", "CHỜ BẢO LƯU", "BỎ HỌC", "TỐT NGHIỆP", "TỐT NGHIỆP SỚM", "ĐÌNH CHỈ"].map((st) => (
                          <option key={st} value={st}>{st}</option>
                      ))}
                  </select>
                  <div className="ml-auto flex gap-2">
                      <Button
                          color="secondary"
                          onClick={() => setIsExcelOpen(true)}
                          className="gap-1.5 text-slate-700 bg-white border border-slate-200"
                          iconLeading={<FileSpreadsheet className="size-4" />}
                      >
                          Nhập Excel
                      </Button>
                      <Button
                          color="primary"
                          onClick={() => {
                              setActiveStudent(null);
                              setIsStudentModalOpen(true);
                          }}
                          className="gap-1.5 bg-wine border-none text-white hover:bg-wine-deep"
                          iconLeading={<Plus className="size-4" />}
                      >
                          Thêm học viên
                      </Button>
                  </div>
              </div>

              {/* Grid */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-xs flex flex-1 flex-col overflow-hidden">
                  <div className="flex-1 overflow-auto">
                      {isLoading ? (
                          <div className="flex min-h-[250px] items-center justify-center">
                              <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                          </div>
                      ) : items.length === 0 ? (
                          <div className="flex min-h-[250px] flex-col items-center justify-center text-center p-6 gap-2">
                              <AlertTriangle className="size-8 text-slate-300" />
                              <p className="text-sm font-bold text-slate-800">Không tìm thấy học viên nào</p>
                          </div>
                      ) : (
                          <table className="w-full text-left text-sm border-collapse">
                              <thead>
                                  <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                      <th className="px-6 py-4">Học viên</th>
                                      <th className="px-6 py-4">Liên hệ</th>
                                      <th className="px-6 py-4">Cơ sở</th>
                                      <th className="px-6 py-4">Trạng thái</th>
                                      <th className="px-6 py-4 text-center">Thao tác</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {items.map((stu) => (
                                      <tr key={stu.id} className="hover:bg-slate-50/40 border-b border-slate-50">
                                          <td className="px-6 py-4 flex items-center gap-3">
                                              <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden border border-slate-200">
                                                  {stu.avatar ? (
                                                      <img src={stu.avatar} alt="Avatar" className="size-full object-cover" />
                                                  ) : (
                                                      stu.fullName.charAt(0).toUpperCase()
                                                  )}
                                              </div>
                                              <div>
                                                  <div className="font-bold text-slate-900">{stu.fullName}</div>
                                                  <div className="text-xs text-slate-400 font-mono">{stu.studentCode}</div>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="text-slate-800">{stu.email}</div>
                                              <div className="text-xs text-slate-400">{stu.phone}</div>
                                          </td>
                                          <td className="px-6 py-4 text-slate-600 font-semibold">{stu.location}</td>
                                          <td className="px-6 py-4">
                                              <span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                                                  {stu.status}
                                              </span>
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center justify-center gap-2">
                                                  <button
                                                      onClick={() => {
                                                          setActiveStudent(stu);
                                                          setIsStudentModalOpen(true);
                                                      }}
                                                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                      title="Sửa thông tin"
                                                  >
                                                      <Edit className="size-4" />
                                                  </button>
                                                  <button
                                                      onClick={() => {
                                                          setActiveStudent(stu);
                                                          setIsEnrollOpen(true);
                                                      }}
                                                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                      title="Lớp học"
                                                  >
                                                      <Layers className="size-4" />
                                                  </button>
                                                  <button
                                                      onClick={() => handleDelete(stu.id)}
                                                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                      title="Xóa"
                                                  >
                                                      <Trash2 className="size-4" />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      )}
                  </div>
                  {total > 0 && (
                      <TablePagination
                          total={total}
                          page={page}
                          totalPages={totalPages}
                          limit={pageSize}
                          onPageChange={setPage}
                          onLimitChange={(lim) => {
                              setPageSize(lim);
                              setPage(1);
                          }}
                          className="border-t border-slate-100 px-6 py-4"
                      />
                  )}
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 4: Run Typecheck**
  Run: `pnpm type-check`
  Expected: No errors.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/users/page.tsx src/views/users-client-view.tsx src/views/users-view.tsx
  git commit -m "feat: implement users routing and management view with stats and filters"
  ```

---

### Task 4: Student Modals

**Files:**
- Create: `src/components/application/modals/student-form-modal.tsx`
- Create: `src/components/application/modals/excel-import-modal.tsx`
- Create: `src/components/application/modals/class-enrollments-modal.tsx`
- Modify: `src/views/users-view.tsx`

**Interfaces:**
- Consumes: UsersView Modal Triggers from Task 3.
- Produces: Interactive modals rendering Student CRUD, Excel Import, and Class Enrollments.

- [ ] **Step 1: Write StudentFormModal**
  Create `src/components/application/modals/student-form-modal.tsx`:
  ```typescript
  "use client";

  import { useEffect, useState } from "react";
  import { useForm, Controller } from "react-hook-form";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { X } from "lucide-react";
  import { CustomModal, Dialog } from "@/components/ui/custom-modal";
  import { Heading } from "react-aria-components";
  import { Input } from "@/components/base/input/input";
  import { Button } from "@/components/base/buttons/button";
  import { createStudent, updateStudent } from "@/services/student.service";
  import { toast } from "@/services/toast.service";
  import type { Student } from "@/types/student.types";

  export function StudentFormModal({
      isOpen,
      onClose,
      student,
      systems,
  }: {
      isOpen: boolean;
      onClose: () => void;
      student?: Student | null;
      systems: any[];
  }) {
      const queryClient = useQueryClient();
      const [avatarFile, setAvatarFile] = useState<File | null>(null);

      const { control, handleSubmit, reset } = useForm({
          defaultValues: {
              fullName: "",
              email: "",
              phone: "",
              location: "HN",
              dateOfBirth: "",
              studentCode: "",
              password: "",
              status: "ĐANG HỌC",
              systemIds: [] as string[],
          },
      });

      useEffect(() => {
          if (student && isOpen) {
              reset({
                  fullName: student.fullName,
                  email: student.email,
                  phone: student.phone,
                  location: student.location,
                  dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split("T")[0] : "",
                  studentCode: student.studentCode,
                  password: "",
                  status: student.status,
                  systemIds: student.systemIds || [],
              });
              setAvatarFile(null);
          } else if (isOpen) {
              reset({
                  fullName: "",
                  email: "",
                  phone: "",
                  location: "HN",
                  dateOfBirth: "",
                  studentCode: "",
                  password: "",
                  status: "ĐANG HỌC",
                  systemIds: [],
              });
              setAvatarFile(null);
          }
      }, [student, isOpen, reset]);

      const submitMutation = useMutation({
          mutationFn: async (data: any) => {
              if (student) {
                  const fd = new FormData();
                  if (avatarFile) fd.append("avatar", avatarFile);
                  fd.append("fullName", data.fullName);
                  fd.append("email", data.email);
                  fd.append("phone", data.phone);
                  fd.append("location", data.location);
                  fd.append("dateOfBirth", data.dateOfBirth);
                  fd.append("studentCode", data.studentCode);
                  fd.append("status", data.status);
                  if (data.password) fd.append("password", data.password);
                  data.systemIds.forEach((sysId: string) => fd.append("systemIds[]", sysId));

                  return updateStudent(student.id, fd);
              } else {
                  return createStudent({
                      ...data,
                      systemId: data.systemIds[0] || "",
                  });
              }
          },
          onSuccess: () => {
              toast.success("Thành công", student ? "Đã cập nhật thông tin học viên" : "Đã thêm học viên mới");
              queryClient.invalidateQueries({ queryKey: ["students-list"] });
              onClose();
          },
          onError: (e: any) => {
              toast.error("Lỗi", e.message || "Đã xảy ra lỗi");
          },
      });

      return (
          <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
              <CustomModal.Content className="max-w-xl rounded-3xl w-full">
                  <Dialog className="bg-white p-6 rounded-3xl flex flex-col outline-none shadow-2xl">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                          <Heading slot="title" className="text-lg font-black text-slate-800">
                              {student ? "Sửa học viên" : "Thêm học viên mới"}
                          </Heading>
                          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                              <X className="size-5 text-slate-400" />
                          </button>
                      </div>

                      <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="mt-4 flex flex-col gap-4">
                          {student && (
                              <div className="flex flex-col gap-1.5">
                                  <label className="text-xs font-bold text-slate-600 uppercase">Cập nhật ảnh đại diện</label>
                                  <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} className="text-xs" />
                              </div>
                          )}

                          <Controller
                              name="fullName"
                              control={control}
                              render={({ field }) => <Input label="Họ và tên *" placeholder="Nguyễn Văn A" value={field.value} onChange={field.onChange} />}
                          />
                          <div className="grid grid-cols-2 gap-4">
                              <Controller
                                  name="email"
                                  control={control}
                                  render={({ field }) => <Input label="Email *" placeholder="email@gmail.com" value={field.value} onChange={field.onChange} />}
                              />
                              <Controller
                                  name="phone"
                                  control={control}
                                  render={({ field }) => <Input label="Số điện thoại *" placeholder="098..." value={field.value} onChange={field.onChange} />}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <Controller
                                  name="dateOfBirth"
                                  control={control}
                                  render={({ field }) => <Input type="date" label="Ngày sinh *" value={field.value} onChange={field.onChange} />}
                              />
                              <Controller
                                  name="location"
                                  control={control}
                                  render={({ field }) => (
                                      <div className="flex flex-col gap-1.5">
                                          <label className="text-xs font-bold text-slate-500 uppercase">Cơ sở đào tạo *</label>
                                          <select value={field.value} onChange={field.onChange} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                              <option value="HN">HN</option>
                                              <option value="HCM">HCM</option>
                                          </select>
                                      </div>
                                  )}
                              />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                              <Controller
                                  name="studentCode"
                                  control={control}
                                  render={({ field }) => <Input label="Mã học viên (Optional)" placeholder="Tự sinh nếu rỗng" value={field.value} onChange={field.onChange} />}
                              />
                              <Controller
                                  name="password"
                                  control={control}
                                  render={({ field }) => <Input type="password" label="Mật khẩu (Optional)" placeholder="Ngày sinh nếu rỗng" value={field.value} onChange={field.onChange} />}
                              />
                          </div>

                          {student && (
                              <Controller
                                  name="status"
                                  control={control}
                                  render={({ field }) => (
                                      <div className="flex flex-col gap-1.5">
                                          <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái học tập *</label>
                                          <select value={field.value} onChange={field.onChange} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                              {["ĐANG HỌC", "BẢO LƯU", "CHỜ BẢO LƯU", "BỎ HỌC", "TỐT NGHIỆP", "TỐT NGHIỆP SỚM", "ĐÌNH CHỈ"].map((st) => (
                                                  <option key={st} value={st}>{st}</option>
                                              ))}
                                          </select>
                                      </div>
                                  )}
                              />
                          )}

                          <Controller
                              name="systemIds"
                              control={control}
                              render={({ field }) => (
                                  <div className="flex flex-col gap-1.5">
                                      <label className="text-xs font-bold text-slate-500 uppercase">Hệ đào tạo liên kết *</label>
                                      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto border border-slate-100 p-2 rounded-lg">
                                          {systems.map((sys) => (
                                              <label key={sys.id} className="flex items-center gap-2 text-sm text-slate-700">
                                                  <input
                                                      type="checkbox"
                                                      checked={field.value.includes(sys.id)}
                                                      onChange={(e) => {
                                                          const val = e.target.checked
                                                              ? [...field.value, sys.id]
                                                              : field.value.filter((id) => id !== sys.id);
                                                          field.onChange(val);
                                                      }}
                                                  />
                                                  {sys.name}
                                              </label>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          />

                          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                              <Button color="secondary" type="button" onClick={onClose}>Hủy</Button>
                              <Button color="primary" type="submit" isLoading={submitMutation.isPending} className="bg-wine text-white border-none">
                                  {student ? "Cập nhật" : "Lưu"}
                              </Button>
                          </div>
                      </form>
                  </Dialog>
              </CustomModal.Content>
          </CustomModal.Root>
      );
  }
  ```

- [ ] **Step 2: Write ExcelImportModal**
  Create `src/components/application/modals/excel-import-modal.tsx`:
  ```typescript
  "use client";

  import { useState } from "react";
  import { useMutation, useQueryClient } from "@tanstack/react-query";
  import { X, Upload } from "lucide-react";
  import { CustomModal, Dialog } from "@/components/ui/custom-modal";
  import { Heading } from "react-aria-components";
  import { Button } from "@/components/base/buttons/button";
  import { importStudentsExcel } from "@/services/student.service";
  import { toast } from "@/services/toast.service";

  export function ExcelImportModal({
      isOpen,
      onClose,
      systems,
  }: {
      isOpen: boolean;
      onClose: () => void;
      systems: any[];
  }) {
      const queryClient = useQueryClient();
      const [systemId, setSystemId] = useState("");
      const [file, setFile] = useState<File | null>(null);
      const [result, setResult] = useState<{ inserted: number; updated: number } | null>(null);

      const importMutation = useMutation({
          mutationFn: () => {
              if (!systemId || !file) throw new Error("Vui lòng chọn hệ học và tệp tin");
              return importStudentsExcel(systemId, file);
          },
          onSuccess: (data) => {
              setResult(data);
              toast.success("Thành công", "Đã tải danh sách học viên từ file Excel");
              queryClient.invalidateQueries({ queryKey: ["students-list"] });
          },
          onError: (e: any) => {
              toast.error("Lỗi import", e.message || "Lỗi tệp dữ liệu");
          },
      });

      const handleClose = () => {
          setFile(null);
          setSystemId("");
          setResult(null);
          onClose();
      };

      return (
          <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && handleClose()}>
              <CustomModal.Content className="max-w-md rounded-3xl w-full">
                  <Dialog className="bg-white p-6 rounded-3xl flex flex-col outline-none shadow-2xl">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                          <Heading slot="title" className="text-lg font-black text-slate-800">
                              Nhập học viên từ Excel
                          </Heading>
                          <button onClick={handleClose} className="p-1 hover:bg-slate-100 rounded-lg">
                              <X className="size-5 text-slate-400" />
                          </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-4">
                          <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-bold text-slate-500 uppercase">Hệ đào tạo mặc định *</label>
                              <select value={systemId} onChange={(e) => setSystemId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                                  <option value="">Chọn hệ đào tạo...</option>
                                  {systems.map((sys) => (
                                      <option key={sys.id} value={sys.id}>{sys.name}</option>
                                  ))}
                              </select>
                          </div>

                          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 hover:border-wine transition cursor-pointer relative bg-slate-50/50">
                              <Upload className="size-8 text-slate-400" />
                              <span className="text-sm font-semibold text-slate-700">Kéo thả tệp tin hoặc Click chọn</span>
                              <span className="text-xs text-slate-400">Chỉ chấp nhận tệp .xlsx</span>
                              <input
                                  type="file"
                                  accept=".xlsx"
                                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                                  className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                          </div>

                          {file && (
                              <div className="text-xs text-slate-500 font-mono bg-slate-100 p-2 rounded">
                                  Đã chọn: {file.name}
                              </div>
                          )}

                          {result && (
                              <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm flex flex-col gap-1">
                                  <div className="font-bold">Kết quả Import:</div>
                                  <div>- Thêm mới: <span className="font-bold">{result.inserted}</span> học viên</div>
                                  <div>- Cập nhật hệ học: <span className="font-bold">{result.updated}</span> học viên</div>
                              </div>
                          )}

                          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                              <Button color="secondary" type="button" onClick={handleClose}>Đóng</Button>
                              <Button
                                  color="primary"
                                  onClick={() => importMutation.mutate()}
                                  isLoading={importMutation.isPending}
                                  isDisabled={!systemId || !file}
                                  className="bg-wine text-white border-none"
                              >
                                  Bắt đầu tải lên
                              </Button>
                          </div>
                      </div>
                  </Dialog>
              </CustomModal.Content>
          </CustomModal.Root>
      );
  }
  ```

- [ ] **Step 3: Write ClassEnrollmentsModal**
  Create `src/components/application/modals/class-enrollments-modal.tsx`:
  ```typescript
  "use client";

  import { useState } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { X, Plus, Trash2 } from "lucide-react";
  import { CustomModal, Dialog } from "@/components/ui/custom-modal";
  import { Heading } from "react-aria-components";
  import { Button } from "@/components/base/buttons/button";
  import { getStudentClasses, enrollStudentInClass, updateStudentClass, deleteStudentFromClass, getClassesList } from "@/services/student.service";
  import { toast } from "@/services/toast.service";
  import type { Student } from "@/types/student.types";

  export function ClassEnrollmentsModal({
      isOpen,
      onClose,
      student,
  }: {
      isOpen: boolean;
      onClose: () => void;
      student: Student | null;
  }) {
      const queryClient = useQueryClient();
      const [classId, setClassId] = useState("");
      const [status, setStatus] = useState("STUDYING");
      const [isActive, setIsActive] = useState(true);

      const { data: enrollments = [], isLoading } = useQuery({
          queryKey: ["student-enrollments", student?.id],
          queryFn: () => getStudentClasses(student!.id),
          enabled: !!student && isOpen,
      });

      const { data: classes = [] } = useQuery({
          queryKey: ["classes-list"],
          queryFn: getClassesList,
          enabled: isOpen,
      });

      const enrollMutation = useMutation({
          mutationFn: () => enrollStudentInClass({
              studentId: student!.id,
              classId,
              status,
              isActive,
          }),
          onSuccess: () => {
              toast.success("Thành công", "Đã xếp lớp cho học viên");
              queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
              setClassId("");
          },
          onError: (e: any) => {
              toast.error("Lỗi", e.message || "Không thể xếp lớp");
          },
      });

      const updateMutation = useMutation({
          mutationFn: ({ id, active, st }: { id: string; active: boolean; st: string }) =>
              updateStudentClass(id, { isActive: active, status: st }),
          onSuccess: () => {
              toast.success("Thành công", "Đã cập nhật trạng thái lớp học");
              queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
          },
          onError: () => {
              toast.error("Lỗi", "Không thể cập nhật");
          },
      });

      const deleteMutation = useMutation({
          mutationFn: deleteStudentFromClass,
          onSuccess: () => {
              toast.success("Thành công", "Đã xóa học viên khỏi lớp");
              queryClient.invalidateQueries({ queryKey: ["student-enrollments", student?.id] });
          },
          onError: () => {
              toast.error("Lỗi", "Không thể xóa khỏi lớp");
          },
      });

      if (!student) return null;

      return (
          <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
              <CustomModal.Content className="max-w-2xl rounded-3xl w-full">
                  <Dialog className="bg-white p-6 rounded-3xl flex flex-col outline-none shadow-2xl">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                          <div>
                              <Heading slot="title" className="text-lg font-black text-slate-800">
                                  Quản lý lớp học của học viên
                              </Heading>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">{student.fullName} ({student.studentCode})</p>
                          </div>
                          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                              <X className="size-5 text-slate-400" />
                          </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-6">
                          {/* New enrollment Form */}
                          <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap items-end gap-3 border border-slate-100">
                              <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Chọn lớp học *</label>
                                  <select value={classId} onChange={(e) => setClassId(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white">
                                      <option value="">Lớp học...</option>
                                      {classes.map((cls) => (
                                          <option key={cls.id} value={cls.id}>{cls.className}</option>
                                      ))}
                                  </select>
                              </div>
                              <div className="flex flex-col gap-1.5 w-32">
                                  <label className="text-xs font-bold text-slate-500 uppercase">Trạng thái *</label>
                                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm bg-white">
                                      <option value="STUDYING">ĐANG HỌC</option>
                                      <option value="RESERVED">BẢO LƯU</option>
                                      <option value="DROPOFF">THÔI HỌC</option>
                                  </select>
                              </div>
                              <div className="flex items-center gap-2 h-9">
                                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="active-chk" />
                                  <label htmlFor="active-chk" className="text-xs font-bold text-slate-600 cursor-pointer">Active</label>
                              </div>
                              <Button
                                  onClick={() => enrollMutation.mutate()}
                                  isLoading={enrollMutation.isPending}
                                  isDisabled={!classId}
                                  className="bg-wine text-white border-none gap-1 py-1.5"
                                  iconLeading={<Plus className="size-4" />}
                              >
                                  Xếp lớp
                              </Button>
                          </div>

                          {/* List of current classes */}
                          <div className="flex flex-col gap-2">
                              <h4 className="text-sm font-black text-slate-700">Lớp học hiện tại</h4>
                              {isLoading ? (
                                  <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine mx-auto my-4" />
                              ) : enrollments.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic text-center py-4">Chưa xếp vào lớp học nào</p>
                              ) : (
                                  <div className="flex flex-col gap-2">
                                      {enrollments.map((en) => {
                                          const matchingClass = classes.find((c) => c.id === en.classId);
                                          return (
                                              <div key={en.id} className="flex items-center justify-between border border-slate-100 p-3 rounded-xl hover:bg-slate-50/50">
                                                  <div>
                                                      <span className="font-bold text-slate-800 text-sm">{matchingClass?.className || "Lớp ID: " + en.classId}</span>
                                                      <div className="text-xxs text-slate-400 font-mono mt-0.5">Xếp lớp ngày: {new Date(en.createdAt).toLocaleDateString()}</div>
                                                  </div>
                                                  <div className="flex items-center gap-3">
                                                      <select
                                                          value={en.status}
                                                          onChange={(e) => updateMutation.mutate({ id: en.id, active: en.isActive, st: e.target.value })}
                                                          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white"
                                                      >
                                                          <option value="STUDYING">ĐANG HỌC</option>
                                                          <option value="RESERVED">BẢO LƯU</option>
                                                          <option value="DROPOFF">THÔI HỌC</option>
                                                      </select>
                                                      <input
                                                          type="checkbox"
                                                          checked={en.isActive}
                                                          onChange={(e) => updateMutation.mutate({ id: en.id, active: e.target.checked, st: en.status })}
                                                      />
                                                      <button onClick={() => deleteMutation.mutate(en.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                                          <Trash2 className="size-4" />
                                                      </button>
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      </div>
                  </Dialog>
              </CustomModal.Content>
          </CustomModal.Root>
      );
  }
  ```

- [ ] **Step 4: Integrate Modals into UsersView**
  Modify `src/views/users-view.tsx` using `replace_file_content` to include and render the `StudentFormModal`, `ExcelImportModal`, and `ClassEnrollmentsModal` tags.
  Wait, we will replace the placeholder imports and tags at the end of the file.
  Let's see: we should import the modal files and insert them into the return JSX of `UsersView`.
  Imports:
  ```typescript
  import { StudentFormModal } from "@/components/application/modals/student-form-modal";
  import { ExcelImportModal } from "@/components/application/modals/excel-import-modal";
  import { ClassEnrollmentsModal } from "@/components/application/modals/class-enrollments-modal";
  ```
  JSX additions:
  ```tsx
  {/* Modals */}
  <StudentFormModal
      isOpen={isStudentModalOpen}
      onClose={() => {
          setIsStudentModalOpen(false);
          setActiveStudent(null);
      }}
      student={activeStudent}
      systems={systems}
  />

  <ExcelImportModal
      isOpen={isExcelOpen}
      onClose={() => setIsExcelOpen(false)}
      systems={systems}
  />

  <ClassEnrollmentsModal
      isOpen={isEnrollOpen}
      onClose={() => {
          setIsEnrollOpen(false);
          setActiveStudent(null);
      }}
      student={activeStudent}
  />
  ```

- [ ] **Step 5: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 6: Commit**
  ```bash
  git add src/components/application/modals/student-form-modal.tsx src/components/application/modals/excel-import-modal.tsx src/components/application/modals/class-enrollments-modal.tsx src/views/users-view.tsx
  git commit -m "feat: implement Student CRUD, Excel spreadsheet importer and Class Enrollments modals"
  ```

---

### Task 5: Course-Class Mapping Screen

**Files:**
- Create: `src/app/classes/page.tsx`
- Create: `src/views/classes-client-view.tsx`
- Create: `src/views/classes-view.tsx`

**Interfaces:**
- Consumes: Mapped APIs from Task 2.
- Produces: UI listing classes administrative entities and assigning course subjects, instructors, and assistant tags.

- [ ] **Step 1: Write routing page**
  Create `src/app/classes/page.tsx`:
  ```typescript
  import type { Metadata } from "next";
  import { ClassesClientView } from "@/views/classes-client-view";

  export const metadata: Metadata = {
      title: "Phân công lớp học | LMS Portal",
      description: "Quản lý giảng dạy, phân giảng viên trợ giảng vào lớp hành chính",
  };

  export default function ClassesPage() {
      return <ClassesClientView />;
  }
  ```

- [ ] **Step 2: Write client view loader**
  Create `src/views/classes-client-view.tsx`:
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { AdminLayout } from "@/components/layout/admin/admin-layout";
  import { useAuth } from "@/hooks/use-auth";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { ClassesView } from "./classes-view";

  export function ClassesClientView() {
      const { user, isLoading } = useAuth();
      const router = useAppRouter();

      useEffect(() => {
          if (!isLoading && !user) {
              router.replace("/login");
          }
      }, [user, isLoading, router]);

      if (isLoading) {
          return (
              <div className="flex min-h-screen items-center justify-center bg-cream">
                  <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
              </div>
          );
      }

      if (!user) return null;

      return (
          <AdminLayout title="Phân công giảng dạy" subtitle="Quản lý lớp học phần, gán giảng viên trợ giảng và môn học">
              <ClassesView />
          </AdminLayout>
      );
  }
  ```

- [ ] **Step 3: Write classes-view UI**
  Create `src/views/classes-view.tsx` to handle listing of classes, fetch staff, and map courses:
  ```typescript
  "use client";

  import { useState } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { Layers, Plus, Trash2, Calendar, UserCheck } from "lucide-react";
  import { getClassesList } from "@/services/student.service";
  import { getCourseClassesByClass, mapCourseClass, deleteCourseClass, updateCourseClass } from "@/services/material.service";
  import { getSystemsList } from "@/services/system.service";
  import { getStaffList } from "@/services/staff.service";
  import { toast } from "@/services/toast.service";
  import { Button } from "@/components/base/buttons/button";

  export function ClassesView() {
      const queryClient = useQueryClient();
      const [selectedClassId, setSelectedClassId] = useState("");

      // Form state
      const [courseId, setCourseId] = useState("");
      const [teacherId, setTeacherId] = useState("");
      const [taId, setTaId] = useState("");
      const [status, setStatus] = useState("PENDING");
      const [startDate, setStartDate] = useState("");
      const [endDate, setEndDate] = useState("");

      const { data: classes = [] } = useQuery({
          queryKey: ["classes-list"],
          queryFn: getClassesList,
      });

      const { data: courseMappings = [], isLoading: loadingMappings } = useQuery({
          queryKey: ["course-mappings", selectedClassId],
          queryFn: () => getCourseClassesByClass(selectedClassId),
          enabled: !!selectedClassId,
      });

      const { data: staffList = [] } = useQuery({
          queryKey: ["staff-list"],
          queryFn: async () => {
              // Return all staff
              const res = await fetch("/v1/staff");
              const data = await res.json();
              return data.data || data || [];
          },
      });

      const { data: systems = [] } = useQuery({
          queryKey: ["systems"],
          queryFn: getSystemsList,
      });

      // Dummy courses for listing, or fetch from mock
      const courses = [
          { id: "60c72b2f9b1d8b2bad000003", name: "Lập trình NodeJS" },
          { id: "60c72b2f9b1d8b2bad000004", name: "Lập trình ReactJS" },
          { id: "60c72b2f9b1d8b2bad000005", name: "Lập trình Python FastAPI" }
      ];

      const addMappingMutation = useMutation({
          mutationFn: () => mapCourseClass({
              classId: selectedClassId,
              courseId,
              teacherId,
              taId: taId || undefined,
              status,
              startDate: startDate || undefined,
              endDate: endDate || undefined,
          }),
          onSuccess: () => {
              toast.success("Thành công", "Đã phân công môn học & giảng viên vào lớp");
              queryClient.invalidateQueries({ queryKey: ["course-mappings", selectedClassId] });
              // Reset
              setCourseId("");
              setTeacherId("");
              setTaId("");
          },
          onError: (e: any) => {
              toast.error("Lỗi", e.message || "Không thể phân công");
          }
      });

      const deleteMappingMutation = useMutation({
          mutationFn: deleteCourseClass,
          onSuccess: () => {
              toast.success("Thành công", "Đã xóa phân công môn học");
              queryClient.invalidateQueries({ queryKey: ["course-mappings", selectedClassId] });
          },
          onError: () => {
              toast.error("Lỗi", "Không thể xóa phân công");
          }
      });

      return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
              {/* Classes list */}
              <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                      <Layers className="size-5 text-wine" />
                      <span>Danh sách Lớp hành chính</span>
                  </h3>
                  <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px]">
                      {classes.map((cls) => (
                          <button
                              key={cls.id}
                              onClick={() => setSelectedClassId(cls.id)}
                              className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                                  selectedClassId === cls.id
                                      ? "border-wine bg-wine/5 font-bold text-wine shadow-sm"
                                      : "border-slate-100 hover:bg-slate-50 text-slate-700"
                              }`}
                          >
                              <span>{cls.className}</span>
                              <span className="text-xxs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{cls.status}</span>
                          </button>
                      ))}
                  </div>
              </div>

              {/* Course-Class details */}
              <div className="lg:col-span-2 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-6">
                  {selectedClassId ? (
                      <>
                          <div className="border-b border-slate-100 pb-4">
                              <h3 className="text-base font-black text-slate-800">Cấu hình Lớp học phần</h3>
                              <p className="text-xs text-slate-400 mt-0.5 font-semibold">Gán môn học và giảng dạy</p>
                          </div>

                          {/* Quick Assign Form */}
                          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-3">
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Môn học *</label>
                                  <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                      <option value="">Chọn môn học...</option>
                                      {courses.map((c) => (
                                          <option key={c.id} value={c.id}>{c.name}</option>
                                      ))}
                                  </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Giảng viên *</label>
                                  <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                      <option value="">Giảng viên...</option>
                                      {staffList.map((st: any) => (
                                          <option key={st.id} value={st.id}>{st.fullName}</option>
                                      ))}
                                  </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Trợ giảng (Optional)</label>
                                  <select value={taId} onChange={(e) => setTaId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                      <option value="">Trợ giảng...</option>
                                      {staffList.map((st: any) => (
                                          <option key={st.id} value={st.id}>{st.fullName}</option>
                                      ))}
                                  </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Trạng thái lớp phần *</label>
                                  <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                      <option value="PENDING">PENDING</option>
                                      <option value="STUDYING">STUDYING</option>
                                      <option value="FINISHED">FINISHED</option>
                                  </select>
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Ngày bắt đầu</label>
                                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none" />
                              </div>
                              <div className="flex flex-col gap-1">
                                  <label className="text-xxs font-bold text-slate-500 uppercase">Ngày kết thúc</label>
                                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none" />
                              </div>
                              <div className="col-span-2 md:col-span-3 flex justify-end mt-2">
                                  <Button
                                      onClick={() => addMappingMutation.mutate()}
                                      isLoading={addMappingMutation.isPending}
                                      isDisabled={!courseId || !teacherId}
                                      className="bg-wine border-none text-white gap-1 py-1.5 text-xs font-bold"
                                      iconLeading={<Plus className="size-3.5" />}
                                  >
                                      Thêm phân công
                                  </Button>
                              </div>
                          </div>

                          {/* List of mappings */}
                          <div className="flex flex-col gap-3">
                              <h4 className="text-sm font-bold text-slate-700">Môn học đã phân công</h4>
                              {loadingMappings ? (
                                  <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine mx-auto" />
                              ) : courseMappings.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic text-center py-6">Chưa có môn học học phần nào được phân công</p>
                              ) : (
                                  <div className="flex flex-col gap-2">
                                      {courseMappings.map((m) => (
                                          <div key={m.id} className="flex items-center justify-between border border-slate-100 p-4 rounded-xl hover:bg-slate-50/50">
                                              <div>
                                                  <span className="font-bold text-slate-800 text-sm">
                                                      {typeof m.courseId === "object" ? m.courseId?.name : courses.find((x) => x.id === m.courseId)?.name || m.courseId}
                                                  </span>
                                                  <div className="flex items-center gap-3 text-xxs text-slate-400 mt-1 font-semibold">
                                                      <span className="flex items-center gap-0.5">
                                                          <UserCheck className="size-3" />
                                                          GV: {typeof m.teacherId === "object" ? m.teacherId?.fullName : m.teacherId}
                                                      </span>
                                                      {m.taId && (
                                                          <span>TA: {typeof m.taId === "object" ? m.taId?.fullName : m.taId}</span>
                                                      )}
                                                      <span className="flex items-center gap-0.5">
                                                          <Calendar className="size-3" />
                                                          {m.startDate ? new Date(m.startDate).toLocaleDateString() : ""} - {m.endDate ? new Date(m.endDate).toLocaleDateString() : ""}
                                                      </span>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <span className="text-xxs font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{m.status}</span>
                                                  <button onClick={() => deleteMappingMutation.mutate(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                                      <Trash2 className="size-4" />
                                                  </button>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-center p-12 gap-2 h-full">
                          <Layers className="size-10 text-slate-200" />
                          <p className="text-sm font-black text-slate-500">Vui lòng chọn lớp hành chính ở thanh bên trái</p>
                      </div>
                  )}
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 4: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/classes/page.tsx src/views/classes-client-view.tsx src/views/classes-view.tsx
  git commit -m "feat: implement course-class mapping page for curriculum assignments"
  ```

---

### Task 6: Learning Materials Accordion Tree Screen

**Files:**
- Create: `src/app/courses/page.tsx`
- Create: `src/views/courses-client-view.tsx`
- Create: `src/views/courses-view.tsx`

**Interfaces:**
- Consumes: Materials APIs from Task 2.
- Produces: Accordion layout where staff select systems, drill down into courses, and add sessions and lessons.

- [ ] **Step 1: Write routing page**
  Create `src/app/courses/page.tsx`:
  ```typescript
  import type { Metadata } from "next";
  import { CoursesClientView } from "@/views/courses-client-view";

  export const metadata: Metadata = {
      title: "Học liệu môn học | LMS Portal",
      description: "Cấu hình học liệu (Video, Bài đọc, Đề thi trắc nghiệm) cho môn học",
  };

  export default function CoursesPage() {
      return <CoursesClientView />;
  }
  ```

- [ ] **Step 2: Write client view loader**
  Create `src/views/courses-client-view.tsx`:
  ```typescript
  "use client";

  import { useEffect } from "react";
  import { AdminLayout } from "@/components/layout/admin/admin-layout";
  import { useAuth } from "@/hooks/use-auth";
  import { useAppRouter } from "@/hooks/use-app-router";
  import { CoursesView } from "./courses-view";

  export function CoursesClientView() {
      const { user, isLoading } = useAuth();
      const router = useAppRouter();

      useEffect(() => {
          if (!isLoading && !user) {
              router.replace("/login");
          }
      }, [user, isLoading, router]);

      if (isLoading) {
          return (
              <div className="flex min-h-screen items-center justify-center bg-cream">
                  <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
              </div>
          );
      }

      if (!user) return null;

      return (
          <AdminLayout title="Quản lý Học liệu" subtitle="Cấu hình chương trình học, buổi học, bài học và đính kèm học liệu">
              <CoursesView />
          </AdminLayout>
      );
  }
  ```

- [ ] **Step 3: Write courses-view UI layout**
  Create `src/views/courses-view.tsx` rendering tree view and triggers:
  ```typescript
  "use client";

  import { useState } from "react";
  import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
  import { BookOpen, Plus, FolderPlus, FileText, ChevronRight, Video, File, HelpCircle } from "lucide-react";
  import { getSystemsList } from "@/services/system.service";
  import { getCoursesBySystem, getSessionsByCourse, createSession, getLessonsBySession, createLesson } from "@/services/material.service";
  import { toast } from "@/services/toast.service";
  import { Button } from "@/components/base/buttons/button";
  import type { Course, Session, Lesson } from "@/types/material.types";

  export function CoursesView() {
      const queryClient = useQueryClient();
      const [selectedSystemId, setSelectedSystemId] = useState("");
      const [selectedCourseId, setSelectedCourseId] = useState("");
      const [expandedSessionId, setExpandedSessionId] = useState("");

      // Modal state
      const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
      const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

      const { data: systems = [] } = useQuery({
          queryKey: ["systems"],
          queryFn: getSystemsList,
      });

      const { data: courses = [] } = useQuery({
          queryKey: ["courses", selectedSystemId],
          queryFn: () => getCoursesBySystem(selectedSystemId),
          enabled: !!selectedSystemId,
      });

      const { data: sessions = [], isLoading: loadingSessions } = useQuery({
          queryKey: ["sessions", selectedCourseId],
          queryFn: () => getSessionsByCourse(selectedCourseId),
          enabled: !!selectedCourseId,
      });

      const addSessionMutation = useMutation({
          mutationFn: (name: string) => createSession({ name, courseId: selectedCourseId }),
          onSuccess: () => {
              toast.success("Thành công", "Đã thêm buổi học mới");
              queryClient.invalidateQueries({ queryKey: ["sessions", selectedCourseId] });
          },
      });

      const handleAddSession = () => {
          const name = prompt("Nhập tên buổi học mới (Session name):");
          if (name) addSessionMutation.mutate(name);
      };

      return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
              {/* Sidebar filter: Select system & course */}
              <div className="lg:col-span-4 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Hệ đào tạo</label>
                      <select
                          value={selectedSystemId}
                          onChange={(e) => {
                              setSelectedSystemId(e.target.value);
                              setSelectedCourseId("");
                          }}
                          className="bg-white border border-slate-200 text-sm px-3 py-2 rounded-xl focus:outline-none"
                      >
                          <option value="">Chọn hệ...</option>
                          {systems.map((sys) => (
                              <option key={sys.id} value={sys.id}>{sys.name}</option>
                          ))}
                      </select>
                  </div>

                  {selectedSystemId && (
                      <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-slate-500 uppercase">Danh sách môn học</label>
                          <div className="flex flex-col gap-1.5 max-h-[350px] overflow-y-auto">
                              {courses.map((c) => (
                                  <button
                                      key={c.id}
                                      onClick={() => setSelectedCourseId(c.id)}
                                      className={`w-full text-left p-3 rounded-lg border text-xs transition flex items-center justify-between ${
                                          selectedCourseId === c.id
                                              ? "border-wine bg-wine/5 font-bold text-wine"
                                              : "border-slate-50 hover:bg-slate-50 text-slate-700"
                                      }`}
                                  >
                                      <span>{c.name}</span>
                                      <span className="text-[10px] text-slate-400 uppercase">{c.courseCode}</span>
                                  </button>
                              ))}
                          </div>
                      </div>
                  )}
              </div>

              {/* Sessions & Lessons tree */}
              <div className="lg:col-span-8 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-6">
                  {selectedCourseId ? (
                      <>
                          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                              <div>
                                  <h3 className="text-base font-black text-slate-800">Khung chương trình học</h3>
                                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Tạo buổi, bài học và gán tài liệu</p>
                              </div>
                              <Button
                                  onClick={handleAddSession}
                                  className="bg-wine border-none text-white text-xs gap-1.5 py-1.5"
                                  iconLeading={<FolderPlus className="size-4" />}
                              >
                                  Buổi học (Session)
                              </Button>
                          </div>

                          <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px]">
                              {loadingSessions ? (
                                  <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine mx-auto my-6" />
                              ) : sessions.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic text-center py-8">Chưa có buổi học nào</p>
                              ) : (
                                  sessions.map((ses) => (
                                      <SessionAccordion
                                          key={ses.id}
                                          session={ses}
                                          isExpanded={expandedSessionId === ses.id}
                                          onToggle={() => setExpandedSessionId(expandedSessionId === ses.id ? "" : ses.id)}
                                          onConfigureMaterial={(les) => {
                                              setSelectedLesson(les);
                                              setIsMaterialModalOpen(true);
                                          }}
                                      />
                                  ))
                              )}
                          </div>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center text-center p-12 gap-2 h-full">
                          <BookOpen className="size-10 text-slate-200" />
                          <p className="text-sm font-black text-slate-500">Vui lòng chọn môn học ở thanh lọc bên trái</p>
                      </div>
                  )}
              </div>

              {/* Material Config Modal placeholder */}
              {isMaterialModalOpen && selectedLesson && (
                  <LessonMaterialModal
                      isOpen={isMaterialModalOpen}
                      onClose={() => {
                          setIsMaterialModalOpen(false);
                          setSelectedLesson(null);
                      }}
                      lesson={selectedLesson}
                  />
              )}
          </div>
      );
  }

  function SessionAccordion({
      session,
      isExpanded,
      onToggle,
      onConfigureMaterial,
  }: {
      session: Session;
      isExpanded: boolean;
      onToggle: () => void;
      onConfigureMaterial: (lesson: Lesson) => void;
  }) {
      const queryClient = useQueryClient();

      const { data: lessons = [], isLoading } = useQuery({
          queryKey: ["lessons", session.id],
          queryFn: () => getLessonsBySession(session.id),
          enabled: isExpanded,
      });

      const addLessonMutation = useMutation({
          mutationFn: (name: string) => createLesson({ name, sessionId: session.id }),
          onSuccess: () => {
              toast.success("Thành công", "Đã thêm bài học mới");
              queryClient.invalidateQueries({ queryKey: ["lessons", session.id] });
          },
      });

      const handleAddLesson = (e: React.MouseEvent) => {
          e.stopPropagation();
          const name = prompt("Nhập tên bài học mới (Lesson name):");
          if (name) addLessonMutation.mutate(name);
      };

      return (
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xxs">
              <button
                  onClick={onToggle}
                  className="w-full bg-slate-50/50 hover:bg-slate-50 px-4 py-3.5 flex items-center justify-between text-sm font-black text-slate-700"
              >
                  <div className="flex items-center gap-2">
                      <ChevronRight className={`size-4 text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      <span>{session.name}</span>
                  </div>
                  <button
                      onClick={handleAddLesson}
                      className="text-xxs font-bold text-wine hover:text-wine-deep border border-wine/20 bg-white px-2.5 py-1 rounded-lg flex items-center gap-1"
                  >
                      <Plus className="size-3" />
                      <span>Bài học</span>
                  </button>
              </button>

              {isExpanded && (
                  <div className="p-3 bg-white border-t border-slate-50 flex flex-col gap-2">
                      {isLoading ? (
                          <div className="size-4 animate-spin rounded-full border-2 border-slate-100 border-t-wine mx-auto my-2" />
                      ) : lessons.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic text-center py-2">Không có bài học nào trong buổi này</p>
                      ) : (
                          lessons.map((les) => (
                              <div
                                  key={les.id}
                                  onClick={() => onConfigureMaterial(les)}
                                  className="flex items-center justify-between border border-slate-50 hover:border-wine/20 hover:bg-wine/[0.01] p-3 rounded-xl transition cursor-pointer group"
                              >
                                  <div className="flex items-center gap-2">
                                      <FileText className="size-4 text-slate-400 group-hover:text-wine" />
                                      <span className="text-xs font-semibold text-slate-800 group-hover:text-wine-deep">{les.name}</span>
                                  </div>
                                  <div className="flex gap-2">
                                      {les.videoUrl && <Video className="size-3.5 text-blue-500" title="Đã có video" />}
                                      {les.pdf && <File className="size-3.5 text-green-500" title="Đã có bài đọc PDF" />}
                                      {les.quizId && <HelpCircle className="size-3.5 text-amber-500" title="Đã gán Quiz" />}
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              )}
          </div>
      );
  }
  ```

- [ ] **Step 4: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 5: Commit**
  ```bash
  git add src/app/courses/page.tsx src/views/courses-client-view.tsx src/views/courses-view.tsx
  git commit -m "feat: implement curriculum editor tree view for courses, sessions, and lessons"
  ```

---

### Task 7: Lesson Material Editor Modal

**Files:**
- Create: `src/components/application/modals/lesson-material-modal.tsx`
- Modify: `src/views/courses-view.tsx`

**Interfaces:**
- Consumes: Modal Trigger from Task 6.
- Produces: Multi-tab modal allowing setup of Video, Reading Markdown, and Quiz linkages.

- [ ] **Step 1: Write LessonMaterialModal skeleton and form logic**
  Create `src/components/application/modals/lesson-material-modal.tsx`:
  ```typescript
  "use client";

  import { useEffect, useState } from "react";
  import { useQuery, useMutation } from "@tanstack/react-query";
  import { X, Film, Book, HelpCircle, Eye } from "lucide-react";
  import { CustomModal, Dialog } from "@/components/ui/custom-modal";
  import { Heading } from "react-aria-components";
  import { Button } from "@/components/base/buttons/button";
  import { configureLessonVideo, configureLessonReading, linkLessonQuiz, getQuizzesList, getLessonDetails } from "@/services/material.service";
  import { toast } from "@/services/toast.service";
  import type { Lesson } from "@/types/material.types";
  import { PreviewPlayer } from "./preview-player";

  export function LessonMaterialModal({
      isOpen,
      onClose,
      lesson,
  }: {
      isOpen: boolean;
      onClose: () => void;
      lesson: Lesson;
  }) {
      const [activeTab, setActiveTab] = useState<"video" | "reading" | "quiz" | "preview">("video");
      const [localLesson, setLocalLesson] = useState<Lesson>(lesson);

      const { data: updatedLesson } = useQuery({
          queryKey: ["lesson-details", lesson.id],
          queryFn: () => getLessonDetails(lesson.id),
          enabled: isOpen,
      });

      useEffect(() => {
          if (updatedLesson) setLocalLesson(updatedLesson);
      }, [updatedLesson]);

      const { data: quizzes = [] } = useQuery({
          queryKey: ["quizzes-list"],
          queryFn: getQuizzesList,
          enabled: isOpen && activeTab === "quiz",
      });

      return (
          <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
              <CustomModal.Content className="max-w-3xl rounded-3xl w-full">
                  <Dialog className="bg-white p-6 rounded-3xl flex flex-col max-h-[90vh] outline-none shadow-2xl overflow-hidden">
                      {/* Header */}
                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 shrink-0">
                          <div>
                              <Heading slot="title" className="text-lg font-black text-slate-800">Cấu hình học liệu</Heading>
                              <p className="text-xs text-slate-400 font-semibold mt-0.5">{localLesson.name}</p>
                          </div>
                          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg">
                              <X className="size-5 text-slate-400" />
                          </button>
                      </div>

                      {/* Tabs navigation */}
                      <div className="flex border-b border-slate-100 mt-3 shrink-0">
                          <button
                              onClick={() => setActiveTab("video")}
                              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                                  activeTab === "video" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                              }`}
                          >
                              <Film className="size-4" />
                              Video bài học
                          </button>
                          <button
                              onClick={() => setActiveTab("reading")}
                              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                                  activeTab === "reading" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                              }`}
                          >
                              <Book className="size-4" />
                              Bài đọc (Markdown)
                          </button>
                          <button
                              onClick={() => setActiveTab("quiz")}
                              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ${
                                  activeTab === "quiz" ? "border-wine text-wine" : "border-transparent text-slate-500 hover:text-slate-700"
                              }`}
                          >
                              <HelpCircle className="size-4" />
                              Bài tập kiểm tra (Quiz)
                          </button>
                          <button
                              onClick={() => setActiveTab("preview")}
                              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition ml-auto bg-slate-50 hover:bg-slate-100 rounded-t-lg ${
                                  activeTab === "preview" ? "border-wine text-wine bg-wine/5" : "border-transparent text-slate-600"
                              }`}
                          >
                              <Eye className="size-4" />
                              Xem thử (Preview Player)
                          </button>
                      </div>

                      {/* Content panel */}
                      <div className="flex-1 overflow-y-auto py-4 min-h-0 custom-scrollbar">
                          {activeTab === "video" && <VideoConfigTab lesson={localLesson} onSave={setLocalLesson} />}
                          {activeTab === "reading" && <ReadingConfigTab lesson={localLesson} onSave={setLocalLesson} />}
                          {activeTab === "quiz" && <QuizConfigTab lesson={localLesson} quizzes={quizzes} onSave={setLocalLesson} />}
                          {activeTab === "preview" && <PreviewPlayer lesson={localLesson} />}
                      </div>
                  </Dialog>
              </CustomModal.Content>
          </CustomModal.Root>
      );
  }

  function VideoConfigTab({ lesson, onSave }: { lesson: Lesson; onSave: (l: Lesson) => void }) {
      const [url, setUrl] = useState(lesson.video?.url || "");
      const [duration, setDuration] = useState(lesson.video?.durationTime || 0);
      const [file, setFile] = useState<File | null>(null);

      // Simple Embedded Question creator state
      const [questions, setQuestions] = useState<any[]>(lesson.video?.questions || []);

      const videoMutation = useMutation({
          mutationFn: () => {
              const fd = new FormData();
              if (file) fd.append("file", file);
              if (url) fd.append("url", url);
              fd.append("durationTime", String(duration));
              fd.append("questions", JSON.stringify(questions));

              return configureLessonVideo(lesson.id, fd);
          },
          onSuccess: (data) => {
              toast.success("Thành công", "Đã cập nhật video bài học");
              onSave(data);
          },
          onError: () => {
              toast.error("Lỗi", "Không thể lưu video");
          },
      });

      const addQuestion = () => {
          setQuestions([
              ...questions,
              {
                  content: "Câu hỏi trắc nghiệm mới",
                  type: "SINGLE_CHOICE",
                  timeInVideo: 10,
                  points: 1,
                  options: [
                      { content: "Đáp án A", isCorrect: true },
                      { content: "Đáp án B", isCorrect: false },
                  ],
              },
          ]);
      };

      return (
          <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tải tệp Video (.mp4)</label>
                  <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>

              <div className="text-center text-slate-300 font-bold text-xs uppercase my-1">hoặc</div>

              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Direct Link Video (e.g. YouTube, S3)</label>
                  <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-wine"
                  />
              </div>

              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Thời lượng (giây)</label>
                  <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:outline-none focus:border-wine w-32"
                  />
              </div>

              {/* Video Questions form array */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                  <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-black text-slate-700 uppercase">Câu hỏi nhúng trắc nghiệm chặn dòng video</h4>
                      <Button onClick={addQuestion} className="bg-slate-50 border-slate-200 text-slate-600 text-xxs font-bold py-1">
                          + Thêm câu hỏi nhúng
                      </Button>
                  </div>

                  <div className="flex flex-col gap-3">
                      {questions.map((q, idx) => (
                          <div key={idx} className="border border-slate-100 rounded-xl p-3 flex flex-col gap-2.5 bg-slate-50/20">
                              <div className="grid grid-cols-3 gap-2">
                                  <div className="col-span-2 flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-slate-400">Nội dung câu hỏi</label>
                                      <input
                                          type="text"
                                          value={q.content}
                                          onChange={(e) => {
                                              const copy = [...questions];
                                              copy[idx].content = e.target.value;
                                              setQuestions(copy);
                                          }}
                                          className="bg-white border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none"
                                      />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                      <label className="text-[10px] font-bold text-slate-400">Thời điểm (s)</label>
                                      <input
                                          type="number"
                                          value={q.timeInVideo}
                                          onChange={(e) => {
                                              const copy = [...questions];
                                              copy[idx].timeInVideo = Number(e.target.value);
                                              setQuestions(copy);
                                          }}
                                          className="bg-white border border-slate-200 text-xs px-2 py-1 rounded focus:outline-none"
                                      />
                                  </div>
                              </div>
                              <div className="flex flex-col gap-1.5 pl-4 border-l border-slate-100">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">Danh sách Đáp án</span>
                                  {q.options.map((opt: any, optIdx: number) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                          <input
                                              type="checkbox"
                                              checked={opt.isCorrect}
                                              onChange={(e) => {
                                                  const copy = [...questions];
                                                  copy[idx].options[optIdx].isCorrect = e.target.checked;
                                                  setQuestions(copy);
                                              }}
                                          />
                                          <input
                                              type="text"
                                              value={opt.content}
                                              onChange={(e) => {
                                                  const copy = [...questions];
                                                  copy[idx].options[optIdx].content = e.target.value;
                                                  setQuestions(copy);
                                              }}
                                              className="bg-white border border-slate-200 text-[11px] px-2 py-0.5 rounded focus:outline-none flex-1"
                                          />
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <Button onClick={() => videoMutation.mutate()} isLoading={videoMutation.isPending} className="bg-wine text-white border-none py-1.5 text-xs font-bold">
                      Lưu Video
                  </Button>
              </div>
          </div>
      );
  }

  function ReadingConfigTab({ lesson, onSave }: { lesson: Lesson; onSave: (l: Lesson) => void }) {
      const [content, setContent] = useState(lesson.reading?.content || "");
      const [file, setFile] = useState<File | null>(null);
      const [questions, setQuestions] = useState<any[]>(lesson.reading?.questions || []);

      const readingMutation = useMutation({
          mutationFn: () => {
              const fd = new FormData();
              if (file) fd.append("file", file);
              fd.append("content", content);
              fd.append("questions", JSON.stringify(questions));

              return configureLessonReading(lesson.id, fd);
          },
          onSuccess: (data) => {
              toast.success("Thành công", "Đã cập nhật bài đọc");
              onSave(data);
          },
          onError: () => {
              toast.error("Lỗi", "Không thể lưu bài đọc");
          },
      });

      return (
          <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tải tệp PDF học liệu (.pdf)</label>
                  <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs" />
              </div>

              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nội dung bài viết (Markdown hoặc Rich Text)</label>
                  <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="# Tiêu đề bài viết..."
                      rows={6}
                      className="rounded-lg border border-slate-200 p-3 text-xs focus:outline-none focus:border-wine font-mono"
                  />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <Button onClick={() => readingMutation.mutate()} isLoading={readingMutation.isPending} className="bg-wine text-white border-none py-1.5 text-xs font-bold">
                      Lưu Bài đọc
                  </Button>
              </div>
          </div>
      );
  }

  function QuizConfigTab({ lesson, quizzes, onSave }: { lesson: Lesson; quizzes: any[]; onSave: (l: Lesson) => void }) {
      const [quizId, setQuizId] = useState(lesson.quizId || "");

      const quizMutation = useMutation({
          mutationFn: () => linkLessonQuiz(lesson.id, quizId),
          onSuccess: (data) => {
              toast.success("Thành công", "Đã liên kết bài tập Quiz thành công");
              onSave(data);
          },
          onError: () => {
              toast.error("Lỗi", "Không thể liên kết Quiz");
          },
      });

      return (
          <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Chọn đề kiểm tra (Quiz)</label>
                  <select
                      value={quizId}
                      onChange={(e) => setQuizId(e.target.value)}
                      className="bg-white border border-slate-200 text-sm px-3 py-2 rounded-xl focus:outline-none"
                  >
                      <option value="">Không có Quiz...</option>
                      {quizzes.map((q) => (
                          <option key={q.id} value={q.id}>{q.title || "Bộ đề Quiz " + q.id}</option>
                      ))}
                  </select>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 mt-2">
                  <Button onClick={() => quizMutation.mutate()} isLoading={quizMutation.isPending} className="bg-wine text-white border-none py-1.5 text-xs font-bold">
                      Lưu Quiz Liên Kết
                  </Button>
              </div>
          </div>
      );
  }
  ```

- [ ] **Step 2: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 3: Commit**
  ```bash
  git add src/components/application/modals/lesson-material-modal.tsx
  git commit -m "feat: implement curriculum material config tabs for video questions, readings, and quiz"
  ```

---

### Task 8: Student Player Preview Component

**Files:**
- Create: `src/components/application/modals/preview-player.tsx`
- Modify: `src/components/application/modals/lesson-material-modal.tsx`

**Interfaces:**
- Consumes: Active Lesson details from Task 7.
- Produces: Interactive client player UI matching student video/reading questions locks.

- [ ] **Step 1: Write PreviewPlayer**
  Create `src/components/application/modals/preview-player.tsx`:
  ```typescript
  "use client";

  import { useState, useRef, useEffect } from "react";
  import { Play, Pause, AlertCircle, CheckCircle } from "lucide-react";
  import type { Lesson } from "@/types/material.types";

  export function PreviewPlayer({ lesson }: { lesson: Lesson }) {
      const [currentTab, setCurrentTab] = useState<"video" | "reading" | "quiz">("video");

      useEffect(() => {
          if (lesson.videoUrl || lesson.video) {
              setCurrentTab("video");
          } else if (lesson.pdf || lesson.reading) {
              setCurrentTab("reading");
          } else if (lesson.quizId) {
              setCurrentTab("quiz");
          }
      }, [lesson]);

      return (
          <div className="flex flex-col gap-4 border border-slate-100 rounded-2xl p-4 bg-slate-50/20">
              <div className="flex gap-2">
                  {(lesson.videoUrl || lesson.video) && (
                      <button
                          onClick={() => setCurrentTab("video")}
                          className={`px-3 py-1 rounded text-xxs font-bold uppercase transition ${
                              currentTab === "video" ? "bg-wine text-white" : "bg-slate-100 text-slate-500"
                          }`}
                      >
                          Xem Video
                      </button>
                  )}
                  {(lesson.pdf || lesson.reading) && (
                      <button
                          onClick={() => setCurrentTab("reading")}
                          className={`px-3 py-1 rounded text-xxs font-bold uppercase transition ${
                              currentTab === "reading" ? "bg-wine text-white" : "bg-slate-100 text-slate-500"
                          }`}
                      >
                          Xem Bài đọc
                      </button>
                  )}
                  {lesson.quizId && (
                      <button
                          onClick={() => setCurrentTab("quiz")}
                          className={`px-3 py-1 rounded text-xxs font-bold uppercase transition ${
                              currentTab === "quiz" ? "bg-wine text-white" : "bg-slate-100 text-slate-500"
                          }`}
                      >
                          Làm Quiz
                      </button>
                  )}
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-inner min-h-[300px] flex flex-col justify-between">
                  {currentTab === "video" && <VideoPlayerPreview video={lesson.video} />}
                  {currentTab === "reading" && <ReadingPreview reading={lesson.reading} />}
                  {currentTab === "quiz" && <QuizPreview quizId={lesson.quizId} />}
              </div>
          </div>
      );
  }

  function VideoPlayerPreview({ video }: { video: any }) {
      const [isPlaying, setIsPlaying] = useState(false);
      const [currentTime, setCurrentTime] = useState(0);
      const [lockQuestion, setLockQuestion] = useState<any>(null);
      const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
      const [feedback, setFeedback] = useState<string | null>(null);

      const intervalRef = useRef<any>(null);

      const duration = video?.durationTime || 120;
      const questions = video?.questions || [];

      useEffect(() => {
          if (isPlaying) {
              intervalRef.current = setInterval(() => {
                  setCurrentTime((prev) => {
                      const next = prev + 1;
                      // Check for question locks
                      const triggerQuestion = questions.find((q: any) => q.timeInVideo === next);
                      if (triggerQuestion) {
                          setIsPlaying(false);
                          setLockQuestion(triggerQuestion);
                          setSelectedAnswerIdx(null);
                          setFeedback(null);
                          clearInterval(intervalRef.current);
                      }
                      if (next >= duration) {
                          setIsPlaying(false);
                          clearInterval(intervalRef.current);
                          return duration;
                      }
                      return next;
                  });
              }, 1000);
          } else {
              if (intervalRef.current) clearInterval(intervalRef.current);
          }

          return () => {
              if (intervalRef.current) clearInterval(intervalRef.current);
          };
      }, [isPlaying, questions, duration]);

      const handleCheckAnswer = () => {
          if (selectedAnswerIdx === null || !lockQuestion) return;
          const opt = lockQuestion.options[selectedAnswerIdx];
          if (opt.isCorrect) {
              setFeedback("Chính xác! Bạn có thể tiếp tục phát video.");
              setTimeout(() => {
                  setLockQuestion(null);
                  setIsPlaying(true);
              }, 2000);
          } else {
              setFeedback("Chưa chính xác. Vui lòng thử lại!");
          }
      };

      return (
          <div className="flex-1 flex flex-col justify-between p-4 relative bg-slate-950 text-white min-h-[300px]">
              {/* Screen Mockup */}
              <div className="flex-1 flex items-center justify-center relative">
                  {lockQuestion ? (
                      <div className="absolute inset-0 bg-slate-900/95 flex flex-col justify-center p-6 text-slate-100 z-10 animate-fade-in">
                          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 uppercase">
                              <AlertCircle className="size-3" />
                              Câu hỏi chặn màn hình
                          </span>
                          <h4 className="text-xs font-bold mt-1.5 text-white">{lockQuestion.content}</h4>
                          <div className="flex flex-col gap-1.5 mt-3">
                              {lockQuestion.options.map((opt: any, i: number) => (
                                  <button
                                      key={i}
                                      onClick={() => setSelectedAnswerIdx(i)}
                                      className={`w-full text-left p-2 rounded text-xxs border transition ${
                                          selectedAnswerIdx === i
                                              ? "border-amber-400 bg-amber-500/10 text-white font-bold"
                                              : "border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300"
                                      }`}
                                  >
                                      {opt.content}
                                  </button>
                              ))}
                          </div>
                          {feedback && (
                              <p className={`text-[10px] font-semibold mt-2 ${feedback.includes("Chính xác") ? "text-green-400" : "text-red-400"}`}>
                                  {feedback}
                              </p>
                          )}
                          <div className="flex justify-end mt-4">
                              <button
                                  onClick={handleCheckAnswer}
                                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded text-xxs"
                              >
                                  Kiểm tra đáp án
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center gap-2">
                          <div className="size-12 rounded-full border border-white/20 flex items-center justify-center bg-white/5 cursor-pointer hover:bg-white/10" onClick={() => setIsPlaying(!isPlaying)}>
                              {isPlaying ? <Pause className="size-6 text-white" /> : <Play className="size-6 text-white translate-x-0.5" />}
                          </div>
                          <span className="text-xxs text-slate-400 font-semibold">{isPlaying ? "Đang phát thử..." : "Đã tạm dừng"}</span>
                      </div>
                  )}
              </div>

              {/* Custom Timeline Controls */}
              <div className="flex items-center gap-3 shrink-0 pt-2 border-t border-white/10">
                  <button onClick={() => setIsPlaying(!isPlaying)} className="p-1 hover:bg-white/10 rounded">
                      {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
                  </button>
                  <span className="text-xxs font-mono text-slate-300">
                      {currentTime}s / {duration}s
                  </span>
                  <div className="flex-1 h-1 bg-slate-800 rounded relative overflow-hidden">
                      <div className="h-full bg-wine-light" style={{ width: `${(currentTime / duration) * 100}%` }} />
                      {/* Mark question checkpoints */}
                      {questions.map((q: any, i: number) => (
                          <div
                              key={i}
                              className="absolute top-0 w-1 h-full bg-amber-500"
                              style={{ left: `${(q.timeInVideo / duration) * 100}%` }}
                              title={`Câu hỏi tại ${q.timeInVideo}s`}
                          />
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  function ReadingPreview({ reading }: { reading: any }) {
      return (
          <div className="p-5 flex-1 flex flex-col gap-4 text-slate-800 max-h-[350px] overflow-y-auto custom-scrollbar">
              <div className="prose prose-sm max-w-none text-xs border-b border-slate-100 pb-3">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 flex items-center gap-1">
                      <CheckCircle className="size-3 text-green-500" />
                      Nội dung học lý thuyết
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{reading?.content || "Không có nội dung lý thuyết bằng văn bản."}</div>
              </div>

              {reading?.questions && reading.questions.length > 0 && (
                  <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Câu hỏi kiểm tra bài đọc</span>
                      {reading.questions.map((q: any, i: number) => (
                          <div key={i} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                              <h5 className="text-xs font-bold text-slate-800">{q.content}</h5>
                              <div className="flex flex-col gap-1.5 mt-2">
                                  {q.options.map((opt: any, oIdx: number) => (
                                      <label key={oIdx} className="flex items-center gap-2 text-xxs text-slate-600">
                                          <input type="radio" name={`r-q-${i}`} />
                                          <span>{opt.content}</span>
                                      </label>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      );
  }

  function QuizPreview({ quizId }: { quizId: string | null | undefined }) {
      return (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-3">
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">QUIZ LINKED: {quizId}</span>
              <h4 className="text-sm font-black text-slate-800">Bài tập kiểm tra trắc nghiệm tổng hợp</h4>
              <p className="text-xs text-slate-500 max-w-xs">Học viên sẽ được điều hướng qua trang thi trắc nghiệm riêng biệt để hoàn thành Quiz này.</p>
              <button className="bg-wine text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-wine-deep border-none shadow-md shadow-wine/10 mt-2">
                  Bắt đầu làm bài thi
              </button>
          </div>
      );
  }
  ```

- [ ] **Step 2: Import PreviewPlayer inside LessonMaterialModal**
  Update imports in `src/components/application/modals/lesson-material-modal.tsx` to include `PreviewPlayer`:
  ```typescript
  import { PreviewPlayer } from "./preview-player";
  ```
  And make sure the preview tab renders it:
  ```tsx
  {activeTab === "preview" && <PreviewPlayer lesson={localLesson} />}
  ```

- [ ] **Step 3: Run Typecheck**
  Run: `pnpm type-check`
  Expected: Success.

- [ ] **Step 4: Commit**
  ```bash
  git add src/components/application/modals/preview-player.tsx src/components/application/modals/lesson-material-modal.tsx
  git commit -m "feat: implement interactive student player preview with time locks"
  ```

---

## 5. Review & Execution Choosing

Plan complete. Proceed to run verification once implementation has completed task-by-task.
