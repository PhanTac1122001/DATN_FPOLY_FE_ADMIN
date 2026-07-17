import type { Metadata } from "next";
import { ClassesClientView } from "@/views/classes/classes-client-view";

export const metadata: Metadata = {
    title: "Phân công giảng dạy | LMS Portal",
    description: "Quản lý giảng dạy, phân giảng viên trợ giảng vào lớp hành chính",
};

export default function ClassesPage() {
    return <ClassesClientView />;
}
