# Design Specification: Training Types API Integration

This design details the API integration for the Training Types (Hệ học/Hệ đào tạo) views (`TypeListView` and `TypeDetailView`) under the `/type` route. It replaces the static mock data with real backend endpoints for Systems, Specializations, Semesters, and Courses.

---

## 1. API Endpoints Utilized

1. **Systems List**: `GET /v1/systems` (via `getSystemsList()` in `system.service.ts`)
2. **Specializations List**: `GET /v1/staff/specializes` (via `getSpecializesList()` in `system.service.ts`)
3. **Semesters by Specialization**: `GET /v1/staff/semesters/specialize/:id` (via `getSemestersBySpecialize(id)` in `system.service.ts`)
4. **Courses by System**: `GET /v1/staff/courses/system/:id` (via `getCoursesBySystem(id)` in `material.service.ts`)

---

## 2. Views Integration Details

### 2.1. Training Types List View (`TypeListView`)
- **Query Hooks**:
  - `systems`: Fetch all systems.
  - `specializes`: Fetch all specializations.
- **Data Mapping**:
  - Map each system to include a `majors` field containing a comma-separated string of the specialization names associated with that system (`specializes.filter(s => s.systemId === system.id).map(s => s.name).join(", ")`).
- **Interaction**:
  - Client-side search filters by name, systemCode, and majors.
  - Clicking "View details" (Eye icon) routes to `/type/[id]`.

### 2.2. Training Types Detail View (`TypeDetailView`)
- **Query Hooks**:
  - `systemDetail`: A combined query fetching the selected system, filtering specializations, fetching semesters for each specialization in parallel (`Promise.all`), and fetching system courses.
- **Data Mapping**:
  - Build flat list of semesters. Each semester contains its specialization's name (`specializeName`) and a dynamically mapped `badgeColor` based on its priority or index.
- **Modal Component**:
  - Introduce `CourseListModal` to display a list of courses in a clean table layout.
  - Matches the premium UI styling (background white, rounded-2xl, border-slate-100, etc.).
  - Filters courses from `systemCourses` using `semester.courseIds`.

---

## 3. Verification Plan

### Manual Verification
1. Navigate to `/type` and verify that the real systems and specializations load correctly.
2. Search and paginate the training types.
3. Click "View details" for a system, verify details card and semesters list load correctly.
4. Click "Danh sách môn học" and verify the Course List modal opens, displaying the correct courses assigned to that semester.
