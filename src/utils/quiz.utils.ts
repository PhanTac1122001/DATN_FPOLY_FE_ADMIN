import { CHAR_CODE_CAPITAL_A, DEFAULT_QUESTION_POINTS } from "@/constants/quiz.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import type { OptionMock, QuestionMock } from "@/types/exam-set.types";
import type { QuestionType, QuizQuestionDto } from "@/types/quiz.types";

const questionTypeLabels: Record<QuestionType, string> = {
    SINGLE_CHOICE: UI_TEXT.examsSetsEl.questionTypeSingle,
    MULTIPLE_CHOICE: UI_TEXT.examsSetsEl.questionTypeMultiple,
    TEXT: UI_TEXT.examsSetsEl.questionTypeText,
};

export function getQuestionTypeLabel(type: QuestionType): string {
    return questionTypeLabels[type] ?? UI_TEXT.examsSetsEl.questionTypeSingle;
}

/**
 * Chuyển câu hỏi parse từ Excel (QuizQuestionDto) sang QuestionMock để hiển thị
 * và ghép vào danh sách của màn soạn câu hỏi. idPrefix đảm bảo id tạm không trùng.
 */
export function mapImportedQuestionsToUiQuestions(questions: QuizQuestionDto[], idPrefix: string): QuestionMock[] {
    return questions.map((q, qIndex) => {
        const options: OptionMock[] = (q.options || []).map((opt, optIndex) => ({
            id: `${idPrefix}-${qIndex}-${optIndex}`,
            label: String.fromCharCode(CHAR_CODE_CAPITAL_A + optIndex),
            text: opt.content,
            isCorrect: Boolean(opt.isCorrect),
        }));

        return {
            id: `${idPrefix}-${qIndex}`,
            text: q.content,
            explanation: q.content,
            points: q.points ?? DEFAULT_QUESTION_POINTS,
            options,
        };
    });
}
