import type { Metadata } from "next";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassLearningClientView } from "@/views/classes/class-learning-client-view";

interface PageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = UI_TEXT.metadata.classLearning;

export default async function ClassLearningPage({ params }: PageProps) {
    const { id } = await params;
    return <ClassLearningClientView id={id} />;
}
