# Design Spec: Synchronize Icon Buttons and Add Edit Set to Exams Sets EL

## Overview
Synchronize the UI button styling in `/exams-sets-el` (`ExamSetListView` and `ExamSetDetailView`) to match the Course page (`CoursesListView`), and add an Edit button (`Pencil`) in the exam set table row to allow editing exam set metadata (Title, Description, Pass Threshold, Course ID).

## UI/UX Design Changes

### 1. Table Action Icon Buttons in `ExamSetListView`
Transform table action buttons from square outline style to circular soft-badge buttons (`size-8 rounded-full`):
- **View Details (`Eye`)**:
  - Class: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white`
  - Icon: `<Eye className="size-4" />`
- **Edit Set (`Pencil`)**:
  - Class: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white`
  - Icon: `<Pencil className="size-4" />`
- **Delete Set (`Trash2`)**:
  - Class: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white`
  - Icon: `<Trash2 className="size-4" />`
- **Container**: `<div className="flex items-center justify-center gap-1.5">`

### 2. Header Action Buttons
Update header primary action buttons across `ExamSetListView` and `ExamSetDetailView` to match the Course page pill style:
- Class: `inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-wine/90 active:scale-95`
- Icon: `<Plus className="size-4.5" />`

### 3. Detail View Question & Essay Action Buttons (`ExamSetDetailView`)
Transform Edit (`Edit` / `Pencil`) and Delete (`Trash2`) buttons in question and essay cards:
- **Edit**: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white`
- **Delete**: `inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white`

## Features & Implementation

### 1. `CreateQuizModal` Enhancement
- Support `initialData?: ExamSetMock | QuizBackendEntity | null` prop.
- When `initialData` is provided:
  - Populate form state (`title`, `description`, `passThreshold`, `courseId`).
  - Title: "Chỉnh sửa bộ đề trắc nghiệm".
  - Button text: "Lưu thay đổi".
  - On submit: call `updateQuiz(initialData.id, payload)`.
- When `initialData` is null:
  - Default form state.
  - Title: "Tạo bộ đề trắc nghiệm mới".
  - Button text: "Tạo bộ đề trắc nghiệm".
  - On submit: call `createQuiz(payload)`.

### 2. `ExamSetListView` State & Edit Handler
- Add `selectedQuizForEdit` state to pass to `CreateQuizModal`.
- On clicking Edit button, open `CreateQuizModal` with selected quiz.
- Update table list locally and query/state on success.
