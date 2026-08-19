import { z } from "zod";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/constants/staff.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { GenderEnum, StatusEnum } from "@/types/staff.types";

export const staffSchema = z.object({
    fullName: z.string().min(1, UI_TEXT.staff.validationFullName),
    email: z.string().email(UI_TEXT.staff.validationEmailInvalid).min(1, UI_TEXT.staff.validationEmail),
    phone: z
        .string()
        .regex(/^\+?[0-9]{9,12}$/, UI_TEXT.staff.validationPhoneInvalid)
        .min(1, UI_TEXT.staff.validationPhone),
    address: z.string().min(1, UI_TEXT.staff.validationAddress),
    password: z
        .string()
        .refine((val) => !val || (val.length >= MIN_PASSWORD_LENGTH && val.length <= MAX_PASSWORD_LENGTH && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(val)), {
            message: UI_TEXT.staff.validationPasswordComplexity,
        })
        .optional()
        .or(z.literal("")),
    gender: z.nativeEnum(GenderEnum, { message: UI_TEXT.staff.validationGender }),
    status: z.nativeEnum(StatusEnum),
    whitelist: z.boolean(),
    systemIds: z.array(z.string()),
    roles: z.array(z.string()).min(1, UI_TEXT.staff.validationRoles),
});

export type StaffSchemaType = z.infer<typeof staffSchema>;
