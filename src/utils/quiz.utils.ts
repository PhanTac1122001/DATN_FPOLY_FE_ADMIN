import { UI_TEXT } from "@/constants/ui-text.constants";
import type { QuestionType } from "@/types/quiz.types";

const questionTypeLabels: Record<QuestionType, string> = {
    SINGLE_CHOICE: UI_TEXT.examsSetsEl.questionTypeSingle,
    MULTIPLE_CHOICE: UI_TEXT.examsSetsEl.questionTypeMultiple,
    TEXT: UI_TEXT.examsSetsEl.questionTypeText,
};

export function getQuestionTypeLabel(type: QuestionType): string {
    return questionTypeLabels[type] ?? UI_TEXT.examsSetsEl.questionTypeSingle;
}
