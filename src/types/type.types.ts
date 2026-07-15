export interface SemesterMock {
    id: string;
    semesterName: string;
    badgeColor: "warning" | "orange" | "error" | "blue" | "success";
}

export interface TrainingTypeMock {
    id: string;
    code: string;
    name: string;
    majors: string;
    createdAt: string;
    semesters: SemesterMock[];
}

export interface TypeDetailViewProps {
    id: string;
}

export interface TypeDetailClientViewProps {
    id: string;
}
