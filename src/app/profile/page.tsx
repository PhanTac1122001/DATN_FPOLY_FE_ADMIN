import { Suspense } from "react";
import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ProfileView } from "@/views/profile/profile-view";

export const metadata: Metadata = {
    title: UI_TEXT.metadata.profile.title,
    description: UI_TEXT.metadata.profile.description,
};

export default function ProfilePage() {
    return (
        <Suspense fallback={null}>
            <ProfileView />
        </Suspense>
    );
}
