import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { TypeDetailCourseClientView } from "@/views/type/type-detail-course-client-view";

interface PageProps {
    params: Promise<{ courseId: string }>;
}

export const metadata: Metadata = UI_TEXT.metadata.elearningCourse;

export default async function ElearningCoursePage({ params }: PageProps) {
    const { courseId } = await params;
    return <TypeDetailCourseClientView courseId={courseId} />;
}
