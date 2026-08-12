import { type EmbeddedQuestion, EmbeddedQuestionTypeEnum } from "@/types/material.types";

export const DEMO_EMBEDDED_QUESTIONS: EmbeddedQuestion[] = [
    {
        _id: "demo-1",
        content: "Trình bày khái niệm nhập (Input) và xuất (Output) trong Java",
        type: EmbeddedQuestionTypeEnum.SINGLE_CHOICE,
        points: 10,
        options: [
            { content: "Input là nhận dữ liệu từ bàn phím/file, Output là xuất dữ liệu ra màn hình/file", isCorrect: true },
            { content: "Input là xuất dữ liệu ra màn hình, Output là nhận dữ liệu từ người dùng", isCorrect: false },
            { content: "Cả Input và Output đều chỉ dữ liệu lưu vào bộ nhớ tạm", isCorrect: false },
            { content: "Input và Output là các câu lệnh vòng lặp trong Java", isCorrect: false },
        ],
    },
    {
        _id: "demo-2",
        content: "Trình bày các cách xuất dữ liệu ra màn hình trong Java. So sánh print(), println() và printf()",
        type: EmbeddedQuestionTypeEnum.SINGLE_CHOICE,
        points: 10,
        options: [
            { content: "print(): in không xuống dòng; println(): in có xuống dòng; printf(): in theo định dạng", isCorrect: true },
            { content: "print(): in và xuống dòng; println(): in theo định dạng; printf(): in màu chữ", isCorrect: false },
            { content: "Cả 3 hàm đều hoàn toàn giống hệt nhau không có sự khác biệt", isCorrect: false },
        ],
    },
];

export const DEMO_QUIZ_QUESTIONS = [
    {
        content: "Trong Java, thao tác Input là gì?",
        type: "SINGLE_CHOICE" as const,
        points: 20,
        options: [
            { content: "In dữ liệu ra màn hình", isCorrect: false },
            { content: "Nhận dữ liệu từ bàn phím hoặc nguồn bên ngoài", isCorrect: true },
            { content: "Lưu dữ liệu vào bộ nhớ", isCorrect: false },
            { content: "Xóa dữ liệu trong chương trình", isCorrect: false },
        ],
    },
    {
        content: "Đối tượng nào được dùng để xuất dữ liệu ra màn hình?",
        type: "SINGLE_CHOICE" as const,
        points: 20,
        options: [
            { content: "System.in", isCorrect: false },
            { content: "Scanner", isCorrect: false },
            { content: "System.out", isCorrect: true },
            { content: "InputStream", isCorrect: false },
        ],
    },
];
