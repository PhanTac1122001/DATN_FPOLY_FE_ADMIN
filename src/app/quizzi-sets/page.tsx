import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { QuizziSetClientView } from "@/views/quizzi-sets/quizzi-set-client-view";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.quizziSets.title,
    description: UI_TEXT.metadata.quizziSets.description,
};

export default function QuizziSetsPage() {
    return <QuizziSetClientView />;
}
