"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Save, ShieldCheck, User } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Avatar } from "@/components/base/avatar/avatar";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { MIN_PASSWORD_LENGTH } from "@/constants/auth.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAuth } from "@/hooks/use-auth";
import { queryKeys } from "@/lib/query-keys";
import { changePassword, updateProfile, uploadAvatar } from "@/services/auth.service";
import { toast } from "@/services/toast.service";

export function ProfileView() {
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { user, isLoading: isUserLoading } = useAuth();

    const [activeTab, setActiveTab] = useState<"info" | "password">("info");

    // Profile info form state
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [gender, setGender] = useState<string>("MALE");
    const [isSavingInfo, setIsSavingInfo] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Change password form state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    useEffect(() => {
        const tabParam = searchParams.get("tab");
        if (tabParam === "password") {
            setActiveTab("password");
        }
    }, [searchParams]);

    // Populate user details when user data is fetched
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || "");
            setPhone(user.phone || user.phoneNumber || "");
            setAddress(user.address || "");
            setGender((user.gender as string) || "MALE");
        }
    }, [user]);

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
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) {
            toast.error(UI_TEXT.profile.toastNoticeTitle, UI_TEXT.profile.toastFullNameRequired);
            return;
        }

        try {
            setIsSavingInfo(true);
            await updateProfile({
                fullName: fullName.trim(),
                phone: phone.trim(),
                address: address.trim(),
                gender: gender,
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
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword) {
            toast.error(UI_TEXT.profile.toastNoticeTitle, UI_TEXT.profile.changePassword.errors.currentPasswordRequired);
            return;
        }
        if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
            toast.error(UI_TEXT.profile.toastNoticeTitle, UI_TEXT.common.password.errors.minLength);
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error(UI_TEXT.profile.toastNoticeTitle, UI_TEXT.common.password.errors.mismatch);
            return;
        }

        try {
            setIsChangingPassword(true);
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
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
                        <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                        {UI_TEXT.profile.labelFullName}
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderFullName}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">{UI_TEXT.profile.labelPhone}</label>
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderPhone}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                        {UI_TEXT.profile.labelGender}
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                    >
                                        <option value="MALE">{UI_TEXT.staff.genderMale}</option>
                                        <option value="FEMALE">{UI_TEXT.staff.genderFemale}</option>
                                        <option value="OTHER">{UI_TEXT.staff.genderOther}</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                        {UI_TEXT.profile.labelEmailFixed}
                                    </label>
                                    <input
                                        type="email"
                                        value={user?.email || ""}
                                        disabled
                                        className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                        {UI_TEXT.profile.labelAddress}
                                    </label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderAddress}
                                        className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isSavingInfo}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-wine-bright to-wine px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                                >
                                    {isSavingInfo ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    <span>{UI_TEXT.profile.btnSave}</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Tab 2: Change Password */}
                    {activeTab === "password" && (
                        <form onSubmit={handleChangePassword} className="mt-6 max-w-xl space-y-6">
                            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium text-amber-900">
                                <ShieldCheck className="size-5 shrink-0 text-amber-600" />
                                <span>{UI_TEXT.profile.passwordHint}</span>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    {UI_TEXT.profile.labelCurrentPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderCurrentPassword}
                                        className="w-full rounded-xl border border-slate-300 py-2.5 pr-10 pl-4 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    {UI_TEXT.profile.labelNewPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderNewPassword}
                                        className="w-full rounded-xl border border-slate-300 py-2.5 pr-10 pl-4 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-bold tracking-wider text-slate-700 uppercase">
                                    {UI_TEXT.profile.labelConfirmPassword}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={UI_TEXT.profile.placeholderConfirmPassword}
                                        className="w-full rounded-xl border border-slate-300 py-2.5 pr-10 pl-4 text-sm font-medium text-slate-900 transition focus:border-wine focus:ring-2 focus:ring-wine/20 focus:outline-none"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={isChangingPassword}
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-wine-bright to-wine px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
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
