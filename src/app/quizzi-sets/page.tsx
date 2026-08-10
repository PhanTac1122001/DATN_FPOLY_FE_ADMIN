import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { QuizziSetClientView } from "@/views/quizzi-sets/quizzi-set-client-view";

export const metadata: Metadata = {
    title: `Quản lý bộ đề Quizzi | ${UI_TEXT.common.appName}`,
    description: "Quản lý bộ đề Quizzi theo Session bài học",
};

export default function QuizziSetsPage() {
    return <QuizziSetClientView />;
}
