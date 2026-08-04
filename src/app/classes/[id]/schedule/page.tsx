import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassScheduleClientView } from "@/views/classes/class-schedule-client-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = UI_TEXT.metadata.classSchedule;

export default async function ClassSchedulePage({ params }: PageProps) {
    const { id } = await params;
    return <ClassScheduleClientView id={id} />;
}
