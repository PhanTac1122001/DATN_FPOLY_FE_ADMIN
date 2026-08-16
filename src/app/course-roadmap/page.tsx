import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { CourseRoadmapClientView } from "@/views/course-roadmap/course-roadmap-client-view";

export const metadata: Metadata = {
    title: UI_TEXT.courseRoadmap.title,
    description: UI_TEXT.courseRoadmap.subtitle,
};

export default function CourseRoadmapPage() {
    return <CourseRoadmapClientView />;
}
