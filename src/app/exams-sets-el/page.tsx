import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ExamSetClientView } from "@/views/exams-sets/exam-set-client-view";

export const metadata: Metadata = {
    title: `${UI_TEXT.examsSetsEl.title} | ${UI_TEXT.common.appName}`,
    description: UI_TEXT.examsSetsEl.subtitle,
};

export default function ExamSetsPage() {
    return <ExamSetClientView />;
}
