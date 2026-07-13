"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/base/alert/alert";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Lock } from "@/components/icons";
import { toastStub } from "@/config/toast.config";
import { ERROR_KEYWORDS, ICON_COLORS, ROUTES } from "@/constants/app.constants";
import { REDIRECT_DELAY } from "@/constants/ui-components.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { HttpError } from "@/lib/http-client";
import { resetPassword } from "@/services/auth.service";
import { passwordHint, validateConfirmPassword, validatePassword } from "@/utils/password-validation";

function ResetPasswordFormContent() {
    const router = useAppRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // Separate errors: one for form submission, one for validation
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [touched, setTouched] = useState({ password: false, confirmPassword: false });
    const [isSuccess, setIsSuccess] = useState(false);

    // Derive token validation error from token - this won't cause re-render loops
    const tokenError = !token ? UI_TEXT.auth.resetPassword.errors.tokenInvalid : "";

    // Auto-focus password input on mount
    useEffect(() => {
        if (token) {
            const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
            if (passwordInput) {
                passwordInput.focus();
            }
        }
    }, [token]);

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setError("");
        if (touched.password) {
            setPasswordError(validatePassword(value));
        }
        // Re-validate confirm password if it's already touched
        if (touched.confirmPassword) {
            setConfirmPasswordError(validateConfirmPassword(confirmPassword, value));
        }
    };

    const handleConfirmPasswordChange = (value: string) => {
        setConfirmPassword(value);
        setError("");
        if (touched.confirmPassword) {
            setConfirmPasswordError(validateConfirmPassword(value, password));
        }
    };

    const handleBlur = (field: "password" | "confirmPassword") => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        if (field === "password") {
            setPasswordError(validatePassword(password));
        } else {
            setConfirmPasswordError(validateConfirmPassword(confirmPassword, password));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setTouched({ password: true, confirmPassword: true });

        const passwordErr = validatePassword(password);
        const confirmPasswordErr = validateConfirmPassword(confirmPassword, password);
        setPasswordError(passwordErr);
        setConfirmPasswordError(confirmPasswordErr);

        if (passwordErr || confirmPasswordErr) {
            return;
        }

        if (tokenError) {
            // Don't submit if token is invalid
            return;
        }

        setIsLoading(true);

        try {
            await resetPassword({
                token,
                password,
                confirmPassword,
            });

            setIsSuccess(true);
            toastStub.success(UI_TEXT.auth.resetPassword.successMessage);

            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push(ROUTES.LOGIN);
            }, REDIRECT_DELAY);
        } catch (err) {
            setIsLoading(false);

            if (err instanceof HttpError) {
                const errorMessage = err.payload as { message?: string } | undefined;
                const message = errorMessage?.message || err.message;

                // Check for expired token error
                if (ERROR_KEYWORDS.EXPIRED.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))) {
                    setError(UI_TEXT.auth.resetPassword.errors.tokenExpired);
                } else if (ERROR_KEYWORDS.INVALID.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()))) {
                    setError(UI_TEXT.auth.resetPassword.errors.tokenInvalid);
                } else {
                    setError(message || UI_TEXT.common.genericError);
                }
            } else {
                setError(UI_TEXT.common.genericError);
            }
        }
    };

    if (isSuccess) {
        return (
            <div className="flex w-full flex-col items-center gap-6">
                <div className="flex w-full flex-col items-center gap-[24px] text-center">
                    <div className="flex flex-col gap-[8px]">
                        <h1 className="font-display text-[32px] leading-[40px] font-bold text-slate-950">{UI_TEXT.auth.resetPassword.title}</h1>
                        <p className="font-sans text-[14px] leading-[20px] text-slate-800">{UI_TEXT.auth.resetPassword.successMessage}</p>
                    </div>

                    <p className="text-sm text-slate-600">{UI_TEXT.auth.resetPassword.redirectMessage}</p>
                </div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="flex w-full flex-col items-center gap-6">
                <div className="flex w-full flex-col items-center gap-[24px] text-center">
                    <div className="flex flex-col gap-[8px]">
                        <h1 className="font-display text-[32px] leading-[40px] font-bold text-slate-950">{UI_TEXT.auth.resetPassword.title}</h1>
                        <p className="font-sans text-[14px] leading-[20px] text-error-600">{UI_TEXT.auth.resetPassword.errors.tokenInvalid}</p>
                    </div>

                    <Link href={ROUTES.LOGIN}>
                        <Button size="lg">{UI_TEXT.auth.resetPassword.backToLogin}</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-col items-center gap-6">
            {/* Title Section */}
            <div className="flex w-full flex-col items-center gap-[8px]">
                <h1 className="font-display text-[32px] leading-[40px] font-bold text-slate-950">{UI_TEXT.auth.resetPassword.title}</h1>
                <p className="font-sans text-[14px] leading-[20px] text-slate-800">{UI_TEXT.auth.resetPassword.subtitle}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-[32px]">
                {/* Form Fields */}
                <div className="flex w-full flex-col gap-[16px]">
                    {/* Password Input */}
                    <Input
                        value={password}
                        onChange={handlePasswordChange}
                        isRequired
                        validationBehavior="aria"
                        isInvalid={!!passwordError}
                        hint={passwordError || <span className="text-slate-600 italic">{passwordHint}</span>}
                        label={UI_TEXT.auth.resetPassword.passwordLabel}
                        type="password"
                        placeholder={UI_TEXT.auth.resetPassword.passwordPlaceholder}
                        icon={Lock}
                        size="md"
                        inputClassName="pr-[38px] py-[10px] text-[16px] leading-[24px] text-slate-500 placeholder:text-slate-500"
                        iconClassName="left-[14px]"
                        iconColor={ICON_COLORS.GRAY_400}
                        onBlur={() => handleBlur("password")}
                        autoComplete="new-password"
                        showPassword={showPassword}
                        onTogglePassword={() => setShowPassword(!showPassword)}
                        showPasswordLabel={UI_TEXT.auth.resetPassword.showPasswordLabel}
                        hidePasswordLabel={UI_TEXT.auth.resetPassword.hidePasswordLabel}
                    />

                    {/* Confirm Password Input */}
                    <Input
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        isRequired
                        validationBehavior="aria"
                        isInvalid={!!confirmPasswordError}
                        hint={confirmPasswordError}
                        label={UI_TEXT.auth.resetPassword.confirmPasswordLabel}
                        type="password"
                        placeholder={UI_TEXT.auth.resetPassword.confirmPasswordPlaceholder}
                        icon={Lock}
                        size="md"
                        inputClassName="pr-[38px] py-[10px] text-[16px] leading-[24px] text-slate-500 placeholder:text-slate-500"
                        iconClassName="left-[14px]"
                        iconColor={ICON_COLORS.GRAY_400}
                        onBlur={() => handleBlur("confirmPassword")}
                        autoComplete="new-password"
                        showPassword={showConfirmPassword}
                        onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                        showPasswordLabel={UI_TEXT.auth.resetPassword.showPasswordLabel}
                        hidePasswordLabel={UI_TEXT.auth.resetPassword.hidePasswordLabel}
                    />

                    {error || tokenError ? <Alert variant="error" message={error || tokenError} /> : null}
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    isLoading={isLoading}
                    isDisabled={isLoading || !password || !confirmPassword || !!passwordError || !!confirmPasswordError}
                >
                    {UI_TEXT.auth.resetPassword.submitButton}
                </Button>

                {/* Back to Login */}
                <div className="text-center">
                    <Link
                        href={ROUTES.LOGIN}
                        className="font-sans text-[14px] leading-[20px] font-semibold text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)]"
                    >
                        {UI_TEXT.auth.resetPassword.backToLogin}
                    </Link>
                </div>
            </form>
        </div>
    );
}

export function ResetPasswordForm() {
    return (
        <Suspense
            fallback={
                <div className="flex w-full flex-col items-center gap-6">
                    <div className="flex w-full flex-col items-center gap-[24px] text-center">
                        <p className="font-sans text-[14px] leading-[20px] text-slate-800">{UI_TEXT.common.loading}</p>
                    </div>
                </div>
            }
        >
            <ResetPasswordFormContent />
        </Suspense>
    );
}
