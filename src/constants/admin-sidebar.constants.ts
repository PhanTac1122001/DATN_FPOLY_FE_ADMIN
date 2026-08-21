import { Bell, BookOpen, Bookmark, FileCheck, FileText, PieChart, User, UserCheck, Users, Waypoints, Zap } from "lucide-react";
import { RoleEnum } from "@/types/staff.types";

export interface SidebarItem {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
    roles?: RoleEnum[];
}

export const dtItems: SidebarItem[] = [
    { label: "Hệ đào tạo", icon: PieChart, path: "/systems" },
    { label: "Môn học", icon: BookOpen, path: "/courses" },
    { label: "Roadmap môn học", icon: Waypoints, path: "/course-roadmap" },
    { label: "Lớp", icon: Users, path: "/classes" },
    { label: "Nhân viên", icon: UserCheck, path: "/staff", roles: [RoleEnum.ADMIN, RoleEnum.MANAGER] },
    { label: "Học viên", icon: User, path: "/users" },
    { label: "Thông báo", icon: Bell, path: "/notifications" },
    { label: "Duyệt đơn", icon: FileCheck, path: "/application-approvals" },
];

export const elearningItems: SidebarItem[] = [
    { label: "Hệ đào tạo", icon: Bookmark, path: "/type" },
    { label: "Quản lý bộ đề trắc nghiệm", icon: FileText, path: "/exams-sets-el" },
    { label: "Duyệt học liệu", icon: FileCheck, path: "/review-materials" },
    { label: "Quản lý bộ đề Quizzi", icon: Zap, path: "/quizzi-sets" },
];

export const diemItems: SidebarItem[] = [];
