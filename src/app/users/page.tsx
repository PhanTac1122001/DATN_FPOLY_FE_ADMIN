import type { Metadata } from "next";
import { UsersClientView } from "@/views/users/users-client-view";

export const metadata: Metadata = {
    title: "Quản lý học viên | LMS Portal",
    description: "Danh sách học viên và quản lý xếp lớp học viên",
};

export default function UsersPage() {
    return <UsersClientView />;
}
