import type { ReactNode } from "react";

export interface CustomModalRootProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export interface CustomModalContentProps {
    children: ReactNode;
    className?: string;
}
