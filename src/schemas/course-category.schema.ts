import { z } from "zod";
import { UI_TEXT } from "@/constants/ui-text.constants";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const courseCategorySchema = z.object({
    name: z.string().min(1, UI_TEXT.courseCategories.nameRequiredError),
    description: z.string().optional(),
    color: z
        .string()
        .optional()
        .refine((val) => !val || HEX_COLOR_REGEX.test(val), {
            message: UI_TEXT.courseCategories.colorInvalidError,
        }),
    icon: z.string().optional(),
    // Default value of 0 / true is provided via the form's `defaultValues`, not here,
    // to keep the resolver's input/output types aligned for react-hook-form.
    priority: z.number().min(0),
    isActive: z.boolean(),
});

export type CourseCategoryFormValues = z.infer<typeof courseCategorySchema>;

export const courseCategoryFormDefaultValues: CourseCategoryFormValues = {
    name: "",
    description: "",
    color: "",
    icon: "",
    priority: 0,
    isActive: true,
};
