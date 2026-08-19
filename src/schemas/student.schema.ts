import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/constants/student.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const studentSchema = z.object({
    fullName: z.string().min(1, UI_TEXT.studentFormModal.errFullNameRequired),
    email: z.string().email(UI_TEXT.staff.validationEmailInvalid).min(1, UI_TEXT.studentFormModal.errEmailRequired),
    phone: z.string().min(1, UI_TEXT.studentFormModal.errPhoneRequired),
    dateOfBirth: z.string().min(1, UI_TEXT.studentFormModal.errDobRequired),
    location: z.string().optional(),
    studentCode: z.string().optional(),
    password: z
        .string()
        .refine((val) => !val || (val.length >= MIN_PASSWORD_LENGTH && val.length <= MAX_PASSWORD_LENGTH), {
            message: UI_TEXT.studentFormModal.validationPasswordLength,
        })
        .optional()
        .or(z.literal("")),
    status: z.string().optional(),
    systemId: z.string().optional(),
    systemIds: z.array(z.string()).optional(),
    lockedUntil: z.string().optional(),
});

export type StudentSchemaType = z.infer<typeof studentSchema>;
