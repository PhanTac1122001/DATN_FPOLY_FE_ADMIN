"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Edit, Lock, Mail, MapPin, Phone, Plus, Trash2, Unlock } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { StaffModal } from "@/components/application/modals/staff-modal";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { STAFF_FILTER_FIELDS } from "@/constants/staff.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteStaff, getStaffList, getSystemsList, updateStaff } from "@/services/staff.service";
import { toast } from "@/services/toast.service";
import { type FilterState } from "@/types/filter.types";
import { GenderEnum, RoleEnum, type Staff, StatusEnum, type UpdateStaffRequest } from "@/types/staff.types";

const maxVisibleRoles = 2;

export function StaffListView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [advancedFilterState, setAdvancedFilterState] = useState<FilterState>({
        conditions: [],
    });

    // Modal States
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

    // Queries
    const { data: staffs = [], isLoading: isLoadingStaffs } = useQuery({
        queryKey: ["staff"],
        queryFn: getStaffList,
    });

    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    // Mutations
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) => updateStaff(id, data),
        onSuccess: () => {
            toast.success(UI_TEXT.staff.toastSuccess, UI_TEXT.staff.toastUpdateSuccess);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.staff.toastError, error.message || UI_TEXT.staff.toastUpdateError);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStaff,
        onSuccess: () => {
            toast.success(UI_TEXT.staff.toastSuccess, UI_TEXT.staff.toastDeleteSuccess);
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            setIsDeleteOpen(false);
            setSelectedStaff(null);
        },
        onError: (error: Error) => {
            toast.error(UI_TEXT.staff.toastError, error.message || UI_TEXT.staff.toastDeleteError);
        },
    });

    // Opening Edit Modal pre-populates form
    const handleOpenEdit = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsStaffModalOpen(true);
    };

    const handleOpenDelete = (staff: Staff) => {
        setSelectedStaff(staff);
        setIsDeleteOpen(true);
    };

    const handleToggleStatus = (staff: Staff) => {
        const newStatus = staff.status === StatusEnum.ACTIVE ? StatusEnum.DISABLE : StatusEnum.ACTIVE;
        updateMutation.mutate({
            id: staff.id,
            data: { status: newStatus },
        });
    };

    const getSystemCodes = (systemIds?: string[]) => {
        if (!systemIds || systemIds.length === 0) return UI_TEXT.staff.systemNone;
        return systemIds
            .map((id) => systems.find((sys) => sys.id === id)?.systemCode || id)
            .filter(Boolean)
            .join(", ");
    };

    const translateRole = (roleName: string) => {
        switch (roleName) {
            case RoleEnum.ADMIN:
                return UI_TEXT.staff.roleAdmin;
            case RoleEnum.MANAGER:
                return UI_TEXT.staff.roleManager;
            case RoleEnum.TEACHER:
                return UI_TEXT.staff.roleTeacher;
            case RoleEnum.TEACHER_ASSISTANT:
                return UI_TEXT.staff.roleTeacherAssistant;
            case RoleEnum.ASSISTANT:
                return UI_TEXT.staff.roleAssistant;
            default:
                return roleName;
        }
    };

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

    return (
        <div className="flex min-h-0 w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Filter Bar & Table Area */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Filters */}
                <div className="flex shrink-0 flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                        <SearchFilters
                            search={search}
                            onSearchChange={setSearch}
                            advancedFilterState={advancedFilterState}
                            setAdvancedFilterState={setAdvancedFilterState}
                            filterFields={STAFF_FILTER_FIELDS}
                            searchPlaceholder={UI_TEXT.staff.searchPlaceholder}
                        />
                    </div>

                    {/* Add Staff Trigger */}
                    <Button
                        color="primary"
                        size="md"
                        onClick={() => {
                            setSelectedStaff(null);
                            setIsStaffModalOpen(true);
                        }}
                        className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                        iconLeading={<Plus className="pointer-events-none size-5 shrink-0 transition-inherit-all" />}
                    >
                        {UI_TEXT.staff.addStaff}
                    </Button>
                </div>

                {/* Table list */}
                <div className="flex-1 overflow-auto">
                    {isLoadingStaffs ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.loading}</p>
                        </div>
                    ) : filteredStaffs.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{UI_TEXT.staff.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{UI_TEXT.staff.noDataDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1200px] table-auto border-collapse text-left text-sm text-ink">
                            <thead>
                                <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                    <th className="w-12 px-6 py-4 text-center">{UI_TEXT.staff.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.staff.thName}</th>
                                    <th className="px-6 py-4">{UI_TEXT.staff.thContact}</th>
                                    <th className="w-24 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.staff.thGender}</th>
                                    <th className="w-24 px-6 py-4">{UI_TEXT.staff.thAddress}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{UI_TEXT.staff.thRole}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{UI_TEXT.staff.thSystem}</th>
                                    <th className="w-28 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.staff.thStatus}</th>
                                    <th className="sticky right-0 z-20 w-16 bg-slate-50 px-4 py-4 text-center whitespace-nowrap" />
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map((staff, index) => (
                                    <tr key={staff.id} className="group transition duration-150 hover:bg-slate-50">
                                        <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted">{index + 1}</td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            <div className="text-[14.5px] font-bold text-ink">{staff.fullName}</div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                                                <Phone className="size-3.5 text-muted" />
                                                <span>{staff.phone || UI_TEXT.common.noData}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-muted">
                                                <Mail className="size-3.5 shrink-0 text-muted" />
                                                <span className="max-w-[130px] truncate xl:max-w-[150px] 2xl:max-w-[180px]" title={staff.email}>
                                                    {staff.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center text-xs font-semibold whitespace-nowrap text-muted">
                                            {staff.gender === GenderEnum.MALE
                                                ? UI_TEXT.staff.genderMale
                                                : staff.gender === GenderEnum.FEMALE
                                                  ? UI_TEXT.staff.genderFemale
                                                  : UI_TEXT.staff.genderOther}
                                        </td>
                                        <td className="border-b border-line px-6 py-4">
                                            <div className="flex items-center gap-1 text-[13px] text-ink">
                                                <MapPin className="size-3.5 shrink-0 text-muted" />
                                                <span className="max-w-[70px] truncate xl:max-w-[100px] 2xl:max-w-[130px]">
                                                    {staff.address || UI_TEXT.common.noData}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="border-b border-line px-6 py-4 whitespace-nowrap">
                                            {staff.roles.length > maxVisibleRoles ? (
                                                <Tooltip
                                                    placement="top"
                                                    title={
                                                        <div className="flex flex-col gap-1 py-0.5 text-left">
                                                            {staff.roles.map((role) => (
                                                                <div key={role.name} className="whitespace-nowrap">
                                                                    {translateRole(role.name)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    }
                                                >
                                                    <TooltipTrigger className="flex cursor-pointer items-center gap-1">
                                                        {staff.roles.slice(0, maxVisibleRoles).map((role) => (
                                                            <Badge
                                                                key={role.name}
                                                                color={
                                                                    role.name === RoleEnum.ADMIN
                                                                        ? "error"
                                                                        : role.name === RoleEnum.MANAGER
                                                                          ? "warning"
                                                                          : role.name === RoleEnum.TEACHER
                                                                            ? "brand"
                                                                            : "gray"
                                                                }
                                                                size="sm"
                                                            >
                                                                {translateRole(role.name)}
                                                            </Badge>
                                                        ))}
                                                        <Badge color="gray" size="sm">
                                                            {`+${staff.roles.length - maxVisibleRoles}`}
                                                        </Badge>
                                                    </TooltipTrigger>
                                                </Tooltip>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    {staff.roles.map((role) => (
                                                        <Badge
                                                            key={role.name}
                                                            color={
                                                                role.name === RoleEnum.ADMIN
                                                                    ? "error"
                                                                    : role.name === RoleEnum.MANAGER
                                                                      ? "warning"
                                                                      : role.name === RoleEnum.TEACHER
                                                                        ? "brand"
                                                                        : "gray"
                                                            }
                                                            size="sm"
                                                        >
                                                            {translateRole(role.name)}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="border-b border-line px-6 py-4">
                                            {staff.systemIds && staff.systemIds.length > 0 ? (
                                                <div className="max-w-[120px] truncate xl:max-w-[160px]">
                                                    <Tooltip
                                                        placement="top start"
                                                        title={
                                                            <div className="flex flex-col gap-1 py-0.5 text-left">
                                                                {staff.systemIds.map((id) => {
                                                                    const sys = systems.find((s) => s.id === id);
                                                                    return (
                                                                        <div key={id} className="whitespace-nowrap">
                                                                            {sys?.name ? `${sys.systemCode} ` : sys?.systemCode || id}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        }
                                                    >
                                                        <TooltipTrigger className="block max-w-full cursor-pointer truncate text-[13px] font-semibold text-ink">
                                                            {getSystemCodes(staff.systemIds)}
                                                        </TooltipTrigger>
                                                    </Tooltip>
                                                </div>
                                            ) : (
                                                <div className="text-[13px] font-semibold text-ink">{UI_TEXT.staff.systemNone}</div>
                                            )}
                                        </td>
                                        <td className="border-b border-line px-6 py-4 text-center whitespace-nowrap">
                                            <Badge color={staff.status === StatusEnum.ACTIVE ? "success" : "error"} size="sm">
                                                {staff.status === StatusEnum.ACTIVE ? UI_TEXT.staff.statusActiveLabel : UI_TEXT.staff.statusDisableLabel}
                                            </Badge>
                                        </td>
                                        <td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-hover:bg-slate-50">
                                            <div className="flex justify-center">
                                                <Dropdown.Root>
                                                    <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-cream" />
                                                    <Dropdown.Popover className="z-50 w-48 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line">
                                                        <Dropdown.Menu>
                                                            <Dropdown.Item
                                                                icon={Edit}
                                                                onAction={() => handleOpenEdit(staff)}
                                                                className={(state) =>
                                                                    "text-blue-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.editTooltip}</span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Item
                                                                icon={staff.status === StatusEnum.ACTIVE ? Lock : Unlock}
                                                                onAction={() => handleToggleStatus(staff)}
                                                                className={(state) =>
                                                                    "text-amber-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-amber-50" : "")
                                                                }
                                                            >
                                                                <span>
                                                                    {staff.status === StatusEnum.ACTIVE
                                                                        ? UI_TEXT.staff.lockTooltip
                                                                        : UI_TEXT.staff.unlockTooltip}
                                                                </span>
                                                            </Dropdown.Item>
                                                            <Dropdown.Separator className="my-1 bg-line" />
                                                            <Dropdown.Item
                                                                icon={Trash2}
                                                                onAction={() => handleOpenDelete(staff)}
                                                                className={(state) =>
                                                                    "text-red-600 [&_svg]:text-current " +
                                                                    (state.isFocused || state.isHovered ? "[&>div]:!bg-red-50" : "")
                                                                }
                                                            >
                                                                <span>{UI_TEXT.staff.deleteTooltip}</span>
                                                            </Dropdown.Item>
                                                        </Dropdown.Menu>
                                                    </Dropdown.Popover>
                                                </Dropdown.Root>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <StaffModal
                isOpen={isStaffModalOpen}
                onClose={() => {
                    setIsStaffModalOpen(false);
                    setSelectedStaff(null);
                }}
                staff={selectedStaff}
            />

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={() => {
                    if (selectedStaff) {
                        deleteMutation.mutate(selectedStaff.id);
                    }
                }}
                title={UI_TEXT.staff.confirmDeleteTitle}
                message={`${UI_TEXT.staff.confirmDeleteMessage} (${selectedStaff?.fullName})`}
                confirmText={UI_TEXT.staff.confirmDeleteBtn}
                cancelText={UI_TEXT.staff.confirmCancelBtn}
                variant="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
