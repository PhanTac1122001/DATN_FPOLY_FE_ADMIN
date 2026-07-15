import type { TrainingTypeMock } from "@/types/type.types";

export const TRAINING_TYPES_MOCK: TrainingTypeMock[] = [
    {
        id: "1",
        code: "PTIT-CNTT-K24",
        name: "K24 - Kỹ sư Công nghệ thông tin",
        majors: "Chuyên ngành chung",
        createdAt: "13/08/2024",
        semesters: [
            { id: "1", semesterName: "Hướng dẫn", badgeColor: "warning" },
            { id: "2", semesterName: "Kỳ III", badgeColor: "orange" },
            { id: "3", semesterName: "Kỳ IV", badgeColor: "error" },
            { id: "4", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "5", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "2",
        code: "PTIT-CNTT-K23",
        name: "K23 - Kỹ sư Công nghệ thông tin",
        majors: "Chuyên ngành chung",
        createdAt: "16/10/2024",
        semesters: [
            { id: "1", semesterName: "Hướng dẫn", badgeColor: "warning" },
            { id: "2", semesterName: "Kỳ III", badgeColor: "orange" },
            { id: "3", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "4", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "3",
        code: "DA-BK",
        name: "Data Analysis (Bách Khoa)",
        majors: "Khoa học dữ liệu, Phân tích kinh doanh",
        createdAt: "23/09/2025",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "4",
        code: "DAKB-PBI",
        name: "Hệ Phân tích dữ liệu Kinh doanh Power BI",
        majors: "Power BI, Excel Advanced",
        createdAt: "09/01/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "5",
        code: "ES-DDT",
        name: "Embedded System (Điện-Điện Tử)",
        majors: "Hệ thống nhúng, Thiết kế vi mạch",
        createdAt: "26/01/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "6",
        code: "JS-FS",
        name: "Fullstack Javascript - Huấn luyện IT thực chiến doanh nghiệp",
        majors: "Lập trình Web",
        createdAt: "04/03/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "7",
        code: "BRSE-JPN",
        name: "Kỹ sư cầu nối – BrSE",
        majors: "Tiếng Nhật CNTT, Quản trị dự án...",
        createdAt: "10/04/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "8",
        code: "BA-NEU",
        name: "Bussiness Analyst (NEU)",
        majors: "Phân tích nghiệp vụ",
        createdAt: "08/05/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
    {
        id: "9",
        code: "ST-AI",
        name: "Khóa học Software Testing Fullskill with AI",
        majors: "Kiểm thử phần mềm",
        createdAt: "11/05/2026",
        semesters: [
            { id: "1", semesterName: "Kỳ I", badgeColor: "blue" },
            { id: "2", semesterName: "Kỳ II", badgeColor: "success" },
        ],
    },
];
