import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/constants/password-validation.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

/**
 * Password validation requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one number OR special character
 */

// Error messages from UI_TEXT (camelCase to avoid constants rule)
const passwordErrors = UI_TEXT.common.password.errors;

/** Password hint text from UI_TEXT */
export const passwordHint = UI_TEXT.common.password.hint;

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns true if password meets requirements, false otherwise
 */
export function isStrongPassword(password: string): boolean {
    if (password.length < MIN_PASSWORD_LENGTH) return false;

    const hasUppercase = /[A-Z]/.test(password);
    const hasNumberOrSpecial = new RegExp("[0-9!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]").test(password);

    return hasUppercase && hasNumberOrSpecial;
}

/**
 * Zod schema for password validation
 */
export const passwordSchema = z.string().min(1, passwordErrors.required).min(MIN_PASSWORD_LENGTH, passwordErrors.minLength).refine(isStrongPassword, {
    message: passwordErrors.weak,
});

/**
 * Zod schema for password with confirmation
 */
export const passwordWithConfirmSchema = z
    .object({
        password: passwordSchema,
        confirmPassword: z.string().min(1, passwordErrors.confirmRequired),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: passwordErrors.mismatch,
        path: ["confirmPassword"],
    });

/**
 * Manual validation function for password (for forms not using zod)
 * @param password - Password to validate
 * @returns Error message if invalid, empty string if valid
 */
export function validatePassword(password: string): string {
    if (!password) {
        return passwordErrors.required;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        return passwordErrors.minLength;
    }
    if (!isStrongPassword(password)) {
        return passwordErrors.weak;
    }
    return "";
}

/**
 * Manual validation function for confirm password
 * @param confirmPassword - Confirm password value
 * @param password - Original password value
 * @returns Error message if invalid, empty string if valid
 */
export function validateConfirmPassword(confirmPassword: string, password: string): string {
    if (!confirmPassword) {
        return passwordErrors.confirmRequired;
    }
    if (confirmPassword !== password) {
        return passwordErrors.mismatch;
    }
    return "";
}

/** Export error messages for use in UI_TEXT */
export const passwordValidationErrors = passwordErrors;
