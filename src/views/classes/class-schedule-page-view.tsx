"use client";

import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "@/components/application/breadcrumb";
import { ClassScheduleSubpanel } from "@/components/application/classes/class-schedule-subpanel";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import type { ClassSchedulePageViewProps } from "@/types/class.types";

export function ClassSchedulePageView({ classId }: ClassSchedulePageViewProps) {
    const { data: detail, isLoading } = useQuery({
        queryKey: ["class-detail", classId],
        queryFn: () => getClassDetail(classId),
        enabled: !!classId,
    });

    const classInfo = detail?.class;
    const courses = detail?.courses || [];
    const students = detail?.students || [];

    if (isLoading) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-3">
                <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                <p className="text-sm font-semibold text-slate-500">{UI_TEXT.classes.loading}</p>
            </div>
        );
    }

    return (
        <div className="flex w-full flex-1 flex-col gap-6">
            {/* Top Navigation Bar */}
            <div className="flex flex-col gap-3">
                <Breadcrumb
                    items={[
                        { label: UI_TEXT.classes.title, href: "/classes" },
                        {
                            label: classInfo?.name || "Chi tiết lớp",
                            href: `/classes/${classId}`,
                        },
                        { label: UI_TEXT.classSchedule.title },
                    ]}
                />
            </div>

            {/* Main Subpanel View */}
            <ClassScheduleSubpanel classId={classId} courses={courses} students={students} />
        </div>
    );
}
