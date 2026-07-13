export interface LoginRequest {
    email: string;
    password: string;
    recaptchaToken: string;
    clientId: string;
}

export interface VerifyOtpRequest {
    email: string;
    otp: string;
}

export interface LoginResponse {
    user: {
        id: string;
        email: string;
        fullName: string;
        avatarUrl?: string | null;
        role: string;
        permissions: string[];
    };
    accessToken: string;
    refreshToken: string;
}

export type RegisterResponse = (LoginResponse & { requiresVerification?: never }) | { requiresVerification: true; message: string };

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
}

export interface ResetPasswordRequest {
    token: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface UserProfile {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string | null;
    phoneNumber?: string | null;
    role: string;
    permissions: string[];
    createdAt?: string | Date;
    lastLoginAt?: string | Date | null;
}

export interface UpdateProfileRequest {
    fullName: string;
    phoneNumber?: string;
    avatarUrl?: string | null;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface GoogleLoginRequest {
    googleToken: string;
}

export type GoogleLoginResponse =
    { isNewUser: false; user: LoginResponse["user"]; accessToken: string; refreshToken: string } | { isNewUser: true; email: string; fullName: string };

export interface GoogleRegisterRequest {
    googleToken: string;
    phoneNumber: string;
}

export interface GoogleWindow extends Window {
    handleGoogleLoginCallback?: (response: { credential?: string }) => Promise<void>;
    initGoogleSignIn?: () => void;
    google?: {
        accounts: {
            id: {
                initialize: (config: {
                    client_id: string;
                    callback?: (response: { credential?: string }) => void;
                    context?: string;
                    ux_mode?: string;
                    auto_select?: boolean;
                }) => void;
                renderButton: (
                    parent: HTMLElement,
                    options: {
                        type?: string;
                        shape?: string;
                        theme?: string;
                        text?: string;
                        size?: string;
                        logo_alignment?: string;
                        width?: number;
                    },
                ) => void;
            };
        };
    };
}
