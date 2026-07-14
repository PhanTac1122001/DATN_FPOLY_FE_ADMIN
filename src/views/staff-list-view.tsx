"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BookOpen, Edit, Lock, Mail, MapPin, Phone, Plus, Search, ShieldAlert, Trash2, Unlock, UserCheck, Users } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { StaffModal } from "@/components/application/modals/staff-modal";
import { Badge } from "@/components/base/badges/badges";
import { Button } from "@/components/base/buttons/button";
import { Tooltip, TooltipTrigger } from "@/components/base/tooltip/tooltip";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteStaff, getStaffList, getSystemsList, updateStaff } from "@/services/staff.service";
import { toast } from "@/services/toast.service";
import { GenderEnum, RoleEnum, type Staff, StatusEnum, type UpdateStaffRequest } from "@/types/staff.types";
import { cx } from "@/utils/cx";

const filterAll = "ALL";

export function StaffListView() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>(filterAll);
    const [statusFilter, setStatusFilter] = useState<string>(filterAll);

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

        const matchesRole = roleFilter === filterAll || staff.roles.some((r) => r.name === roleFilter);

        const matchesStatus = statusFilter === filterAll || staff.status === statusFilter;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // KPI Metrics calculation
    const totalStaff = staffs.length;
    const activeStaff = staffs.filter((s) => s.status === StatusEnum.ACTIVE).length;
    const teachersCount = staffs.filter((s) => s.roles.some((r) => r.name === RoleEnum.TEACHER || r.name === RoleEnum.TEACHER_ASSISTANT)).length;
    const adminsCount = staffs.filter((s) => s.roles.some((r) => r.name === RoleEnum.ADMIN)).length;

    return (
        <div className="flex w-full flex-col gap-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Card 1: Total Staff */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-wine-soft text-wine-deep">
                        <Users className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.kpiTotal}</p>
                        <p className="font-display text-2xl font-black text-slate-900">{totalStaff}</p>
                    </div>
                </div>

                {/* Card 2: Teachers/TAs */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <BookOpen className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.kpiTeachers}</p>
                        <p className="font-display text-2xl font-black text-slate-900">{teachersCount}</p>
                    </div>
                </div>

                {/* Card 3: Active Staff */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <UserCheck className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.kpiActive}</p>
                        <p className="font-display text-2xl font-black text-slate-900">{activeStaff}</p>
                    </div>
                </div>

                {/* Card 4: Admins */}
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <ShieldAlert className="size-6" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.kpiAdmins}</p>
                        <p className="font-display text-2xl font-black text-slate-900">{adminsCount}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar & Table Area */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs">
                {/* Filters */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        {/* Search Input */}
                        <div className="relative w-full max-w-xs">
                            <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                                <Search className="size-4" />
                            </span>
                            <input
                                type="text"
                                placeholder={UI_TEXT.staff.searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-full border border-slate-200 bg-slate-50/50 py-2 pr-4 pl-9 text-sm text-slate-900 placeholder-slate-400 transition outline-none focus:border-wine focus:bg-white focus:ring-1 focus:ring-wine"
                            />
                        </div>

                        {/* Role Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition outline-none focus:border-wine"
                            >
                                <option value={filterAll}>{UI_TEXT.staff.roleFilterAll}</option>
                                <option value={RoleEnum.ADMIN}>{UI_TEXT.staff.roleAdmin}</option>
                                <option value={RoleEnum.MANAGER}>{UI_TEXT.staff.roleManager}</option>
                                <option value={RoleEnum.TEACHER}>{UI_TEXT.staff.roleTeacher}</option>
                                <option value={RoleEnum.TEACHER_ASSISTANT}>{UI_TEXT.staff.roleTeacherAssistant}</option>
                                <option value={RoleEnum.ASSISTANT}>{UI_TEXT.staff.roleAssistant}</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition outline-none focus:border-wine"
                            >
                                <option value={filterAll}>{UI_TEXT.staff.statusFilterAll}</option>
                                <option value={StatusEnum.ACTIVE}>{UI_TEXT.staff.statusActive}</option>
                                <option value={StatusEnum.DISABLE}>{UI_TEXT.staff.statusDisable}</option>
                            </select>
                        </div>
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
                        iconLeading={Plus}
                    >
                        {UI_TEXT.staff.addStaff}
                    </Button>
                </div>

                {/* Table list */}
                <div className="overflow-x-auto">
                    {isLoadingStaffs ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{UI_TEXT.staff.loading}</p>
                        </div>
                    ) : filteredStaffs.length === 0 ? (
                        <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{UI_TEXT.staff.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{UI_TEXT.staff.noDataDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1200px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                                    <th className="w-12 px-6 py-4 text-center">{UI_TEXT.staff.thStt}</th>
                                    <th className="px-6 py-4">{UI_TEXT.staff.thName}</th>
                                    <th className="px-6 py-4">{UI_TEXT.staff.thContact}</th>
                                    <th className="w-24 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.staff.thGender}</th>
                                    <th className="w-24 px-6 py-4">{UI_TEXT.staff.thAddress}</th>
                                    <th className="w-24 px-6 py-4 text-center">{UI_TEXT.staff.thRole}</th>
                                    <th className="px-6 py-4 whitespace-nowrap">{UI_TEXT.staff.thSystem}</th>
                                    <th className="w-28 px-6 py-4 text-center">{UI_TEXT.staff.thStatus}</th>
                                    <th className="w-28 px-6 py-4 text-center">{UI_TEXT.staff.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaffs.map((staff, index) => (
                                    <tr key={staff.id} className="border-b border-slate-50 transition duration-150 hover:bg-slate-50/40">
                                        <td className="px-6 py-4 text-center font-semibold text-slate-400">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-[14.5px] font-bold text-slate-900">{staff.fullName}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-600">
                                                <Phone className="size-3.5 text-slate-400" />
                                                <span>{staff.phone || UI_TEXT.common.noData}</span>
                                            </div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-slate-500">
                                                <Mail className="size-3.5 shrink-0 text-slate-400" />
                                                <span className="max-w-[130px] truncate xl:max-w-[150px] 2xl:max-w-[180px]" title={staff.email}>
                                                    {staff.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-semibold whitespace-nowrap text-slate-500">
                                            {staff.gender === GenderEnum.MALE
                                                ? UI_TEXT.staff.genderMale
                                                : staff.gender === GenderEnum.FEMALE
                                                  ? UI_TEXT.staff.genderFemale
                                                  : UI_TEXT.staff.genderOther}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-[13px] text-slate-600">
                                                <MapPin className="size-3.5 shrink-0 text-slate-400" />
                                                <span className="max-w-[70px] truncate xl:max-w-[100px] 2xl:max-w-[130px]">
                                                    {staff.address || UI_TEXT.common.noData}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="mx-auto flex max-w-[90px] flex-wrap justify-center gap-1 xl:max-w-[110px] 2xl:max-w-[130px]">
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
                                        </td>
                                        <td className="px-6 py-4">
                                            {staff.systemIds && staff.systemIds.length > 0 ? (
                                                <Tooltip
                                                    placement="top"
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
                                                    <TooltipTrigger>
                                                        <div className="max-w-[180px] cursor-pointer truncate text-[13px] font-semibold text-slate-600">
                                                            {getSystemCodes(staff.systemIds)}
                                                        </div>
                                                    </TooltipTrigger>
                                                </Tooltip>
                                            ) : (
                                                <div className="text-[13px] font-semibold text-slate-600">{UI_TEXT.staff.systemNone}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge color={staff.status === StatusEnum.ACTIVE ? "success" : "gray"} size="sm">
                                                {staff.status === StatusEnum.ACTIVE ? UI_TEXT.staff.statusActiveLabel : UI_TEXT.staff.statusDisableLabel}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {/* Edit Button */}
                                                <button
                                                    onClick={() => handleOpenEdit(staff)}
                                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-wine-soft/30 hover:text-wine"
                                                    title={UI_TEXT.staff.editTooltip}
                                                >
                                                    <Edit className="size-4" />
                                                </button>

                                                {/* Lock/Unlock Toggle */}
                                                <button
                                                    onClick={() => handleToggleStatus(staff)}
                                                    className={cx(
                                                        "rounded-lg p-1.5 transition",
                                                        staff.status === StatusEnum.ACTIVE
                                                            ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                                                            : "text-amber-600 hover:bg-emerald-50 hover:text-emerald-600",
                                                    )}
                                                    title={staff.status === StatusEnum.ACTIVE ? UI_TEXT.staff.lockTooltip : UI_TEXT.staff.unlockTooltip}
                                                >
                                                    {staff.status === StatusEnum.ACTIVE ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleOpenDelete(staff)}
                                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                                                    title={UI_TEXT.staff.deleteTooltip}
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
