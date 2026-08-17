export enum LeaveRequestStatusEnum {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
}

export interface LeaveRequestItem {
    _id: string;
    studentId?: {
        _id: string;
        fullName?: string;
        name?: string;
        studentCode?: string;
        code?: string;
        email?: string;
        phone?: string;
        avatar?: string;
    };
    classId?: {
        _id: string;
        name?: string;
        code?: string;
    };
    classSessionId?: {
        _id: string;
        date?: string;
        period?: number;
        topic?: string;
    };
    date: string;
    shift: string;
    reason: string;
    proofImage: string;
    status: LeaveRequestStatusEnum;
    reviewerId?: {
        _id: string;
        fullName?: string;
        name?: string;
        email?: string;
    };
    reviewerNote?: string;
    reviewedAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClassLeavesViewProps {
    classId: string;
}

export interface GetLeaveRequestsResponse {
    total: number;
    items: LeaveRequestItem[];
}
