import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { UsersClientView } from "@/views/users/users-client-view";

export const metadata: Metadata = UI_TEXT.metadata.users;

export default function UsersPage() {
    return <UsersClientView />;
}
