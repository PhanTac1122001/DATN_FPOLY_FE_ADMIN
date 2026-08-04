import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { CoursesClientView } from "@/views/courses/courses-client-view";

export const metadata: Metadata = UI_TEXT.metadata.courses;

export default function CoursesPage() {
    return <CoursesClientView />;
}
