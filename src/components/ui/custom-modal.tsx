"use client";

import { Dialog, Modal, ModalOverlay } from "react-aria-components";
import { cn } from "@/lib/utils";
import type { CustomModalContentProps, CustomModalRootProps } from "@/types/custom-modal.types";

export { Dialog, Modal, ModalOverlay };

function Root({ open, onOpenChange, children }: CustomModalRootProps) {
    return (
        <ModalOverlay isOpen={open} onOpenChange={onOpenChange} isDismissable className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            {children}
        </ModalOverlay>
    );
}

function Content({ children, className }: CustomModalContentProps) {
    return <Modal className={cn("w-full max-w-lg rounded-xl bg-white shadow-xl outline-none", className)}>{children}</Modal>;
}

export const CustomModal = {
    Root,
    Content,
};
