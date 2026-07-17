import type { Metadata } from "next";
import { StaffListClientView } from "@/views/staff/staff-list-client-view";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: UI_TEXT.staff.title,
    description: UI_TEXT.staff.subtitle,
};

export default function StaffPage() {
    return <StaffListClientView />;
}
