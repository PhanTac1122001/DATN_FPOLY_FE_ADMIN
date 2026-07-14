export enum GenderEnum {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHER = "OTHER",
}

export enum StatusEnum {
    ACTIVE = "ACTIVE",
    DISABLE = "DISABLE",
}

export enum RoleEnum {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    TEACHER = "TEACHER",
    TEACHER_ASSISTANT = "TEACHER_ASSISTANT",
    ASSISTANT = "ASSISTANT",
}

export interface StaffRoleEmbed {
    name: string;
    weight: number;
}

export interface Staff {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    address?: string;
    avatar?: string | null;
    gender?: GenderEnum;
    status: StatusEnum;
    whitelist?: boolean;
    systemIds?: string[];
    roles: StaffRoleEmbed[];
    createdAt: string;
    updatedAt: string;
}

export interface System {
    id: string;
    systemCode: string;
    name: string;
    createdAt: string;
}

export interface CreateStaffRequest {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    avatar?: string;
    gender?: GenderEnum;
    status?: StatusEnum;
    whitelist?: boolean;
    systemIds?: string[];
    roles?: string[];
}

export type UpdateStaffRequest = Partial<CreateStaffRequest>;

export interface StaffModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff?: Staff | null;
}
