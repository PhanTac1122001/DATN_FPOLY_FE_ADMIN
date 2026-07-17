"use client";

import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { APP_CONFIG, ROUTES } from "@/constants/app.constants";
import { OTP_LENGTH, RIKKEI_LOGO_LOGIN_WIDTH, RIKKEI_LOGO_PATH } from "@/constants/auth.constants";
import { HTTP_STATUS_FORBIDDEN } from "@/constants/http.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { HttpError } from "@/lib/http-client";
import { renewOtp, verifyOtp } from "@/services/auth.service";
import { toast } from "@/services/toast.service";
import type { OtpFormProps } from "@/types/auth.types";
import { formatOtpCountdown } from "@/utils/date.utils";

const oneSecondMs = 1000;
const tenMinutesSeconds = 600;

export function OtpForm({ email }: OtpFormProps) {
    const router = useAppRouter();
    const queryClient = useQueryClient();

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(tenMinutesSeconds);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown Timer for Resend OTP
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(countdown - 1), oneSecondMs);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        const value = element.value.replace(/[^0-9]/g, "");
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Focus next input
        if (value !== "" && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && otp[index] === "" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData
            .getData("text")
            .replace(/[^0-9]/g, "")
            .slice(0, OTP_LENGTH);
        if (pastedData.length === OTP_LENGTH) {
            const newOtp = pastedData.split("");
            setOtp(newOtp);
            inputRefs.current[OTP_LENGTH - 1]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (countdown <= 0) {
            toast.error(UI_TEXT.auth.otp.toasts.expiredTitle, UI_TEXT.auth.otp.toasts.expiredDesc);
            return;
        }
        const otpCode = otp.join("");
        if (otpCode.length !== OTP_LENGTH) {
            toast.error(UI_TEXT.auth.otp.toasts.invalidOtpTitle, UI_TEXT.auth.otp.toasts.invalidOtpDesc);
            return;
        }

        setIsLoading(true);
        try {
            const response = await verifyOtp({
                email,
                otp: otpCode,
            });

            // Save cookies
            Cookies.set(APP_CONFIG.ACCESS_TOKEN_KEY, response.accessToken, { expires: 1 });
            Cookies.set(APP_CONFIG.REFRESH_TOKEN_KEY, response.refreshToken, { expires: 7 });

            queryClient.removeQueries({ queryKey: ["profile"] });
            queryClient.clear();

            toast.success(UI_TEXT.auth.otp.toasts.successTitle, UI_TEXT.auth.otp.toasts.successDesc);

            // Clear temporary email from sessionStorage
            sessionStorage.removeItem("login_email");

            router.replace(ROUTES.HOME as Route);
        } catch (error: unknown) {
            console.error("OTP verification failed:", error);
            const msg = error instanceof Error ? error.message : UI_TEXT.auth.otp.toasts.errorTitle;
            toast.error(UI_TEXT.auth.otp.toasts.errorTitle, msg);

            // Redirect back to login if user has exceeded OTP attempts
            if (error instanceof HttpError) {
                if (error.status === HTTP_STATUS_FORBIDDEN || error.message.includes("quá số lần cho phép")) {
                    sessionStorage.removeItem("login_email");
                    router.replace(ROUTES.LOGIN as Route);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsLoading(true);
        try {
            await renewOtp({
                email,
                action: "REGISTER",
            });

            // Reset OTP state & timer
            setOtp(Array(OTP_LENGTH).fill(""));
            setCountdown(tenMinutesSeconds);

            toast.success(UI_TEXT.auth.login.toasts.otpSentTitle, UI_TEXT.auth.login.toasts.otpSentDesc);
        } catch (error: unknown) {
            console.error("Resend OTP failed:", error);
            const msg = error instanceof Error ? error.message : UI_TEXT.auth.otp.toasts.resendErrorDesc;
            toast.error(UI_TEXT.auth.otp.toasts.resendErrorTitle, msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full max-w-[410px] rounded-[26px] bg-white px-8 py-[34px] text-slate-900 shadow-[0_34px_74px_-22px_rgba(0,0,0,0.55)]"
        >
            <div className="mb-[22px] text-center">
                <Image
                    src={RIKKEI_LOGO_PATH}
                    alt={UI_TEXT.auth.otp.logoAlt}
                    width={RIKKEI_LOGO_LOGIN_WIDTH}
                    height={64}
                    className="mx-auto mb-3.5 block h-auto w-full max-w-[188px]"
                    priority
                />
                <h1 className="font-display text-[22px] font-extrabold tracking-[-0.01em] text-slate-900">{UI_TEXT.auth.otp.title}</h1>
                <p className="mt-1 px-2 text-[13px] leading-relaxed text-slate-500">
                    {UI_TEXT.auth.otp.subtitlePrefix}
                    <span className="font-semibold text-slate-800">{email}</span>
                    {UI_TEXT.auth.otp.subtitleSuffix}
                </p>
            </div>

            <div className="my-6 flex justify-between gap-2.5">
                {otp.map((data, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputRefs.current[index] = el;
                        }}
                        type="text"
                        maxLength={1}
                        value={data}
                        onChange={(e) => handleChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={index === 0 ? handlePaste : undefined}
                        className="h-14 w-12 rounded-[12px] border-[1.5px] border-slate-200 bg-cream text-center text-lg font-bold text-slate-950 transition outline-none focus:border-brand-500 focus:bg-white"
                    />
                ))}
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-[14px] bg-linear-to-br from-brand-400 to-brand-500 p-3.5 text-center text-[15px] font-extrabold text-white shadow-[0_14px_28px_-12px_rgba(60,66,150,0.6)] transition hover:brightness-110 disabled:opacity-70"
            >
                {isLoading ? UI_TEXT.auth.otp.submittingButton : UI_TEXT.auth.otp.submitButton}
            </button>

            <div className="mt-6 text-center text-xs text-slate-500">
                <p className="mb-2">
                    {UI_TEXT.auth.otp.expirePrefix}
                    <span className="font-semibold text-brand-500">{formatOtpCountdown(countdown)}</span>
                </p>
                <button
                    type="button"
                    onClick={handleResend}
                    disabled={isLoading}
                    className="font-bold text-brand-500 hover:text-brand-600 hover:underline disabled:opacity-50"
                >
                    {UI_TEXT.auth.otp.resendButton}
                </button>
            </div>

            <div className="mt-4 text-center">
                <Link
                    href={ROUTES.LOGIN}
                    onClick={() => {
                        sessionStorage.removeItem("login_email");
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-slate-700"
                >
                    {UI_TEXT.auth.otp.backToLogin}
                </Link>
            </div>
        </form>
    );
}
