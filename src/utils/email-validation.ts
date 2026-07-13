import { z } from "zod";
import { UI_TEXT } from "@/constants/ui-text.constants";

/**
 * Email validation utility
 * Provides reusable email validation schemas and functions
 */

// Default error messages from UI_TEXT - using common auth errors (camelCase to avoid constants rule)
const defaultEmailErrors = {
    required: UI_TEXT.auth.login.errors.emailRequired,
    invalid: UI_TEXT.auth.login.errors.emailInvalid,
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns true if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Creates a Zod schema for required email validation
 * @param errorMessages - Custom error messages (optional)
 * @returns Zod schema for required email
 */
export function createEmailSchema(errorMessages?: { required?: string; invalid?: string }) {
    const errors = {
        required: errorMessages?.required ?? defaultEmailErrors.required,
        invalid: errorMessages?.invalid ?? defaultEmailErrors.invalid,
    };

    return z.string().min(1, errors.required).email(errors.invalid);
}

/**
 * Creates a Zod schema for optional email validation
 * @param errorMessages - Custom error messages (optional)
 * @returns Zod schema for optional email
 */
export function createOptionalEmailSchema(errorMessages?: { invalid?: string }) {
    const invalidMessage = errorMessages?.invalid ?? defaultEmailErrors.invalid;

    return z.union([z.string().email(invalidMessage), z.literal("")]).optional();
}

/**
 * Default Zod schema for required email validation
 * Use this when email is a required field and you want to use default error messages
 */
export const emailSchema = createEmailSchema();

/**
 * Default Zod schema for optional email validation
 * Use this when email can be empty or a valid email and you want to use default error messages
 */
export const optionalEmailSchema = createOptionalEmailSchema();

/**
 * Manual validation function for email (for forms not using zod)
 * @param email - Email to validate
 * @param options - Validation options
 * @param options.required - Whether email is required (default: true)
 * @param options.errorMessages - Custom error messages (optional)
 * @returns Error message if invalid, empty string if valid
 */
export function validateEmail(
    email: string,
    options?: {
        required?: boolean;
        errorMessages?: {
            required?: string;
            invalid?: string;
        };
    },
): string {
    const required = options?.required ?? true;
    const errors = {
        required: options?.errorMessages?.required ?? defaultEmailErrors.required,
        invalid: options?.errorMessages?.invalid ?? defaultEmailErrors.invalid,
    };

    if (!email) {
        return required ? errors.required : "";
    }
    if (!isValidEmail(email)) {
        return errors.invalid;
    }
    return "";
}

/** Export default error messages for use in UI_TEXT */
export const emailValidationErrors = defaultEmailErrors;
