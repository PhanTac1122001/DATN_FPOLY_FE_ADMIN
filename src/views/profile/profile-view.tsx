"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, KeyRound, Loader2, Save, ShieldCheck, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Avatar } from "@/components/base/avatar/avatar";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-keys";
import { type ChangePasswordFormData, type UpdateProfileFormData, changePasswordSchema, updateProfileSchema } from "@/schemas/auth.schema";
import { changePassword, updateProfile, uploadAvatar } from "@/services/auth.service";
import { toast } from "@/services/toast.service";

export function ProfileView() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { user, isLoading: isUserLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<"info" | "password">("info");

    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Password visibility state
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Profile Info Form
    const {
        handleSubmit: handleUpdateProfileSubmit,
        control: infoControl,
        reset: resetInfo,
        clearErrors: clearInfoErrors,
        formState: { errors: infoErrors },
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            address: "",
            gender: "MALE",
        },
    });

    // Change Password Form
    const {
        handleSubmit: handleChangePasswordSubmit,
        control: passwordControl,
        reset: resetPasswordForm,
        clearErrors: clearPasswordErrors,
        formState: { errors: passwordErrors },
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "password") {
            setActiveTab("password");
        }
    }, [searchParams]);

    // Populate user details when user data is fetched
    useEffect(() => {
        if (user) {
            resetInfo({
                fullName: user.fullName || "",
                phone: user.phone || user.phoneNumber || "",
                address: user.address || "",
                gender: (user.gender as "MALE" | "FEMALE" | "OTHER") || "MALE",
            });
        }
    }, [user, resetInfo]);

    // Handle avatar file selection & upload
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith("image/")) {
            toast.error(UI_TEXT.profile.toastSelectFileErrorTitle, UI_TEXT.profile.toastSelectFileErrorMsg);
            return;
        }

        try {
            setIsUploadingAvatar(true);
            await uploadAvatar(file);
            await queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.profile.toastAvatarSuccess);
        } catch (error) {
            const message = error instanceof Error ? error.message : UI_TEXT.profile.toastAvatarErrorDefault;
            toast.error(UI_TEXT.profile.toastAvatarErrorTitle, message);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Handle Profile Info Submit
    const onUpdateProfile = async (data: UpdateProfileFormData) => {
        try {
            setIsSavingInfo(true);
            await updateProfile({
                fullName: data.fullName.trim(),
                phone: data.phone?.trim(),
                address: data.address?.trim(),
                gender: data.gender,
            });
            await queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.profile.toastInfoSuccess);
        } catch (error) {
            const message = error instanceof Error ? error.message : UI_TEXT.profile.toastUpdateErrorDefault;
            toast.error(UI_TEXT.profile.toastUpdateErrorTitle, message);
        } finally {
            setIsSavingInfo(false);
        }
    };

    // Handle Password Change Submit
    const onChangePassword = async (data: ChangePasswordFormData) => {
        try {
            setIsChangingPassword(true);
            await changePassword({
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data.confirmPassword,
            });
            resetPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.profile.toastPasswordSuccess);
        } catch (error) {
            const message = error instanceof Error ? error.message : UI_TEXT.profile.toastPasswordErrorDefault;
            toast.error(UI_TEXT.profile.toastPasswordErrorTitle, message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    const getInitials = (name?: string) => {
        if (!name) return "A";
        const cleanName = name.replace(/\s*\(.*?\)\s*/g, "").trim();
        const parts = cleanName.split(/\s+/).filter(Boolean);
        if (parts.length === 0) return "A";
        const lastWord = parts[parts.length - 1];
        return lastWord[0].toUpperCase();
    };

    if (isUserLoading) {
        return (
            <AdminLayout title={UI_TEXT.profile.pageTitle} subtitle={UI_TEXT.profile.pageSubtitle}>
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-wine" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title={UI_TEXT.profile.pageTitle} subtitle={UI_TEXT.profile.pageSubtitle}>
            <div className="mx-auto max-w-5xl space-y-6 pb-12">
                {/* Header Card / Banner */}
                <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="absolute top-0 right-0 h-32 w-64 translate-x-12 -translate-y-8 rounded-full bg-gradient-to-bl from-wine/10 to-transparent blur-2xl" />

                    <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                        {/* Avatar Picker */}
                        <div className="group relative shrink-0">
                            <Avatar
                                size="xl"
                                src={user?.avatarUrl || undefined}
                                initials={getInitials(user?.fullName)}
                                alt={user?.fullName}
                                className="size-28 border-4 border-white bg-gradient-to-br from-wine-bright to-wine text-2xl font-extrabold text-white shadow-md"
                            />
                            <label
                                htmlFor="avatar-upload"
                                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition group-hover:opacity-100"
                                title={UI_TEXT.profile.changeAvatarTooltip}
                            >
                                {isUploadingAvatar ? <Loader2 className="size-6 animate-spin" /> : <Camera className="size-6" />}
                            </label>
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={isUploadingAvatar}
                            />
                        </div>

                        {/* Summary Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                                <h2 className="text-2xl font-extrabold text-slate-900">{user?.fullName}</h2>
                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 className="size-3.5" /> {UI_TEXT.profile.statusActive}
                                </span>
                            </div>

                            <p className="mt-1 text-sm font-medium text-slate-500">{user?.email}</p>

                            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                {user?.roles?.map((r) => (
                                    <span key={r} className="rounded-lg bg-wine/10 px-2.5 py-1 text-xs font-bold text-wine-deep uppercase">
                                        {r}
                                    </span>
                                ))}
                                {user?.staffCode && (
                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        {UI_TEXT.profile.staffCodePrefix}
                                        {user.staffCode}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs & Content */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab("info")}
                            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                                activeTab === "info"
                                    ? "border-wine text-wine-deep"
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                        >
                            <User className="size-4.5" />
                            <span>{UI_TEXT.layout.profileInfo}</span>
                        </button>

                        <button
                            onClick={() => setActiveTab("password")}
                            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-bold transition ${
                                activeTab === "password"
                                    ? "border-wine text-wine-deep"
                                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
                            }`}
                        >
                            <KeyRound className="size-4.5" />
                            <span>{UI_TEXT.layout.changePassword}</span>
                        </button>
                    </div>

                    {/* Tab 1: Personal Information */}
                    {activeTab === "info" && (
                        <form onSubmit={handleUpdateProfileSubmit(onUpdateProfile)} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Controller
                                    name="fullName"
                                    control={infoControl}
                                    render={({ field }) => (
                                        <Input
                                            label={
                                                <span>
                                                    {UI_TEXT.profile.labelFullName.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                                </span>
                                            }
                                            placeholder={UI_TEXT.profile.placeholderFullName}
                                            hint={infoErrors.fullName?.message}
                                            isInvalid={!!infoErrors.fullName}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearInfoErrors("fullName");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="phone"
                                    control={infoControl}
                                    render={({ field }) => (
                                        <Input
                                            label={UI_TEXT.profile.labelPhone}
                                            placeholder={UI_TEXT.profile.placeholderPhone}
                                            hint={infoErrors.phone?.message}
                                            isInvalid={!!infoErrors.phone}
                                            value={field.value || ""}
                                            onChange={(val) => {
                                                field.onChange(val);
                                                clearInfoErrors("phone");
                                            }}
                                            onBlur={field.onBlur}
                                            ref={field.ref}
                                        />
                                    )}
                                />

                                <Controller
                                    name="gender"
                                    control={infoControl}
                                    render={({ field }) => (
                                        <Select
                                            label={UI_TEXT.profile.labelGender}
                                            placeholder={UI_TEXT.profile.labelGender}
                                            selectedKey={field.value || "MALE"}
                                            onSelectionChange={(key) => {
                                                field.onChange(key as string);
                                                clearInfoErrors("gender");
                                            }}
                                            hint={infoErrors.gender?.message}
                                            isInvalid={!!infoErrors.gender}
                                        >
                                            <SelectItem id="MALE">{UI_TEXT.staff.genderMale}</SelectItem>
                                            <SelectItem id="FEMALE">{UI_TEXT.staff.genderFemale}</SelectItem>
                                            <SelectItem id="OTHER">{UI_TEXT.staff.genderOther}</SelectItem>
                                        </Select>
                                    )}
                                />

                                <div>
                                    <Input label={UI_TEXT.profile.labelEmailFixed} type="email" value={user?.email || ""} isDisabled />
                                </div>

                                <div className="sm:col-span-2">
                                    <Controller
                                        name="address"
                                        control={infoControl}
                                        render={({ field }) => (
                                            <Input
                                                label={UI_TEXT.profile.labelAddress}
                                                placeholder={UI_TEXT.profile.placeholderAddress}
                                                hint={infoErrors.address?.message}
                                                isInvalid={!!infoErrors.address}
                                                value={field.value || ""}
                                                onChange={(val) => {
                                                    field.onChange(val);
                                                    clearInfoErrors("address");
                                                }}
                                                onBlur={field.onBlur}
                                                ref={field.ref}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSavingInfo}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-wine-bright to-wine px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSavingInfo ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    <span>{UI_TEXT.profile.btnSave}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Change Password */}
                    {activeTab === "password" && (
                        <form onSubmit={handleChangePasswordSubmit(onChangePassword)} className="mt-6 max-w-xl space-y-6">
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900">
                                <ShieldCheck className="size-5 shrink-0 text-amber-600" />
                                <span>{UI_TEXT.profile.passwordHint}</span>
                            </div>

                            <Controller
                                name="currentPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        label={
                                            <span>
                                                {UI_TEXT.profile.labelCurrentPassword.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                            </span>
                                        }
                                        placeholder={UI_TEXT.profile.placeholderCurrentPassword}
                                        showPassword={showCurrentPassword}
                                        onTogglePassword={() => setShowCurrentPassword((prev) => !prev)}
                                        hint={passwordErrors.currentPassword?.message}
                                        isInvalid={!!passwordErrors.currentPassword}
                                        value={field.value || ""}
                                        onChange={(val) => {
                                            field.onChange(val);
                                            clearPasswordErrors("currentPassword");
                                        }}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                    />
                                )}
                            />

                            <Controller
                                name="newPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        label={
                                            <span>
                                                {UI_TEXT.profile.labelNewPassword.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                            </span>
                                        }
                                        placeholder={UI_TEXT.profile.placeholderNewPassword}
                                        showPassword={showNewPassword}
                                        onTogglePassword={() => setShowNewPassword((prev) => !prev)}
                                        hint={passwordErrors.newPassword?.message}
                                        isInvalid={!!passwordErrors.newPassword}
                                        value={field.value || ""}
                                        onChange={(val) => {
                                            field.onChange(val);
                                            clearPasswordErrors("newPassword");
                                        }}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                    />
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={passwordControl}
                                render={({ field }) => (
                                    <Input
                                        type="password"
                                        label={
                                            <span>
                                                {UI_TEXT.profile.labelConfirmPassword.replace(" *", "")} <span className="font-bold text-red-500">{"*"}</span>
                                            </span>
                                        }
                                        placeholder={UI_TEXT.profile.placeholderConfirmPassword}
                                        showPassword={showConfirmPassword}
                                        onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
                                        hint={passwordErrors.confirmPassword?.message}
                                        isInvalid={!!passwordErrors.confirmPassword}
                                        value={field.value || ""}
                                        onChange={(val) => {
                                            field.onChange(val);
                                            clearPasswordErrors("confirmPassword");
                                        }}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                    />
                                )}
                            />

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-wine-bright to-wine px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isChangingPassword ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                                    <span>{UI_TEXT.profile.btnUpdatePassword}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
