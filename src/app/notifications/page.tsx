import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { NotificationsClientView } from "@/views/notifications/notifications-client-view";

export const metadata: Metadata = {
    title: UI_TEXT.notifications.pageTitle,
    description: UI_TEXT.notifications.pageDesc,
};

export default function NotificationsPage() {
    return <NotificationsClientView />;
}
