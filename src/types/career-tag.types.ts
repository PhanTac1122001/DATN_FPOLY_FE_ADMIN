export interface CareerTag {
    id: string;
    name: string;
    mysqlId?: number;
    createdAt: string;
}

export interface CreateCareerTagPayload {
    name: string;
}

export type UpdateCareerTagPayload = { name: string };

export interface CareerTagManagerModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}
