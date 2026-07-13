"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { Alert } from "@/components/base/alert/alert";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Lock, Mail } from "@/components/icons";
import { toastStub } from "@/config/toast.config";
import { ICON_COLORS, ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { HttpError } from "@/lib/http-client";
import { type RegisterFormData, registerSchema } from "@/schemas/auth.schema";
import { register } from "@/services/auth.service";

export function RegisterForm() {
    const router = useAppRouter();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: "",
            email: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setError("");
        setIsLoading(true);

        try {
            await register(data);
            toastStub.success(UI_TEXT.auth.register.successMessage);
            router.replace(ROUTES.LOGIN as Route);
        } catch (err) {
            if (err instanceof HttpError) {
                const payload = err.payload as { message?: string } | undefined;
                setError(payload?.message || UI_TEXT.common.genericError);
            } else {
                setError(UI_TEXT.common.genericError);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-8">
            <div className="flex flex-col gap-2 text-center">
                <h1 className="font-display text-[32px] leading-[40px] font-bold text-slate-950">{UI_TEXT.auth.register.title}</h1>
                <p className="font-sans text-sm text-slate-800">{UI_TEXT.auth.register.subtitle}</p>
            </div>

            <div className="flex flex-col gap-4">
                <Controller name="fullName" control={control} render={({ field }) => (
                    <Input {...field} isRequired isInvalid={!!errors.fullName} hint={errors.fullName?.message} label={UI_TEXT.auth.register.fullNameLabel} placeholder={UI_TEXT.auth.register.fullNamePlaceholder} size="md" />
                )} />
                <Controller name="email" control={control} render={({ field }) => (
                    <Input {...field} isRequired isInvalid={!!errors.email} hint={errors.email?.message} label={UI_TEXT.auth.register.emailLabel} type="email" placeholder={UI_TEXT.auth.register.emailPlaceholder} icon={Mail} iconColor={ICON_COLORS.GRAY_400} size="md" />
                )} />
                <Controller name="phoneNumber" control={control} render={({ field }) => (
                    <Input {...field} isRequired isInvalid={!!errors.phoneNumber} hint={errors.phoneNumber?.message} label={UI_TEXT.auth.register.phoneLabel} placeholder={UI_TEXT.auth.register.phonePlaceholder} size="md" />
                )} />
                <Controller name="password" control={control} render={({ field }) => (
                    <Input {...field} isRequired isInvalid={!!errors.password} hint={errors.password?.message} label={UI_TEXT.auth.register.passwordLabel} type="password" placeholder={UI_TEXT.auth.register.passwordPlaceholder} icon={Lock} iconColor={ICON_COLORS.GRAY_400} size="md" showPassword={showPassword} onTogglePassword={() => setShowPassword((p) => !p)} />
                )} />
                <Controller name="confirmPassword" control={control} render={({ field }) => (
                    <Input {...field} isRequired isInvalid={!!errors.confirmPassword} hint={errors.confirmPassword?.message} label={UI_TEXT.auth.register.confirmPasswordLabel} type="password" placeholder={UI_TEXT.auth.register.confirmPasswordPlaceholder} icon={Lock} iconColor={ICON_COLORS.GRAY_400} size="md" showPassword={showConfirmPassword} onTogglePassword={() => setShowConfirmPassword((p) => !p)} />
                )} />
                {error ? <Alert variant="error" message={error} /> : null}
            </div>

            <Button type="submit" size="lg" isLoading={isLoading} isDisabled={isLoading}>
                {UI_TEXT.auth.register.submitButton}
            </Button>

            <p className="text-center text-sm text-slate-600">
                {UI_TEXT.auth.register.hasAccount}{" "}
                <Link href={ROUTES.LOGIN} className="font-semibold text-brand-500 hover:text-brand-600">
                    {UI_TEXT.auth.register.loginLink}
                </Link>
            </p>
        </form>
    );
}
