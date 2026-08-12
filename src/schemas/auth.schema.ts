import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/constants/password-validation.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { passwordSchema } from "@/utils/password-validation";

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, UI_TEXT.profile.changePassword.errors.currentPasswordRequired),
        newPassword: passwordSchema,
        confirmPassword: z.string().min(1, UI_TEXT.common.password.errors.confirmRequired),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: UI_TEXT.common.password.errors.mismatch,
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: UI_TEXT.profile.changePassword.errors.newPasswordSameAsOld,
        path: ["newPassword"],
    });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

const PHONE_LENGTH = 10;

export const phoneValidationSchema = z
    .string()
    .min(1, UI_TEXT.auth.register.errors.phoneNumberRequired)
    .refine(
        (val) => {
            const sanitized = val.replace(/\s+/g, "").trim();
            return /^\d+$/.test(sanitized) && /^(03|05|07|08|09)/.test(sanitized);
        },
        { message: UI_TEXT.auth.register.errors.phoneNumberFormat },
    )
    .refine((val) => val.replace(/\s+/g, "").trim().length === PHONE_LENGTH, {
        message: UI_TEXT.auth.register.errors.phoneNumberLength,
    });

export const registerSchema = z
    .object({
        fullName: z.string().min(1, UI_TEXT.auth.register.errors.fullNameRequired),
        email: z.string().min(1, UI_TEXT.auth.login.errors.emailRequired).email(UI_TEXT.auth.login.errors.emailInvalid),
        phoneNumber: phoneValidationSchema,
        password: z.string().min(1, UI_TEXT.common.password.errors.required).min(MIN_PASSWORD_LENGTH, UI_TEXT.auth.register.errors.passwordMinLength),
        confirmPassword: z.string().min(1, UI_TEXT.auth.register.errors.confirmPasswordRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: UI_TEXT.auth.register.errors.passwordsDoNotMatch,
        path: ["confirmPassword"],
    });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
    email: z.string().min(1, UI_TEXT.auth.login.errors.emailRequired).email(UI_TEXT.auth.login.errors.emailInvalid),
    password: z.string().min(1, UI_TEXT.common.password.errors.required).min(MIN_PASSWORD_LENGTH, UI_TEXT.common.password.errors.minLength),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const updateProfileSchema = z.object({
    fullName: z.string().min(1, UI_TEXT.profile.toastFullNameRequired),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === "") return true;
                const sanitized = val.replace(/\s+/g, "").trim();
                return /^\d+$/.test(sanitized) && /^(03|05|07|08|09)/.test(sanitized) && sanitized.length === PHONE_LENGTH;
            },
            { message: UI_TEXT.auth.register.errors.phoneNumberFormat },
        ),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    address: z.string().optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
