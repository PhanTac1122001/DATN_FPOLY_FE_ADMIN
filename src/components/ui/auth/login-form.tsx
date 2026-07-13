"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import Cookies from "js-cookie";
import { MOCK_LOGIN_DELAY_MS, RIKKEI_LOGO_LOGIN_WIDTH, RIKKEI_LOGO_PATH } from "@/constants/auth.constants";
import { APP_CONFIG, ROUTES } from "@/constants/app.constants";
import { LMS_ICONS } from "@/constants/lms-icons.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { AUTH_LOGIN_MOCK } from "@/mocks/auth.mock";
import { type LoginFormData, loginSchema } from "@/schemas/auth.schema";
import { cx } from "@/utils/cx";

const inputClassName = cx(
    "w-full rounded-[13px] border-[1.5px] border-slate-200 bg-cream px-[15px] py-3 font-sans text-sm text-slate-900 outline-none",
    "focus:border-brand-500",
);

export function LoginForm() {
    const router = useAppRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { ...AUTH_LOGIN_MOCK },
    });

    const onSubmit = async (_data: LoginFormData) => {
        setIsLoading(true);

        // UI-phase mock — EP doLogin() only sets entered:true (no API)
        await new Promise((resolve) => setTimeout(resolve, MOCK_LOGIN_DELAY_MS));
        
        // Set mock access token cookie so we are "logged in"
        Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, "mock_admin_token", { expires: 1 });

        setIsLoading(false);
        router.replace(ROUTES.HOME as Route);
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="relative w-full max-w-[410px] rounded-[26px] bg-white px-8 py-[34px] text-slate-900 shadow-[0_34px_74px_-22px_rgba(0,0,0,0.55)]"
        >
            <div className="mb-[22px] text-center">
                <Image
                    src={RIKKEI_LOGO_PATH}
                    alt={UI_TEXT.auth.login.logoAlt}
                    width={RIKKEI_LOGO_LOGIN_WIDTH}
                    height={64}
                    className="mx-auto mb-3.5 block h-auto w-full max-w-[188px]"
                    priority
                />
                <h1 className="font-display text-[22px] font-extrabold tracking-[-0.01em] text-slate-900">
                    {UI_TEXT.auth.login.title}
                </h1>
                <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-[13px] text-slate-500">
                    {UI_TEXT.auth.login.welcomeBack}
                    <Image src={LMS_ICONS.WAVE} alt="" width={16} height={16} className="size-4" />
                </p>
            </div>

            <label className="mb-1.5 block text-xs font-bold text-slate-500">{UI_TEXT.auth.login.emailLabel}</label>
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="email"
                        autoComplete="email"
                        className={cx(inputClassName, "mb-3.5", errors.email && "border-error-500")}
                    />
                )}
            />
            {errors.email?.message ? <p className="-mt-2 mb-3 text-xs text-error-500">{errors.email.message}</p> : null}

            <label className="mb-1.5 block text-xs font-bold text-slate-500">{UI_TEXT.auth.login.passwordLabel}</label>
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="password"
                        autoComplete="current-password"
                        className={cx(inputClassName, errors.password && "border-error-500")}
                    />
                )}
            />
            {errors.password?.message ? <p className="mt-1 text-xs text-error-500">{errors.password.message}</p> : null}

            <div className="mt-2.5 mb-1 text-right">
                <Link href={ROUTES.FORGOT_PASSWORD} className="text-xs font-bold text-brand-500 hover:text-brand-600">
                    {UI_TEXT.auth.login.forgotPassword}
                </Link>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-[14px] bg-linear-to-br from-brand-400 to-brand-500 p-3.5 text-left text-[15px] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(60,66,150,0.6)] transition hover:brightness-110 disabled:opacity-70"
            >
                {isLoading ? UI_TEXT.auth.login.submittingButton : UI_TEXT.auth.login.submitButton}
            </button>
        </form>
    );
}
