import { z } from "zod";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { GenderEnum, StatusEnum } from "@/types/staff.types";

const minPasswordLength = 6;

export const staffSchema = z.object({
    fullName: z.string().min(1, "Họ và tên không được để trống"),
    email: z.string().email("Email không hợp lệ").min(1, "Email không được để trống"),
    phone: z
        .string()
        .regex(/^\+?[0-9]{9,12}$/, "Số điện thoại không hợp lệ")
        .min(1, "Số điện thoại không được để trống"),
    address: z.string().min(1, "Địa chỉ không được để trống"),
    password: z.string().min(minPasswordLength, "Mật khẩu tối thiểu 6 ký tự").optional().or(z.literal("")),
    gender: z.nativeEnum(GenderEnum, { message: UI_TEXT.staff.validationGender }),
    status: z.nativeEnum(StatusEnum),
    whitelist: z.boolean(),
    systemIds: z.array(z.string()),
    roles: z.array(z.string()).min(1, "Chọn ít nhất 1 vai trò"),
});

export type StaffSchemaType = z.infer<typeof staffSchema>;
