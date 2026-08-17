"use client";

import { useEffect, useMemo, useState } from "react";
import { User, X } from "lucide-react";
import { Heading } from "react-aria-components";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
import { CustomModal, Dialog } from "@/components/ui/custom-modal";
import { DEFAULT_PAGE_SIZE } from "@/constants/options.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { FilterFieldDefinition, FilterState } from "@/types/filter.types";
import { FilterFieldType } from "@/types/filter.types";
import type { SelectGroupStudentModalProps } from "@/types/group.types";
import { cx } from "@/utils/cx";

export function SelectGroupStudentModal({ isOpen, onClose, students = [], initialSelectedIds = [], onConfirm }: SelectGroupStudentModalProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });

    const filterFields = useMemo<FilterFieldDefinition[]>(
        () => [
            {
                key: "studentCode",
                label: UI_TEXT.enrollStudentModal.thStudentCode,
                type: FilterFieldType.STRING,
            },
        ],
        [],
    );

    useEffect(() => {
        if (isOpen) {
            setSelectedIds(initialSelectedIds);
            setSearchQuery("");
            setAdvancedFilterState({ conditions: [] });
            setPage(1);
        }
    }, [isOpen, initialSelectedIds]);

    const filteredStudents = useMemo(() => {
        return students.filter((st) => {
            if (searchQuery) {
                const name = String(st.fullName || "").toLowerCase();
                const code = String(st.studentCode || "").toLowerCase();
                const email = String(st.email || "").toLowerCase();
                const q = searchQuery.toLowerCase().trim();
                if (!name.includes(q) && !code.includes(q) && !email.includes(q)) {
                    return false;
                }
            }

            for (const condition of advancedFilterState.conditions) {
                if (!condition.fieldKey || condition.value === null || condition.value === "") continue;
                if (condition.fieldKey === "studentCode") {
                    const val = String(condition.value).toLowerCase();
                    const code = String(st.studentCode || "").toLowerCase();
                    if (!code.includes(val)) {
                        return false;
                    }
                }
            }
            return true;
        });
    }, [students, searchQuery, advancedFilterState]);

    const totalStudents = filteredStudents.length;
    const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize));
    const paginatedStudents = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredStudents.slice(start, start + pageSize);
    }, [filteredStudents, page, pageSize]);

    const currentPageIds = paginatedStudents.map((s) => s.id);
    const isAllPageSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

    const toggleSelectAllPage = () => {
        if (isAllPageSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
        } else {
            setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
        }
    };

    const toggleSelectStudent = (id: string) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const handleConfirm = () => {
        onConfirm(selectedIds);
        onClose();
    };

    return (
        <CustomModal.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <CustomModal.Content className="max-w-4xl !rounded-[24px]">
                <Dialog className="flex flex-col rounded-[24px] bg-white shadow-2xl outline-none">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                        <Heading slot="title" className="text-xl font-bold text-slate-900">
                            {UI_TEXT.enrollStudentModal.selectStudentTitle}
                        </Heading>
                        <button
                            type="button"
                            onClick={onClose}
                            className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Body Form */}
                    <div className="flex flex-col gap-5 p-6">
                        {/* Search & Filter Bar */}
                        <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                                <SearchFilters
                                    search={searchQuery}
                                    onSearchChange={(val) => {
                                        setSearchQuery(val);
                                        setPage(1);
                                    }}
                                    advancedFilterState={advancedFilterState}
                                    setAdvancedFilterState={(st) => {
                                        setAdvancedFilterState(st);
                                        setPage(1);
                                    }}
                                    filterFields={filterFields}
                                    searchPlaceholder="Tìm kiếm sinh viên theo tên..."
                                />
                            </div>

                            {/* Selection Counter */}
                            <div className="text-sm font-semibold whitespace-nowrap text-slate-600">
                                {"("}
                                {selectedIds.length} {UI_TEXT.enrollStudentModal.studentsSelectedSuffix}
                            </div>
                        </div>

                        {/* Students Table */}
                        <div className="custom-scrollbar max-h-[420px] min-h-[320px] overflow-x-auto rounded-2xl border border-line bg-white shadow-xs">
                            <table className="w-full table-auto border-collapse text-left text-sm text-ink">
                                <thead>
                                    <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                        <th className="w-12 px-4 py-3 text-center">
                                            <input
                                                type="checkbox"
                                                checked={isAllPageSelected}
                                                onChange={toggleSelectAllPage}
                                                className="size-4 cursor-pointer rounded border-slate-300 text-wine accent-wine focus:ring-wine"
                                                title={UI_TEXT.enrollStudentModal.selectAllOnPage}
                                            />
                                        </th>
                                        <th className="px-4 py-3 text-center">{UI_TEXT.classDetail.thStt}</th>
                                        <th className="px-4 py-3 text-center">{UI_TEXT.enrollStudentModal.thAvatar}</th>
                                        <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thStudentName}</th>
                                        <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thStudentCode}</th>
                                        <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thEmail}</th>
                                        <th className="px-4 py-3">{UI_TEXT.enrollStudentModal.thDob}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {paginatedStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-12 text-center text-sm text-slate-400 italic">
                                                {UI_TEXT.enrollStudentModal.noStudentsFound}
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedStudents.map((st, index) => {
                                            const isSelected = selectedIds.includes(st.id);
                                            const rowNumber = (page - 1) * pageSize + index + 1;
                                            return (
                                                <tr
                                                    key={st.id}
                                                    onClick={() => toggleSelectStudent(st.id)}
                                                    className={cx(
                                                        "group cursor-pointer transition duration-150 hover:bg-slate-50",
                                                        isSelected && "border-l-4 border-l-wine bg-slate-50/90",
                                                    )}
                                                >
                                                    <td className="border-b border-line px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => toggleSelectStudent(st.id)}
                                                            className="size-4 cursor-pointer rounded border-slate-300 text-wine accent-wine focus:ring-wine"
                                                        />
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 text-center text-xs font-semibold text-muted">{rowNumber}</td>
                                                    <td className="border-b border-line px-4 py-3 text-center">
                                                        <div className="mx-auto flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                                            <User className="size-4" />
                                                        </div>
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 font-bold text-ink">{st.fullName}</td>
                                                    <td className="border-b border-line px-4 py-3 text-xs font-semibold text-slate-700">
                                                        {st.studentCode || "—"}
                                                    </td>
                                                    <td className="border-b border-line px-4 py-3 text-xs text-muted">{st.email || "—"}</td>
                                                    <td className="border-b border-line px-4 py-3 text-xs text-muted">
                                                        {st.dateOfBirth ? new Date(st.dateOfBirth).toLocaleDateString("vi-VN") : "—"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Pagination Footer */}
                        <TablePagination
                            total={totalStudents}
                            page={page}
                            totalPages={totalPages}
                            limit={pageSize}
                            onPageChange={(p) => setPage(p)}
                            onLimitChange={(l) => {
                                setPageSize(l);
                                setPage(1);
                            }}
                            className="border-t border-slate-100 pt-3"
                        />

                        {/* Footer buttons */}
                        <div className="mt-4 flex w-full items-center justify-between gap-3 border-t border-slate-100 pt-4">
                            <Button
                                type="button"
                                color="secondary"
                                size="md"
                                onClick={onClose}
                                className="w-1/3 justify-center rounded-full border-slate-200 py-2.5 text-xs font-bold"
                            >
                                {UI_TEXT.enrollStudentModal.cancel}
                            </Button>
                            <Button
                                type="button"
                                color="primary"
                                size="md"
                                onClick={handleConfirm}
                                className="w-2/3 justify-center rounded-full border-none bg-wine py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-wine-deep"
                            >
                                {UI_TEXT.enrollStudentModal.confirm}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            </CustomModal.Content>
        </CustomModal.Root>
    );
}
