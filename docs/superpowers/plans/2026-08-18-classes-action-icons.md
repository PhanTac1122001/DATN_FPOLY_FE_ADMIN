# Replace Class Action Dropdown with Direct Icons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the row action dropdown menu on `/classes` with 3 direct action icon buttons (Eye, Edit, Trash2) matching `/courses` styling.

**Architecture:** Modify `ClassesListView` in `classes-list-view.tsx` to render inline circular icon buttons with tooltips instead of `Dropdown.Root`.

**Tech Stack:** React, Next.js, Tailwind CSS, Lucide Icons (`Eye`, `Edit`, `Trash2`).

## Global Constraints

- Preserve exact existing click handlers (`handleOpenDetail`, `handleOpenEdit`, `handleOpenDelete`).
- Match `/courses` button style: `size-8 rounded-full cursor-pointer items-center justify-center inline-flex transition`.

---

### Task 1: Replace Dropdown with Icon Action Buttons in ClassesListView

**Files:**
- Modify: `c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/classes/classes-list-view.tsx:12,175-216`

**Interfaces:**
- Consumes: `UI_TEXT.classes`, `handleOpenDetail`, `handleOpenEdit`, `handleOpenDelete`
- Produces: Inline row action buttons for `/classes`

- [ ] **Step 1: Inspect `classes-list-view.tsx` lines around action dropdown**

- [ ] **Step 2: Update imports and replace Dropdown menu in `classes-list-view.tsx`**

Replace:
```tsx
<td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-hover:bg-slate-50">
    <div className="flex justify-center">
        <Dropdown.Root>
            <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-cream" />
            <Dropdown.Popover className="z-50 w-48 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line">
                <Dropdown.Menu>
                    <Dropdown.Item
                        icon={Eye}
                        onAction={() => handleOpenDetail(cls)}
                        className={(state) =>
                            "text-slate-700 [&_svg]:text-current " +
                            (state.isFocused || state.isHovered ? "[&>div]:!bg-slate-100" : "")
                        }
                    >
                        <span>{UI_TEXT.classes.classDetail}</span>
                    </Dropdown.Item>
                    <Dropdown.Item
                        icon={Edit}
                        onAction={() => handleOpenEdit(cls)}
                        className={(state) =>
                            "text-blue-600 [&_svg]:text-current " +
                            (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                        }
                    >
                        <span>{UI_TEXT.classes.editClass}</span>
                    </Dropdown.Item>
                    <Dropdown.Separator className="my-1 bg-line" />
                    <Dropdown.Item
                        icon={Trash2}
                        onAction={() => handleOpenDelete(cls)}
                        className={(state) =>
                            "text-red-600 [&_svg]:text-current " +
                            (state.isFocused || state.isHovered ? "[&>div]:!bg-red-50" : "")
                        }
                    >
                        <span>{UI_TEXT.classes.deleteClass}</span>
                    </Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown.Popover>
        </Dropdown.Root>
    </div>
</td>
```

With:
```tsx
<td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-hover:bg-slate-50">
    <div className="flex items-center justify-center gap-1.5">
        <button
            type="button"
            onClick={() => handleOpenDetail(cls)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition duration-200 hover:scale-105 hover:bg-indigo-600 hover:text-white"
            title={UI_TEXT.classes.classDetail}
        >
            <Eye className="size-4" />
        </button>
        <button
            type="button"
            onClick={() => handleOpenEdit(cls)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
            title={UI_TEXT.classes.editClass}
        >
            <Edit className="size-4" />
        </button>
        <button
            type="button"
            onClick={() => handleOpenDelete(cls)}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-600 hover:text-white"
            title={UI_TEXT.classes.deleteClass}
        >
            <Trash2 className="size-4" />
        </button>
    </div>
</td>
```

And remove `import { Dropdown } from "@/components/base/dropdown/dropdown";` from imports.

- [ ] **Step 3: Verify implementation**

Verify no linter or build errors occur.

- [ ] **Step 4: Commit changes**

```bash
git add src/views/classes/classes-list-view.tsx
git commit -m "feat(classes): replace dropdown action menu with direct action icons"
```
