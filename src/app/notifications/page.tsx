import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { NotificationsClientView } from "@/views/notifications/notifications-client-view";

export const metadata: Metadata = {
    title: `Quản lý Thông báo | ${UI_TEXT.common.appName}`,
    description: "Trang quản lý thông báo hệ thống LMS",
};

export default function NotificationsPage() {
    return <NotificationsClientView />;
}
