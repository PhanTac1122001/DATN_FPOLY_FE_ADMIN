import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { HomeClientView } from "@/views/home-client-view";

export const metadata: Metadata = {
    title: {
        absolute: UI_TEXT.metadata.layout.titleDefault,
    },
    description: UI_TEXT.metadata.home.description,
    alternates: {
        canonical: "/",
    },
};

export default function HomePage() {
    return <HomeClientView />;
}
