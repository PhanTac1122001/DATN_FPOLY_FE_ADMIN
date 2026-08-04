import type { Route } from "next";
import { redirect } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string; courseId: string }>;
}

export default async function TypeDetailCoursePage({ params }: PageProps) {
    const { courseId } = await params;
    redirect(`/elearning/${courseId}` as Route);
}
