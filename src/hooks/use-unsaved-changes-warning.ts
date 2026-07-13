import { useEffect, useState } from "react";
import NProgress from "nprogress";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

export const useUnsavedChangesWarning = (isDirty: boolean, isOpen: boolean) => {
    const [isConfirmCloseOpen, setIsConfirmCloseOpen] = useState(false);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
    const { setIsDirty } = useUnsavedChangesStore();

    useEffect(() => {
        return () => {
            setPendingAction(null);
            setIsConfirmCloseOpen(false);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setIsDirty(isDirty);
        } else {
            setIsDirty(false);
        }

        // Cleanup on unmount to prevent unsaved changes modal popping up on subsequent navigations
        return () => {
            setIsDirty(false);
        };
    }, [isDirty, isOpen, setIsDirty]);

    // Effect to warn user when they try to close/refresh the tab with unsaved changes
    useEffect(() => {
        if (!isOpen || !isDirty) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = ""; // This is required for Chrome/Edge/Firefox to show the prompt
            return "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isOpen, isDirty]);

    const handleAttemptClose = (forceCloseCallback: () => void) => {
        if (isDirty) {
            setPendingAction(() => forceCloseCallback);
            setIsConfirmCloseOpen(true);
        } else {
            forceCloseCallback();
        }
    };

    const handleConfirm = () => {
        if (pendingAction) {
            pendingAction();
        }
        setPendingAction(null);
        setIsConfirmCloseOpen(false);
    };

    const handleCancel = () => {
        NProgress.done();
        setPendingAction(null);
        setIsConfirmCloseOpen(false);
    };

    return {
        isConfirmCloseOpen,
        setIsConfirmCloseOpen,
        handleAttemptClose,
        handleConfirm,
        handleCancel,
    };
};
