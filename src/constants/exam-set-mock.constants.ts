/* eslint-disable no-restricted-syntax */
import type { ExamSetMock } from "@/types/exam-set.types";

export const EXAM_SETS_MOCK: ExamSetMock[] = [
    {
        id: "ASM-0001",
        name: "FastAPI - Session10 - Lesson 05",
        questionCount: 15,
        createdAt: "02/07/2026",
        questions: [
            {
                id: "q1",
                text: "Giao thức mặc định của FastAPI là gì?",
                explanation: "Chọn giao thức truyền tải được FastAPI hỗ trợ tối ưu và mặc định khi chạy ứng dụng.",
                points: 10,
                options: [
                    { id: "o1", label: "A", text: "HTTP/1.1 và HTTP/2 qua ASGI", isCorrect: true },
                    { id: "o2", label: "B", text: "WSGI mặc định", isCorrect: false },
                    { id: "o3", label: "C", text: "Chỉ hỗ trợ FTP", isCorrect: false },
                ],
            },
            {
                id: "q2",
                text: "Thư viện ORM nào thường dùng nhất với FastAPI?",
                explanation: "Thư viện ORM phổ biến giúp kết nối cơ sở dữ liệu trong FastAPI.",
                points: 10,
                options: [
                    { id: "o4", label: "A", text: "SQLAlchemy", isCorrect: true },
                    { id: "o5", label: "B", text: "Django ORM", isCorrect: false },
                    { id: "o6", label: "C", text: "Prisma", isCorrect: false },
                ],
            },
        ],
    },
    {
        id: "ASM-0002",
        name: "FastAPI - Session10 - Lesson 04",
        questionCount: 12,
        createdAt: "02/07/2026",
        questions: [
            {
                id: "q1",
                text: "FastAPI hỗ trợ khai báo kiểu dữ liệu thông qua thư viện nào?",
                explanation: "Thư viện này cung cấp khả năng validation dữ liệu tự động cho các request body.",
                points: 10,
                options: [
                    { id: "o1", label: "A", text: "Pydantic", isCorrect: true },
                    { id: "o2", label: "B", text: "Marshmallow", isCorrect: false },
                    { id: "o3", label: "C", text: "Cerberus", isCorrect: false },
                ],
            },
        ],
    },
    {
        id: "ASM-0003",
        name: "FastAPI - Session10 - Lesson 03",
        questionCount: 10,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0004",
        name: "FastAPI - Session10 - Lesson 02",
        questionCount: 15,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0005",
        name: "Backend Fullskill Devops - SS7 LS5 (fixed)",
        questionCount: 5,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0006",
        name: "Backend Fullskill Devops - SS7 LS4 (fixed)",
        questionCount: 8,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0007",
        name: "Backend Fullskill Devops - SS7 LS3 (fixed)",
        questionCount: 7,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0008",
        name: "Backend Fullskill Devops - SS7 LS2 (fixed)",
        questionCount: 9,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0009",
        name: "Backend Fullskill Devops - SS7 LS1 (fixed)",
        questionCount: 10,
        createdAt: "02/07/2026",
        questions: [],
    },
    {
        id: "ASM-0010",
        name: "FastAPI - Session10 - Lesson 01",
        questionCount: 15,
        createdAt: "30/06/2026",
        questions: [],
    },
];
