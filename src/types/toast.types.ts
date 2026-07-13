export type ToastType = "success" | "error" | "warning" | "info";

export interface CustomToastProps {
    title: string;
    description?: string;
    type: ToastType;
    toastId: string | number;
}

export interface ToastConfig {
    backgroundColor: string;
    borderColor: string;
    iconColor: string;
}

export type ToastConfigMap = Record<ToastType, ToastConfig>;

export interface ToastOptions {
    id?: string;
    duration?: number;
}
