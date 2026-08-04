import { z } from "zod";

export const classSchema = z.object({
    name: z.string().min(1, "Tên lớp không được để trống"),
    classCode: z.string().min(1, "Mã lớp không được để trống"),
    type: z.string().optional(),
    courseIds: z.array(z.string()).optional(),
    userIds: z.array(z.string()).optional(),
});

export type ClassSchemaType = z.infer<typeof classSchema>;
