export interface PublishIssue {
    code: string;
    message: string;
    sessionId?: string;
    lessonId?: string;
    blockId?: string;
}

export interface PublishReportEntity {
    errors: PublishIssue[];
    warnings: PublishIssue[];
}

export interface PublishStatusEntity {
    version: number;
    lastPublishedAt: string | null;
    hasUnpublishedChanges: boolean;
    issuesIncluded: boolean;
    errors: PublishIssue[];
    warnings: PublishIssue[];
}

export interface PublishReportModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    report: PublishReportEntity | null;
    title?: string;
    isPublishSuccess?: boolean;
}
