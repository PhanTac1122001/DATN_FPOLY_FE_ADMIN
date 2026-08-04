# Staff List View Filter Funnel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the separate, static Role and Status filter dropdowns in the Staff list view to a single popover-based advanced filter matching the design reference, using a funnel icon and omitting the "Bằng" (equals) operator.

**Architecture:** We will add a `hideOperator` prop to the existing `AdvancedFilter` component. When enabled, it hides the operator selection dropdown and defaults conditions to the `EQUALS` operator. We will then replace the filters in `staff-list-view.tsx` with this refactored component, and rewrite the search-and-filter logic.

**Tech Stack:** React, Tailwind CSS, Lucide icons, `react-aria-components`

## Global Constraints
- Do not import external packages.
- Ensure TypeScript types are strictly followed and compile with no errors.
- Preserve search and paginated list functionality.

---

### Task 1: Update AdvancedFilter Type Definitions

**Files:**
- Modify: [filter.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/filter.types.ts#L88-L100)
- Modify: [application.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/application.types.ts#L33-L45)

**Interfaces:**
- Produces: `hideOperator?: boolean` field in `AdvancedFilterProps`

- [ ] **Step 1: Add hideOperator to AdvancedFilterProps in filter.types.ts**
  Add `hideOperator?: boolean;` to the `AdvancedFilterProps` interface in [filter.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/filter.types.ts#L88-L100):
  ```typescript
  export interface AdvancedFilterProps {
      fields: FilterFieldDefinition[];
      value: FilterState;
      onChange: (filter: FilterState) => void;
      maxConditions?: number;
      trigger: React.ReactNode;
      hideOperator?: boolean; // Added
  }
  ```

- [ ] **Step 2: Add hideOperator to AdvancedFilterProps in application.types.ts**
  Add `hideOperator?: boolean;` to the `AdvancedFilterProps` interface in [application.types.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/types/application.types.ts#L33-L45):
  ```typescript
  export interface AdvancedFilterProps {
      fields: FilterFieldDefinition[];
      value: FilterState;
      onChange: (filter: FilterState) => void;
      maxConditions?: number;
      trigger: React.ReactNode;
      hideOperator?: boolean; // Added
  }
  ```

- [ ] **Step 3: Run typescript compiler to verify types**
  Run command: `npx tsc --noEmit` in directory `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
  Expected: Command runs successfully with no errors about `AdvancedFilterProps`.

- [ ] **Step 4: Commit changes**
  ```bash
  git add src/types/filter.types.ts src/types/application.types.ts
  git commit -m "types: add hideOperator prop to AdvancedFilterProps"
  ```

---

### Task 2: Refactor AdvancedFilter Component

**Files:**
- Modify: [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx)

**Interfaces:**
- Consumes: `hideOperator` prop in `AdvancedFilter`

- [ ] **Step 1: Accept hideOperator prop in AdvancedFilter component**
  Modify [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx) signature:
  ```tsx
  export function AdvancedFilter({
      fields,
      value,
      onChange,
      maxConditions = DEFAULT_MAX_CONDITIONS,
      trigger,
      hideOperator = false, // Destructure with default value
  }: AdvancedFilterProps) {
  ```

- [ ] **Step 2: Update handleAddCondition to set default operator**
  Modify `handleAddCondition` in [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx):
  ```tsx
      const handleAddCondition = () => {
          if (localFilterState.conditions.length >= maxConditions) {
              return;
          }

          const newCondition: FilterCondition = {
              id: `condition-${Date.now()}`,
              fieldKey: "",
              operator: hideOperator ? FilterOperator.EQUALS : FilterOperator.CONTAINS,
              value: null,
          };

          setLocalFilterState({
              ...localFilterState,
              conditions: [...localFilterState.conditions, newCondition],
          });
      };
  ```

- [ ] **Step 3: Update field selection change handler**
  Modify the `onSelectionChange` of the Field Selector `Select` inside the condition mapping loop in [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx):
  ```tsx
                                                  {/* Field Selector */}
                                                  <div className="w-full md:w-[200px]">
                                                      <Select
                                                          placeholder={t.selectField}
                                                          selectedKey={condition.fieldKey || null}
                                                          onSelectionChange={(key) => {
                                                              const newField = fields.find((f) => f.key === key);
                                                              if (newField) {
                                                                  const newOperators = getOperatorsForFieldType(newField.type);
                                                                  handleConditionChange(condition.id, {
                                                                      fieldKey: key as string,
                                                                      operator: hideOperator ? FilterOperator.EQUALS : newOperators[0],
                                                                      value: newField.type === FilterFieldType.STRING ? "" : null,
                                                                  });
                                                              }
                                                          }}
                                                          items={fields.map((f) => ({ id: f.key, label: f.label }))}
                                                          size="md"
                                                      >
                                                          {(item) => <Select.Item id={item.id} label={item.label} />}
                                                      </Select>
                                                  </div>
  ```

- [ ] **Step 4: Hide operator dropdown and style inputs**
  Wrap the Operator Selector in `{!hideOperator && ...}` and adjust the width classes.
  In [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx):
  ```tsx
                                                  {/* Operator Selector */}
                                                  {!hideOperator && (
                                                      <div className="w-full md:w-[150px]">
                                                          <Select
                                                              placeholder={t.selectOperator}
                                                              selectedKey={condition.operator || null}
                                                              onSelectionChange={(key) => {
                                                                  handleConditionChange(condition.id, {
                                                                      operator: key as FilterOperator,
                                                                      value: field?.type === FilterFieldType.STRING ? "" : null,
                                                                  });
                                                              }}
                                                              items={operatorOptions}
                                                              size="md"
                                                          >
                                                              {(item) => <Select.Item id={item.id} label={item.label} />}
                                                          </Select>
                                                      </div>
                                                  )}
  ```

- [ ] **Step 5: Change Enum input to use regular Select instead of ComboBox**
  Update the value selector rendering for ENUM to use a simple standard `Select` instead of `Select.ComboBox` for simpler UX when choosing values.
  In [advanced-filter.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/components/application/advanced-filter/advanced-filter.tsx):
  ```tsx
                                                  {/* Value Input */}
                                                  {requiresValue && (
                                                      <div className="w-full md:flex-1">
                                                          {field?.type === FilterFieldType.ENUM && !supportsMultiple ? (
                                                              <Select
                                                                  placeholder={t.enterValue}
                                                                  selectedKey={condition.value ? String(condition.value) : null}
                                                                  onSelectionChange={(key) => {
                                                                      handleConditionChange(condition.id, {
                                                                          value: (key as string) || null,
                                                                      });
                                                                  }}
                                                                  items={field.options || []}
                                                                  size="md"
                                                              >
                                                                  {(item) => <Select.Item id={item.id} label={item.label} />}
                                                              </Select>
                                                          ) : field?.type === FilterFieldType.ENUM && supportsMultiple ? (
  ```

- [ ] **Step 6: Run compiler check**
  Run: `npx tsc --noEmit` in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
  Expected: Success.

- [ ] **Step 7: Commit changes**
  ```bash
  git add src/components/application/advanced-filter/advanced-filter.tsx
  git commit -m "feat: support hideOperator prop in AdvancedFilter component"
  ```

---

### Task 3: Refactor Staff List View to Integrate AdvancedFilter

**Files:**
- Modify: [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx)

**Interfaces:**
- Consumes: `AdvancedFilter` component

- [ ] **Step 1: Modify imports in staff-list-view.tsx**
  Add imports for `AdvancedFilter`, `Filter` from `lucide-react`, `FilterState` and `FilterFieldType` from their respective locations.
  In [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx#L1-L17):
  ```tsx
  import { AlertTriangle, Edit, Lock, Mail, MapPin, Phone, Plus, Search, Trash2, Unlock, Filter } from "lucide-react";
  import { AdvancedFilter } from "@/components/application/advanced-filter/advanced-filter";
  import { FilterFieldType, type FilterState } from "@/types/filter.types";
  ```

- [ ] **Step 2: Replace roleFilter/statusFilter state variables**
  Remove `roleFilter` and `statusFilter` useState variables and add:
  ```tsx
  const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
      conditions: [],
  });
  ```

- [ ] **Step 3: Define filter fields definitions**
  Define `filterFields` constant inside or outside the `StaffListView` component.
  ```tsx
  const filterFields = [
      {
          key: "role",
          label: "Vai trò",
          type: FilterFieldType.ENUM,
          options: [
              { id: RoleEnum.ADMIN, label: UI_TEXT.staff.roleAdmin },
              { id: RoleEnum.MANAGER, label: UI_TEXT.staff.roleManager },
              { id: RoleEnum.TEACHER, label: UI_TEXT.staff.roleTeacher },
              { id: RoleEnum.TEACHER_ASSISTANT, label: UI_TEXT.staff.roleTeacherAssistant },
              { id: RoleEnum.ASSISTANT, label: UI_TEXT.staff.roleAssistant },
          ],
      },
      {
          key: "status",
          label: "Trạng thái",
          type: FilterFieldType.ENUM,
          options: [
              { id: StatusEnum.ACTIVE, label: UI_TEXT.staff.statusActive },
              { id: StatusEnum.DISABLE, label: UI_TEXT.staff.statusDisable },
          ],
      },
  ];
  ```

- [ ] **Step 4: Update client-side filtering logic**
  Rewrite the `filteredStaffs` filtering computation to evaluate all active filter conditions.
  In [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx#L111-L123):
  ```tsx
      // Filtering logic
      const filteredStaffs = staffs.filter((staff) => {
          const matchesSearch =
              staff.fullName.toLowerCase().includes(search.toLowerCase()) ||
              staff.email.toLowerCase().includes(search.toLowerCase()) ||
              (staff.phone && staff.phone.includes(search));

          let matchesAdvanced = true;
          for (const condition of advancedFilterState.conditions) {
              if (!condition.fieldKey || condition.value === null || condition.value === "") continue;

              if (condition.fieldKey === "role") {
                  const hasRole = staff.roles.some((r) => r.name === condition.value);
                  if (!hasRole) {
                      matchesAdvanced = false;
                      break;
                  }
              } else if (condition.fieldKey === "status") {
                  if (staff.status !== condition.value) {
                      matchesAdvanced = false;
                      break;
                  }
              }
          }

          return matchesSearch && matchesAdvanced;
      });
  ```

- [ ] **Step 5: Relocate search icon to the right side**
  Move the search icon from left side to right side inside the search input wrapper.
  In [staff-list-view.tsx](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/views/staff-list-view.tsx#L132-L144):
  ```tsx
                          {/* Search Input */}
                          <div className="relative w-full max-w-xs">
                              <input
                                  type="text"
                                  placeholder={UI_TEXT.staff.searchPlaceholder}
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pr-10 pl-4 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine"
                              />
                              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                                  <Search className="size-4" />
                              </span>
                          </div>
  ```

- [ ] **Step 6: Replace static selects with AdvancedFilter component**
  Remove lines 147-179 containing the two old `Select` components and replace with:
  ```tsx
                          {/* Advanced Filter */}
                          <AdvancedFilter
                              fields={filterFields}
                              value={advancedFilterState}
                              onChange={setAdvancedFilterState}
                              hideOperator={true}
                              trigger={
                                  <button
                                      type="button"
                                      className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                                  >
                                      <Filter className="size-4" />
                                      <span>Bộ lọc</span>
                                      {advancedFilterState.conditions.length > 0 && (
                                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-wine text-xs font-bold text-white">
                                              {advancedFilterState.conditions.length}
                                          </span>
                                      )}
                                  </button>
                              }
                          />
  ```

- [ ] **Step 7: Run typescript compiler check**
  Run: `npx tsc --noEmit` in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
  Expected: Success.

- [ ] **Step 8: Verify build**
  Run: `npm run build` in `c:\Users\Admin\Desktop\lmsPortal\lms-portal-admin`
  Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit changes**
  ```bash
  git add src/views/staff-list-view.tsx
  git commit -m "feat: integrate AdvancedFilter with funnel icon and remove equals operator"
  ```
