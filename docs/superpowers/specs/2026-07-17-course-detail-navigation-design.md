# Design Spec: Course Detail Navigation to Sessions & Lessons

## 1. Problem Statement
Currently, from the System detail view (`/type/[id]`), administrators can view the list of courses under that system, but they cannot click to go directly to the curriculum and configuration (Sessions and Lessons) for a specific course.
We need to add a "View Details" action button (using an eye icon) for each course in the table. Clicking this button should navigate to the `/courses` page with the corresponding System and Course pre-selected, and the first Session expanded automatically.

---

## 2. Proposed Approaches

### Approach 1: URL Query Parameters (Recommended)
- **Description**: Use standard URL query parameters (`/courses?systemId=<systemId>&courseId=<courseId>`) to pass selection state.
- **Pros**:
  - URL is shareable, bookmarkable, and survives page refreshes.
  - Standard Next.js pattern using `useSearchParams`.
- **Cons**:
  - Requires wrapping the view in a `<Suspense>` boundary (good practice anyway).

### Approach 2: Zustand Store / Context
- **Description**: Store selected course details in global state before navigation.
- **Pros**:
  - Cleaner URLs.
- **Cons**:
  - Refreshing the page or direct navigation clears the selection state.
  - Less standard for routing.

We recommend **Approach 1** due to its shareability and alignment with REST/Web standards.

---

## 3. Design Details

### 3.1. Navigation Button (Eye Icon) in `type-detail-view.tsx`
- We will import `Eye` from `lucide-react`.
- We will add a new "Hành động" (Actions) column in the courses table.
- A `<Link>` component will be rendered with the `Eye` icon and path `/courses?systemId=${detail.system.id}&courseId=${course.id}`.

### 3.2. URL Parameter Integration in `courses-view.tsx`
- Use `useSearchParams()` from `next/navigation` to read `systemId` and `courseId`.
- Initialize `selectedSystemId` and `selectedCourseId` states with these parameter values.
- Add `useEffect` to sync local state if the query parameters change (e.g. if navigation occurs again with different parameters).
- Add `useEffect` to automatically expand the first session once the list of sessions is loaded for the selected course.
- Add URL updates when the system or course is changed manually in the sidebar (optional, but keeps URL in sync).

### 3.3. Suspense wrapping in `courses-client-view.tsx`
- Wrap `<CoursesView />` inside a `<Suspense>` component because it uses `useSearchParams`.

---

## 4. Verification Plan
1. Navigating to `/type/[systemId]` -> verify "Hành động" column exists and has the Eye button.
2. Clicking Eye button -> URL changes to `/courses?systemId=[systemId]&courseId=[courseId]`.
3. Verify `/courses` page loads with correct System and Course pre-selected, and the first Session is auto-expanded.
