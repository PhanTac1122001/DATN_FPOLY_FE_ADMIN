import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassQuizResultView } from "@/views/classes/class-quiz-result-view";

export const metadata: Metadata = {
    title: `Kết quả kiểm tra đầu giờ | ${UI_TEXT.common.appName}`,
    description: "Quản lý phiên Quizzi và kết quả kiểm tra đầu giờ của lớp học",
};

export default async function ClassQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <ClassQuizResultView classId={id} />;
}
