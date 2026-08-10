import type { ExamSetMock, OptionMock, QuestionMock } from "./exam-set.types";

export type QuestionType = "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";

export interface QuizOptionDto {
    content: string;
    isCorrect: boolean;
}

export interface QuizQuestionDto {
    content: string;
    type: QuestionType;
    points?: number;
    options?: QuizOptionDto[];
    timeInVideo?: number;
}

export interface QuizBackendEntity {
    id: string;
    title: string;
    description?: string;
    passThreshold: number;
    courseId?: string;
    questions: Array<{
        _id?: string;
        content: string;
        type: QuestionType;
        points?: number;
        timeInVideo?: number;
        options?: Array<{
            _id?: string;
            content: string;
            isCorrect?: boolean;
        }>;
    }>;
    createdAt: string;
}

export interface CreateQuizPayload {
    title: string;
    description?: string;
    passThreshold?: number;
    courseId?: string;
    questions: QuizQuestionDto[];
}

export interface UpdateQuizPayload {
    title?: string;
    description?: string;
    passThreshold?: number;
    courseId?: string;
    questions?: QuizQuestionDto[];
}

const CHAR_CODE_CAPITAL_A = 65;
const DEFAULT_QUESTION_POINTS = 10;

export interface CreateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newQuiz: QuizBackendEntity) => void;
}

export function mapBackendQuizToExamSet(quiz: QuizBackendEntity): ExamSetMock {
    const questions: QuestionMock[] = (quiz.questions || []).map((q, qIndex) => {
        const rawOptions = q.options || [];
        const options: OptionMock[] = rawOptions.map((opt, optIndex) => ({
            id: opt._id || `opt_${optIndex}`,
            label: String.fromCharCode(CHAR_CODE_CAPITAL_A + optIndex), // A, B, C, D
            text: opt.content,
            isCorrect: Boolean(opt.isCorrect),
        }));

        return {
            id: q._id || `q_${qIndex}`,
            text: q.content,
            explanation: q.content,
            points: q.points || DEFAULT_QUESTION_POINTS,
            options,
        };
    });

    return {
        id: quiz.id,
        name: quiz.title,
        questionCount: questions.length,
        createdAt: quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
        questions,
    };
}

export function mapUiQuestionsToBackendDtos(questions: QuestionMock[]): QuizQuestionDto[] {
    return questions.map((q) => {
        const correctCount = (q.options || []).filter((o) => o.isCorrect).length;
        let type: QuestionType = "SINGLE_CHOICE";
        if (correctCount > 1) {
            type = "MULTIPLE_CHOICE";
        } else if (!q.options || q.options.length === 0) {
            type = "TEXT";
        }

        const options: QuizOptionDto[] = (q.options || [])
            .filter((o) => o.text && o.text.trim() !== "")
            .map((o) => ({
                content: o.text,
                isCorrect: o.isCorrect,
            }));

        return {
            content: q.explanation || q.text,
            type,
            points: q.points || DEFAULT_QUESTION_POINTS,
            options: options.length > 0 ? options : undefined,
        };
    });
}
