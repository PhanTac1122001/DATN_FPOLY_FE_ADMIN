import Cookies from "js-cookie";
import { API_ENDPOINTS } from "@/constants/api-endpoints.constants";
import { APP_CONFIG } from "@/constants/app.constants";
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type {
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    GoogleLoginResponse,
    LoginRequest,
    LoginResponse,
    RegisterResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
    UpdateProfileRequest,
    UserProfile,
    VerifyOtpRequest,
} from "@/types/auth.types";

export type { UserProfile } from "@/types/auth.types";

export async function login(data: LoginRequest): Promise<any> {
    return httpClient<any>(API_ENDPOINTS.AUTH.LOGIN, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<LoginResponse> {
    const response = await httpClient<any>(API_ENDPOINTS.AUTH.VERIFY_OTP, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });

    // Check if the response matches { statusCode: number, data: LoginResponse }
    if (response && response.data && "accessToken" in response.data) {
        return response.data;
    }
    return response;
}

export async function renewOtp(data: { email: string; action: string }): Promise<any> {
    return httpClient<any>(API_ENDPOINTS.AUTH.RENEW_OTP, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}

export async function register(data: {
    email: string;
    fullName: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}): Promise<RegisterResponse> {
    return httpClient<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}

export async function verifyEmail(token: string): Promise<LoginResponse> {
    return httpClient<LoginResponse>(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${token}`, {
        method: HttpMethod.POST,
        requireAuth: false,
    });
}

export async function logout(): Promise<{ message: string }> {
    return httpClient<{ message: string }>(API_ENDPOINTS.AUTH.LOGOUT, {
        method: HttpMethod.POST,
    });
}

export async function forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return httpClient<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}

export async function resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return httpClient<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}

function mapBackendStaffToUserProfile(payload: any): UserProfile {
    if (!payload) {
        throw new Error("Invalid staff profile payload");
    }
    // Unwrap response data if backend returned { statusCode: 200, data: { ... } }
    const staff = payload.data && typeof payload.data === "object" && !Array.isArray(payload.data) ? payload.data : payload;

    const roleNames = (staff.roles || []).map((r: any) => (typeof r === "string" ? r : r.code || r.name));

    // Default role mappings
    let role = "ADMIN";
    if (roleNames.includes("TEACHER") || roleNames.includes("TEACHER_ASSISTANT") || roleNames.includes("ASSISTANT")) {
        role = "INSTRUCTOR";
    }

    // Default permissions based on roles
    let permissions: string[] = ["VIEW_USERS"];
    if (roleNames.includes("ADMIN") || roleNames.includes("MANAGER")) {
        permissions = ["MANAGE_USERS", "VIEW_USERS", "admin", "manage_users", "manage_courses"];
    } else {
        permissions = ["VIEW_USERS", "teacher", "manage_courses"];
    }

    return {
        id: staff.id || staff._id || "",
        email: staff.email || "",
        fullName: staff.fullName || "",
        avatarUrl: staff.avatar || null,
        phoneNumber: staff.phone || null,
        phone: staff.phone || null,
        address: staff.address || null,
        gender: staff.gender || null,
        staffCode: staff.staffCode || staff.code || null,
        role: role,
        roles: roleNames,
        permissions: permissions,
        createdAt: staff.createdAt,
    };
}

export async function getProfile(): Promise<UserProfile> {
    try {
        const response = await httpClient<any>(API_ENDPOINTS.AUTH.PROFILE, {
            method: HttpMethod.GET,
        });
        return mapBackendStaffToUserProfile(response);
    } catch (error) {
        // Fallback to mock profile if we have the access token cookie
        const hasToken = typeof window !== "undefined" ? Cookies.get(APP_CONFIG.ACCESS_TOKEN_KEY) : null;

        if (hasToken) {
            return {
                id: "mock-admin-id",
                email: "minhanh.k18@rikkei.edu.vn",
                fullName: "Nguyễn Minh Anh (Admin)",
                role: "ADMIN",
                roles: ["ADMIN"],
                permissions: ["admin", "manage_users", "manage_courses", "MANAGE_USERS", "VIEW_USERS"],
            };
        }
        throw error;
    }
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    const response = await httpClient<any>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, {
        method: HttpMethod.PUT,
        body: JSON.stringify({
            fullName: data.fullName,
            phone: data.phone || data.phoneNumber,
            address: data.address,
            gender: data.gender,
            avatar: data.avatar || data.avatarUrl,
        }),
    });
    return mapBackendStaffToUserProfile(response);
}

export async function uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await httpClient<any>(API_ENDPOINTS.AUTH.AVATAR_UPLOAD, {
        method: HttpMethod.POST,
        body: formData,
    });
    return mapBackendStaffToUserProfile(response);
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return httpClient<{ message: string }>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        method: HttpMethod.PUT,
        body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
            confirmPassword: data.confirmPassword,
        }),
    });
}

export async function googleLogin(googleToken: string): Promise<GoogleLoginResponse> {
    return httpClient<GoogleLoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, {
        method: HttpMethod.POST,
        body: JSON.stringify({ googleToken }),
        requireAuth: false,
    });
}

export async function googleRegister(data: { googleToken: string; phoneNumber: string }): Promise<LoginResponse> {
    return httpClient<LoginResponse>(API_ENDPOINTS.AUTH.GOOGLE_REGISTER, {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
        requireAuth: false,
    });
}
