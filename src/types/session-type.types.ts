export interface SessionType {
    id: string;
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    position: number;
    isActive: boolean;
    isSystem: boolean;
    defaultBlocks?: Array<{
        type: string;
        title: string;
        isRequired: boolean;
        completionCriteria?: Record<string, unknown>;
    }>;
}

export interface CreateSessionTypeDto {
    code: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}

export interface UpdateSessionTypeDto {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    isActive?: boolean;
}

export interface SessionTypeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChanged?: () => void;
}

export interface SessionTypeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingType?: SessionType | null;
}
