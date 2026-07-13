export interface OptionItem {
    id: string;
    label: string;
}

export interface OptionsQueryParams {
    search?: string;
    limit?: number;
}

export interface FetchOptionsQuery {
    search?: string;
    page?: number;
    limit?: number;
    ids?: string;
}
