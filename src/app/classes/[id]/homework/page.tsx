import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassHomeworkReviewView } from "@/views/classes/class-homework-review-view";

export const metadata: Metadata = {
    title: UI_TEXT.classHomeworkReview.pageTitle,
    description: UI_TEXT.classHomeworkReview.pageDescription,
};

export default async function ClassHomeworkPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <AdminLayout title={UI_TEXT.classHomeworkReview.headerTitle} subtitle={UI_TEXT.classHomeworkReview.headerSubtitle} disableScroll={false}>
            <ClassHomeworkReviewView classId={id} />
        </AdminLayout>
    );
}
