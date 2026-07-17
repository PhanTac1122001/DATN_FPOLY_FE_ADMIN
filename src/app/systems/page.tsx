import type { Metadata } from "next";
import { SystemsClientView } from "@/views/systems/systems-client-view";
import { UI_TEXT } from "@/constants/ui-text.constants";

export const metadata: Metadata = {
    title: UI_TEXT.trainingSystem.title,
    description: UI_TEXT.trainingSystem.subtitle,
};

export default function SystemsPage() {
    return <SystemsClientView />;
}
