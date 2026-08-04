import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { BlockTypeCatalogEntity } from "@/types/courseware.types";

export const coursewareService = {
    getBlockTypes: async (): Promise<BlockTypeCatalogEntity[]> => {
        return await httpClient<BlockTypeCatalogEntity[]>("/v1/staff/courseware/block-types", {
            method: HttpMethod.GET,
        });
    },
};
