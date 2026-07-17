import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { TypeClientView } from "@/views/type/type-client-view";

export const metadata: Metadata = {
    title: `${UI_TEXT.trainingTypesEl.title} | ${UI_TEXT.common.appName}`,
    description: UI_TEXT.trainingTypesEl.subtitle,
};

export default function TypePage() {
    return <TypeClientView />;
}
