import { PAD_TWO_DIGITS, YOUTUBE_ID_LENGTH, YOUTUBE_MATCH_INDEX } from "@/constants/options.constants";

export function getYouTubeEmbedUrl(url?: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[YOUTUBE_MATCH_INDEX].length === YOUTUBE_ID_LENGTH ? `https://www.youtube.com/embed/${match[YOUTUBE_MATCH_INDEX]}` : null;
}

export function formatDateStr(dateStr?: string): string {
    if (!dateStr) return "10:09:38 22/1/2026";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const time = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        const date = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
        return `${time} ${date}`;
    } catch {
        return dateStr;
    }
}

export function formatUserName(userVal?: string, fallback = "Quản trị viên"): string {
    if (!userVal) return fallback;
    const trimmed = String(userVal).trim();
    if (!trimmed || trimmed.toLowerCase() === "admin" || /^[0-9a-fA-F]{24}$/.test(trimmed)) {
        return fallback;
    }
    return trimmed;
}

export function formatDateTime(dateVal?: string): string {
    if (!dateVal) return "---";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "---";
    const hours = String(d.getHours()).padStart(PAD_TWO_DIGITS, "0");
    const minutes = String(d.getMinutes()).padStart(PAD_TWO_DIGITS, "0");
    const seconds = String(d.getSeconds()).padStart(PAD_TWO_DIGITS, "0");
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
}
