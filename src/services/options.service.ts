import { httpClient } from "@/lib/http-client";
import type { FetchOptionsQuery, OptionItem } from "@/types/options.types";

export async function fetchOptions(url: string, query: FetchOptionsQuery = {}): Promise<OptionItem[]> {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.ids) params.set("ids", query.ids);

    const queryString = params.toString();
    const endpoint = queryString ? `${url}?${queryString}` : url;

    try {
        const data = await httpClient<OptionItem[] | { items: OptionItem[] }>(endpoint, { requireAuth: true });
        if (Array.isArray(data)) {
            return data;
        }
        return data.items ?? [];
    } catch {
        return [];
    }
}

export async function getOptions(url: string, search?: string): Promise<OptionItem[]> {
    return fetchOptions(url, { search });
}
