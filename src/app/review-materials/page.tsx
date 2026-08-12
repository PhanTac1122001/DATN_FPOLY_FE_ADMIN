import { UI_TEXT } from "@/constants/ui-text.constants";
import { ReviewMaterialsView } from "@/views/review-materials/review-materials-view";

export const metadata = {
    title: UI_TEXT.reviewMaterials.pageTitle,
};

export default function ReviewMaterialsPage() {
    return <ReviewMaterialsView />;
}
