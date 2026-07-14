# Staff API Integration Design

This design spec addresses the issue where the admin client is unable to fetch data from the staff API at `http://103.118.29.137:6789/v1/staff`.

## Analysis & Problem Description

1. **Incorrect URL Paths on Client:**
   - The current calls in `staff.service.ts` query `/staff` and `/systems`.
   - The Next.js rewrite rules in `next.config.ts` only intercept routes matching `/api/:path*` (forwarding them to `http://103.118.29.137:6789/v1/:path*`).
   - Suffixes `/staff` and `/systems` directly fail with 404 since there is no server-side route at `http://localhost:3000/staff`.

2. **Backend Response Packaging:**
   - The backend uses a global `TransformInterceptor` that wraps all API responses into a standard wrapper:
     ```json
     {
       "statusCode": 200,
       "data": <Payload>
     }
     ```
   - The client-side queries in `staff.service.ts` expect the raw payload (`Staff[]` or `System[]`) directly. We need to unwrap `.data` from the response wrapper.

## Proposed Changes

### Component: Service Layer

We will update [staff.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/staff.service.ts) to correct the URLs and unwrap the response payload.

#### [MODIFY] [staff.service.ts](file:///c:/Users/Admin/Desktop/lmsPortal/lms-portal-admin/src/services/staff.service.ts)

- Change endpoint path `/staff` -> `/api/staff`
- Change endpoint path `/systems` -> `/api/systems`
- Extract `.data` property from the wrapped response returned by `httpClient`.

```typescript
import { httpClient } from "@/lib/http-client";
import { HttpMethod } from "@/types/api-types";
import type { Staff, System, CreateStaffRequest, UpdateStaffRequest } from "@/types/staff.types";

export async function getStaffList(): Promise<Staff[]> {
    const response = await httpClient<any>("/api/staff", { method: HttpMethod.GET });
    return response?.data || response || [];
}

export async function createStaff(data: CreateStaffRequest): Promise<Staff> {
    const response = await httpClient<any>("/api/staff", {
        method: HttpMethod.POST,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function updateStaff(id: string, data: UpdateStaffRequest): Promise<Staff> {
    const response = await httpClient<any>(`/api/staff/${id}`, {
        method: HttpMethod.PUT,
        body: JSON.stringify(data),
    });
    return response?.data || response;
}

export async function deleteStaff(id: string): Promise<void> {
    const response = await httpClient<any>(`/api/staff/${id}`, { method: HttpMethod.DELETE });
    return response?.data || response;
}

export async function getSystemsList(): Promise<System[]> {
    const response = await httpClient<any>("/api/systems", { method: HttpMethod.GET });
    return response?.data || response || [];
}
```

## Verification Plan

### Manual Verification
1. Open the Staff List page in the browser (admin dashboard).
2. Verify that the table correctly loads and displays staff records from the staging database (`http://103.118.29.137:6789/v1/staff`).
3. Verify that the KPI cards display accurate metrics (Total Staff, Teachers, Active, Admins) based on the database records.
4. Open the "Add Staff" modal and check that the "Systems Selection" list correctly loads available training systems (`http://103.118.29.137:6789/v1/systems`).
5. Perform actions like adding a staff member, updating details, and toggling status to ensure all operations function correctly over the staging API.
