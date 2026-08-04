# Design Spec: Admin Header Notification Bell & Staff API Integration

- **Date**: 2026-08-04
- **Target App**: `lms-portal-admin`
- **Scope**: Header Bell Icon UI + Dropdown Popover + Staff Notification Service & Modals

---

## 1. Overview & Goals

Integrate the staff notification system into `lms-portal-admin`:
1. Add a Bell Icon button next to the Live Time clock in `AdminHeader`.
2. Provide a Popover Dropdown displaying the staff notifications list loaded from `GET /v1/staff/notifications`.
3. Provide quick actions: View notification details, delete notification (`DELETE /v1/staff/notifications/:id`), and create new notification (`POST /v1/staff/notifications`) via a modal.

---

## 2. Component & File Structure

### 2.1 Services & Types
- **`src/types/notification.types.ts`**: Types matching backend staff notifications response (`LmsNotificationEntity`, `CreateStaffNotificationDto`, `NotificationCategory`).
- **`src/services/notification.service.ts`**:
  - `listStaffNotifications(params)` -> `GET /v1/staff/notifications`
  - `createStaffNotification(dto)` -> `POST /v1/staff/notifications`
  - `updateStaffNotification(id, dto)` -> `PUT /v1/staff/notifications/:id`
  - `deleteStaffNotification(id)` -> `DELETE /v1/staff/notifications/:id`
  - `listCategories()` -> `GET /v1/staff/notification-categories`

### 2.2 UI Components
- **`src/components/layout/admin/admin-header.tsx`**: Update layout to include `NotificationBell` component right next to the Live Time indicator.
- **`src/components/layout/admin/notification-bell.tsx`**:
  - Render Lucide `Bell` icon with unread/total count badge.
  - Manage popover state (open/close on click, click outside).
  - Fetch notifications on mount & popover open.
  - Display list with status tags (`categoryCode`), title, excerpt, date/time, and action buttons.
  - Trigger `CreateNotificationModal`.
- **`src/components/layout/admin/modals/create-notification-modal.tsx`**:
  - Form to create a new notification (broadcast to all students or targeted to specific student IDs).
  - Select category from dynamic categories (`GET /v1/staff/notification-categories`).
  - Inputs for `title`, `message` (excerpt), `body` (detail paragraphs), `author`, `isPinned`, and `studentIds`.

---

## 3. Interaction & Flow

1. **Header Rendering**: `AdminHeader` renders `<NotificationBell />` between the clock widget and user avatar widget.
2. **Bell Click**: Opens Popover Dropdown.
3. **Data Fetching**: Calls `notificationService.listStaffNotifications({ limit: 10, offset: 0 })`.
4. **Item Actions**:
   - **View Detail**: Opens preview modal with full body text and metadata.
   - **Delete**: Soft-delete notification with confirmation.
   - **Create New**: Opens `CreateNotificationModal` form dialog. On submit, posts data and refreshes list.

---

## 4. Verification & Testing

- Verify build cleanly with TypeScript checks.
- Verify UI rendering in `AdminHeader` with responsive positioning and smooth popover animations.
