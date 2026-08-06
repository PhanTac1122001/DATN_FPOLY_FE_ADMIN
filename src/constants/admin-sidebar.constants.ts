import {
    Bell,
    BookOpen,
    Bookmark,
    Briefcase,
    Clock,
    FileCheck,
    FileSignature,
    FileText,
    FolderOpen,
    HelpCircle,
    Home,
    Network,
    PieChart,
    RefreshCw,
    Settings,
    TrendingUp,
    User,
    UserCheck,
    Users,
    Zap,
} from "lucide-react";

export const dtItems = [
    { label: "Hệ đào tạo", icon: PieChart, path: "/systems" },
    { label: "Môn học", icon: BookOpen, path: "/courses" },
    { label: "Lớp", icon: Users, path: "/classes" },
    { label: "Quản lý nhóm mẫu", icon: Network, path: "/groupwork" },
    { label: "Nhân viên", icon: UserCheck, path: "/staff" },
    { label: "Học viên", icon: User, path: "/users" },
    { label: "Phòng học", icon: Home, path: "/rooms" },
    { label: "Quản lý kỳ thi", icon: FileCheck, path: "/exams" },
    { label: "Quản lý ca thi", icon: Clock, path: "/exams-shifts" },
    { label: "Quản lý bộ đề", icon: FolderOpen, path: "/exams-sets" },
    { label: "Quản lý câu hỏi", icon: HelpCircle, path: "/exams-questions" },
    { label: "Chấm thi", icon: FileSignature, path: "/homework" },
    { label: "Quản lý điểm thi", icon: TrendingUp, path: "/grades" },
    { label: "Thống kê học tập", icon: PieChart, path: "/reports" },
    { label: "Thông báo", icon: Bell, path: "/notifications" },
    { label: "Đăng ký bảo vệ lại / thi lại", icon: FileText, path: "/reprotect" },
    { label: "Đăng ký học lại", icon: RefreshCw, path: "/relearn" },
    { label: "Quản lý R-Points", icon: Settings, path: "/rpoints" },
];

export const elearningItems = [
    { label: "Hệ đào tạo", icon: Bookmark, path: "/type" },
    { label: "Quản lý bộ đề trắc nghiệm", icon: FileText, path: "/exams-sets-el" },
    { label: "Duyệt học liệu", icon: FileCheck, path: "/review-materials" },
    { label: "Quản lý bộ đề Quizzi", icon: Zap, path: "/quizzi-sets" },
];

export const diemItems = [
    { label: "Quản lý đề tài", icon: FileSignature, path: "/project-topics" },
    { label: "Quản lý dự án", icon: Briefcase, path: "/student-projects" },
    { label: "Thống kê", icon: TrendingUp, path: "/grade-stats" },
    { label: "Chấm điểm cuối kỳ", icon: FileCheck, path: "/final-grading" },
    { label: "Duyệt điểm cuối kỳ", icon: UserCheck, path: "/approve-grades" },
    { label: "Quản lý nhập / sửa điểm", icon: Settings, path: "/manage-grades" },
];
