import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassLeavesView } from "@/views/classes/class-leaves-view";

export const metadata: Metadata = {
    title: UI_TEXT.classLeaves.pageTitle,
    description: UI_TEXT.classLeaves.pageDescription,
};

export default async function ClassLeavesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return (
        <AdminLayout title={UI_TEXT.classLeaves.headerTitle} subtitle={UI_TEXT.classLeaves.headerSubtitle} disableScroll={false}>
            <ClassLeavesView classId={id} />
        </AdminLayout>
    );
}
