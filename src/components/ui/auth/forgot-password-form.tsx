"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "@/components/base/alert/alert";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { toastStub } from "@/config/toast.config";
import { ROUTES } from "@/constants/app.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { useAppRouter } from "@/hooks/use-app-router";
import { HttpError } from "@/lib/http-client";
import { forgotPassword } from "@/services/auth.service";
import { validateEmail } from "@/utils/email-validation";

export function ForgotPasswordForm() {
    const router = useAppRouter();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [touched, setTouched] = useState(false);

    useEffect(() => {
        const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
        emailInput?.focus();
    }, []);

    const validateEmailField = (value: string): string => {
        return validateEmail(value, {
            required: true,
            errorMessages: {
                required: UI_TEXT.auth.forgotPassword.errors.emailRequired,
                invalid: UI_TEXT.auth.forgotPassword.errors.emailInvalid,
            },
        });
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setError("");
        if (touched) {
            setEmailError(validateEmailField(value));
        }
    };

    const handleBlur = () => {
        setTouched(true);
        setEmailError(validateEmailField(email));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setTouched(true);

        const emailErr = validateEmailField(email);
        setEmailError(emailErr);
        if (emailErr) return;

        setIsLoading(true);

        try {
            await forgotPassword({ email });
            toastStub.success(UI_TEXT.auth.forgotPassword.successModal.message);
            router.push(ROUTES.LOGIN);
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
        <>
            <div className="flex flex-col gap-2 text-center">
                <h1 className="font-display text-[32px] leading-[40px] font-bold text-slate-950">{UI_TEXT.auth.forgotPassword.title}</h1>
                <p className="font-sans text-sm text-slate-800">{UI_TEXT.auth.forgotPassword.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-8">
                <Input
                    value={email}
                    onChange={handleEmailChange}
                    isRequired
                    isInvalid={!!emailError}
                    hint={emailError}
                    label={UI_TEXT.auth.forgotPassword.emailLabel}
                    type="email"
                    placeholder={UI_TEXT.auth.forgotPassword.emailPlaceholder}
                    size="md"
                    onBlur={handleBlur}
                    autoComplete="email"
                />

                {error ? <Alert variant="error" message={error} /> : null}

                <Button type="submit" size="lg" isLoading={isLoading} isDisabled={isLoading || !email || !!emailError}>
                    {UI_TEXT.auth.forgotPassword.sendButton}
                </Button>

                <div className="text-center">
                    <Link href={ROUTES.LOGIN} className="text-sm font-semibold text-brand-500 hover:text-brand-600">
                        {UI_TEXT.auth.forgotPassword.backToLogin}
                    </Link>
                </div>
            </form>
        </>
    );
}
