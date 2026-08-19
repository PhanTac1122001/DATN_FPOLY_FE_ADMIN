import type { Metadata } from "next";
import { AdminLayout } from "@/components/layout/admin/admin-layout";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { ClassResourcesView } from "@/views/classes/class-resources-view";

export const metadata: Metadata = {
    title: UI_TEXT.classes.resourcesMetaTitle,
    description: UI_TEXT.classes.resourcesMetaDesc,
};

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

export default async function ClassResourcesPage({ params }: PageProps) {
    const { id } = await params;
    return (
        <AdminLayout title={UI_TEXT.classes.title} subtitle={UI_TEXT.classes.subtitle} disableScroll={false}>
            <ClassResourcesView classId={id} />
        </AdminLayout>
    );
}
