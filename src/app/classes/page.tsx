import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassesClientView } from "@/views/classes/classes-client-view";

export const metadata: Metadata = {
    title: `${UI_TEXT.classes.title} | ${UI_TEXT.common.appName}`,
    description: UI_TEXT.classes.subtitle,
};

export default function ClassesPage() {
    return <ClassesClientView />;
}
