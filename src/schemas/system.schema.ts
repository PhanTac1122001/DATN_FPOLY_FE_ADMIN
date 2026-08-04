import { z } from "zod";

export const systemSchema = z.object({
    code: z.string().min(1, "Mã hệ đào tạo không được để trống"),
    name: z.string().min(1, "Tên hệ đào tạo không được để trống"),
    specializes: z.array(
        z.object({
            id: z.string().optional(),
            name: z.string().min(1, "Tên chuyên ngành không được để trống"),
            semesters: z.array(
                z.object({
                    id: z.string().optional(),
                    name: z.string().min(1, "Tên kỳ học không được để trống"),
                }),
            ),
            isSemestersVisible: z.boolean().optional(),
        }),
    ),
});

export type SystemSchemaType = z.infer<typeof systemSchema>;
