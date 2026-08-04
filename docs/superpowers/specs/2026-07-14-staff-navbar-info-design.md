# Design Specification: Staff Navbar Info & Staff Management Page

This document outlines the design and implementation details for:
1. Displaying static staff information (full name, dynamically mapped roles, and real avatars) on the Navbar (Admin Header).
2. Implementing a premium Staff Management page at `/staff` to list, search, filter, create, update, and delete staff accounts, with system mappings.

---

## Part 1: Navbar Staff Info Integration

### 1. Type & Mapping Updates
- Modify the `UserProfile` interface in [auth.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/auth.types.ts) to include the `roles` field:
  ```typescript
  export interface UserProfile {
      id: string;
      email: string;
      fullName: string;
      avatarUrl?: string | null;
      phoneNumber?: string | null;
      role: string;
      roles?: string[]; // Added
      permissions: string[];
      createdAt?: string | Date;
      lastLoginAt?: string | Date | null;
  }
  ```
- Update `mapBackendStaffToUserProfile` in [auth.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/auth.service.ts) to extract the role names from `staff.roles` (an array of `StaffRoleEmbed` objects `{ name, weight }`) and assign them to the `roles` field:
  ```typescript
  function mapBackendStaffToUserProfile(staff: any): UserProfile {
      const roleNames = (staff.roles || []).map((r: any) => r.name);
      // ...
      return {
          id: staff.id || staff._id || "",
          email: staff.email || "",
          fullName: staff.fullName || "",
          avatarUrl: staff.avatar || null,
          phoneNumber: staff.phone || null,
          role: role,
          roles: roleNames, // Added
          permissions: permissions,
          createdAt: staff.createdAt,
      };
  }
  ```

### 2. Navbar UI Updates (Admin Header)
- Modify [admin-header.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/layout/admin/admin-header.tsx):
  - Import the `<Avatar>` component from `@/components/base/avatar/avatar`.
  - Add helper function `getRoleLabel(roles?: string[], defaultRole?: string): string` to map roles to Vietnamese:
    - `ADMIN` -> `"Quản trị viên"`
    - `MANAGER` -> `"Quản lý"`
    - `TEACHER` -> `"Giảng viên"`
    - `TEACHER_ASSISTANT` -> `"Trợ giảng"`
    - `ASSISTANT` -> `"Trợ lý"`
    - Fallback -> Map from `defaultRole`.
  - Render name, mapped role label, and `<Avatar src={user?.avatarUrl} initials={getInitials(user?.fullName)} />`.

---

## Part 2: Staff Management CRUD Page

### 1. Routes & Structure
- **Route file**: `src/app/staff/page.tsx`
  Renders the `StaffListClientView` component.
- **Client wrapper**: `src/views/staff-list-client-view.tsx`
  Checks authentication and wraps `StaffListView` in `AdminLayout`.
- **View component**: `src/views/staff-list-view.tsx`
  Implements the main layout of the staff management page:
  - KPI Cards (Total Staff, Active Teachers, Admins, Inactive).
  - Search input and dropdown/combobox filters (for Role, Status).
  - Pre-built `<Table>` component with columns: No, Avatar, Name, Phone, Email, Gender, Address, Status, Roles, Systems, Actions.
  - Slideout Panel / Drawer for Add and Edit Staff forms.
  - Confirmation modals for deletion and locking.

### 2. Data Layer & API Integration
Create `src/services/staff.service.ts` to query staff and training systems from the backend API:
- `getStaffList(): Promise<Staff[]>` -> `GET /api/staff`
- `createStaff(data: CreateStaffDto): Promise<Staff>` -> `POST /api/staff`
- `updateStaff(id: string, data: UpdateStaffDto): Promise<Staff>` -> `PUT /api/staff/:id`
- `deleteStaff(id: string): Promise<void>` -> `DELETE /api/staff/:id`
- `getSystemsList(): Promise<System[]>` -> `GET /api/systems`

Create `src/schemas/staff.schema.ts` to define validation schemas for creation and update of staff profiles using `zod`.

### 3. Visual Styling
- Status Badge: `ACTIVE` -> Emerald/Green badge; `DISABLE` -> Rose/Red badge.
- Role Badges: Display each role as a different color badge (e.g. `ADMIN` in Burgundy, `MANAGER` in Purple, `TEACHER` in Indigo).
- Avatar: `<Avatar size="sm" src={staff.avatar} initials={getInitials(staff.fullName)} />`.
- Systems mapping: Match `staff.systemIds` against the fetched systems list and show them as a comma-separated list or individual badges (e.g. `PTIT-CNTT-K24`, `PTIT-CNTT-K25`).

---

## Verification Plan

### Automated Tests
- Run `npm run type-check` to verify no TypeScript compilation errors.
- Run `npm run lint` to check for style/linting errors.

### Manual Verification
- Access `/staff` route.
- Verify that the staff list is loaded from `http://103.118.29.137:6789/v1/staff`.
- Verify the search, role filter, and status filter function properly on the table.
- Open the Add Staff slideout, verify form validation works, fill the fields, and submit. Check if the list updates.
- Open the Edit Staff slideout for an existing user, verify the fields pre-fill, change systems or roles, and save.
- Toggle/Click the delete button for a staff and confirm in the modal. Verify the staff is removed.
- Check the navbar and verify it displays the logged-in user's profile details.
