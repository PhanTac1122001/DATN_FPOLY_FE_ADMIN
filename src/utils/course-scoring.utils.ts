/* eslint-disable @typescript-eslint/no-magic-numbers */
import type { BackendScoringFormula, CourseGradingFormula } from "@/types/course.types";

const percentageBase = 100;

export function pctToFraction(pct: number): number {
    return Number(pct) / percentageBase;
}

export function fractionToPct(fraction: number): number {
    return Math.round(Number(fraction) * percentageBase);
}

const defaultUiGrading: CourseGradingFormula = {
    useCustomFormula: false,
    attendanceWeight: 10,
    quizWeight: 10,
    hackathonWeight: 20,
    examWeight: 60,
    passScore: 5.0,
    hackathonQuizWeight: 30,
    hackathonEssayWeight: 70,
    finalExamType: "PROJECT",
    projectProductWeight: 70,
    projectKnowledgeWeight: 10,
    projectInterviewWeight: 20,
    essayEssayWeight: 70,
    essayQuizWeight: 30,
};

export function mapUiGradingToBackendFormula(grading: CourseGradingFormula): BackendScoringFormula {
    const type = grading.finalExamType === "ESSAY" ? "ESSAY" : "PROJECT";
    const formula: BackendScoringFormula = {
        weights: {
            attendance: pctToFraction(grading.attendanceWeight ?? 0),
            quiz: pctToFraction(grading.quizWeight ?? 0),
            hackathon: pctToFraction(grading.hackathonWeight ?? 0),
            finalExam: pctToFraction(grading.examWeight ?? 0),
        },
        hackathon: {
            multipleChoice: pctToFraction(grading.hackathonQuizWeight ?? 0),
            essay: pctToFraction(grading.hackathonEssayWeight ?? 0),
        },
        finalExam: { type },
    };

    if (type === "PROJECT") {
        formula.finalExam.project = {
            product: pctToFraction(grading.projectProductWeight ?? 0),
            knowledge: pctToFraction(grading.projectKnowledgeWeight ?? 0),
            interview: pctToFraction(grading.projectInterviewWeight ?? 0),
        };
    } else {
        formula.finalExam.essay = {
            written: pctToFraction(grading.essayEssayWeight ?? 0),
            multipleChoice: pctToFraction(grading.essayQuizWeight ?? 0),
        };
    }

    return formula;
}

export function mapBackendFormulaToUiGrading(formula: BackendScoringFormula | null | undefined, passScore = defaultUiGrading.passScore): CourseGradingFormula {
    if (!formula?.weights) {
        return { ...defaultUiGrading };
    }

    const type = formula.finalExam?.type === "ESSAY" ? "ESSAY" : "PROJECT";

    return {
        useCustomFormula: true,
        attendanceWeight: fractionToPct(formula.weights.attendance ?? 0),
        quizWeight: fractionToPct(formula.weights.quiz ?? 0),
        hackathonWeight: fractionToPct(formula.weights.hackathon ?? 0),
        examWeight: fractionToPct(formula.weights.finalExam ?? 0),
        passScore,
        hackathonQuizWeight: fractionToPct(formula.hackathon?.multipleChoice ?? 0),
        hackathonEssayWeight: fractionToPct(formula.hackathon?.essay ?? 0),
        finalExamType: type,
        projectProductWeight: fractionToPct(formula.finalExam?.project?.product ?? 0.7),
        projectKnowledgeWeight: fractionToPct(formula.finalExam?.project?.knowledge ?? 0.1),
        projectInterviewWeight: fractionToPct(formula.finalExam?.project?.interview ?? 0.2),
        essayEssayWeight: fractionToPct(formula.finalExam?.essay?.written ?? 0.7),
        essayQuizWeight: fractionToPct(formula.finalExam?.essay?.multipleChoice ?? 0.3),
    };
}
