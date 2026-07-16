"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import { Controller, useForm } from "react-hook-form";
import { Eye, EyeSlash } from "@/components/icons";
import { APP_CONFIG, ROUTES } from "@/constants/app.constants";
import { RIKKEI_LOGO_LOGIN_WIDTH, RIKKEI_LOGO_PATH } from "@/constants/auth.constants";
import { HTTP_STATUS_FORBIDDEN, HTTP_STATUS_TOO_MANY_REQUESTS } from "@/constants/http.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { HttpError } from "@/lib/http-client";
import { type LoginFormData, loginSchema } from "@/schemas/auth.schema";
import { login } from "@/services/auth.service";
import { toast } from "@/services/toast.service";
import { cx } from "@/utils/cx";

const inputClassName = cx(
    "w-full rounded-[13px] border-[1.5px] border-slate-200 bg-cream px-[15px] py-3 font-sans text-sm text-slate-900 outline-none",
    "focus:border-brand-500",
);

export function LoginForm() {
    const router = useAppRouter();
    const queryClient = useQueryClient();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState<string>("");
    const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [shouldResetCaptcha, setShouldResetCaptcha] = useState(false);

    useEffect(() => {
        if (shouldResetCaptcha) {
            recaptchaRef.current?.reset();
            setRecaptchaToken("");
            setShouldResetCaptcha(false);
        }
    }, [shouldResetCaptcha]);

    useEffect(() => {
        const sessionExpired = Cookies.get("session_expired");
        if (sessionExpired) {
            toast.error(UI_TEXT.auth.login.toasts.sessionExpired);
            Cookies.remove("session_expired", { path: "/" });
        }
    }, []);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: "onTouched",
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        if (recaptchaSiteKey && !recaptchaToken) {
            toast.error(UI_TEXT.auth.login.toasts.captchaRequiredTitle, UI_TEXT.auth.login.toasts.captchaRequiredDesc);
            return;
        }
        setIsLoading(true);
        try {
            const response = await login({
                email: data.email,
                password: data.password,
                recaptchaToken,
                clientId: "lms",
            });

            // Check if response contains direct login tokens (Local/Dev environment)
            if (response && response.accessToken && response.refreshToken) {
                Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, response.accessToken, { expires: 1 });
                Cookies.set(APP_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken, { expires: 7 });

                queryClient.removeQueries({ queryKey: ["profile"] });
                queryClient.clear();

                toast.success(UI_TEXT.auth.login.toasts.successTitle, UI_TEXT.auth.login.toasts.successDescription);
                router.replace(ROUTES.HOME as Route);
            } else {
                // Store email for OTP step (Production environment)
                sessionStorage.setItem("login_email", data.email);

                toast.success(UI_TEXT.auth.login.toasts.otpSentTitle, UI_TEXT.auth.login.toasts.otpSentDesc);
                router.replace("/login/otp" as Route);
            }
        } catch (error: unknown) {
            console.error("Login failed:", error);
            let msg = error instanceof Error ? error.message : UI_TEXT.auth.login.errors.loginFailed;
            if (error instanceof HttpError) {
                if (error.status === HTTP_STATUS_TOO_MANY_REQUESTS) {
                    msg = UI_TEXT.auth.login.errors.tooManyRequests;
                } else if (error.status === HTTP_STATUS_FORBIDDEN && (error.message.includes("Captcha") || error.message.includes("captcha"))) {
                    msg = UI_TEXT.auth.login.errors.captchaFailed;
                }
            }
            toast.error(UI_TEXT.auth.login.toasts.errorTitle, msg);

            // Trigger recaptcha reset on login failure
            setShouldResetCaptcha(true);
        } finally {
            setIsLoading(false);
        }
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
                <h1 className="font-display text-[22px] font-extrabold tracking-[-0.01em] text-slate-900">{UI_TEXT.auth.login.title}</h1>
                <p className="mt-0.5 inline-flex items-center justify-center gap-1 text-[13px] text-slate-500">{UI_TEXT.auth.login.welcomeBack}</p>
            </div>

            <label className="mb-1.5 block text-xs font-bold text-slate-500">
                {UI_TEXT.auth.login.emailLabel} <span className="text-error-500">{"*"}</span>
            </label>
            <Controller
                name="email"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="email"
                        placeholder={UI_TEXT.auth.login.emailPlaceholder}
                        autoComplete="email"
                        className={cx(inputClassName, "mb-3.5", errors.email && "border-error-500")}
                    />
                )}
            />
            {errors.email?.message ? <p className="-mt-2 mb-3 text-xs text-error-500">{errors.email.message}</p> : null}

            <label className="mb-1.5 block text-xs font-bold text-slate-500">
                {UI_TEXT.auth.login.passwordLabel} <span className="text-error-500">{"*"}</span>
            </label>
            <Controller
                name="password"
                control={control}
                render={({ field }) => (
                    <div className="relative w-full">
                        <input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder={UI_TEXT.auth.login.passwordPlaceholder}
                            autoComplete="current-password"
                            className={cx(inputClassName, "pr-10", errors.password && "border-error-500")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                            aria-label={showPassword ? UI_TEXT.auth.login.hidePassword : UI_TEXT.auth.login.showPassword}
                        >
                            {showPassword ? <EyeSlash size={16} className="size-4" /> : <Eye size={16} className="size-4" />}
                        </button>
                    </div>
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
                className="mt-2 w-full rounded-[14px] bg-linear-to-br from-brand-400 to-brand-500 p-3.5 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(60,66,150,0.6)] transition hover:brightness-110 disabled:opacity-70"
            >
                {isLoading ? UI_TEXT.auth.login.submittingButton : UI_TEXT.auth.login.submitButton}
            </button>

            {recaptchaSiteKey ? (
                <div className="mt-4 flex justify-center">
                    <ReCAPTCHA ref={recaptchaRef} sitekey={recaptchaSiteKey} onChange={(token) => setRecaptchaToken(token || "")} />
                </div>
            ) : null}
        </form>
    );
}
