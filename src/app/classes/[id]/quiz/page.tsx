import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassQuizResultView } from "@/views/classes/class-quiz-result-view";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.classQuiz.title,
    description: UI_TEXT.metadata.classQuiz.description,
};

export default async function ClassQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClassQuizResultView classId={id} />;
}
