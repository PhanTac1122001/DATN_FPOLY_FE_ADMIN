# API Base Prefix Refactoring Design Document

**Date**: 2026-08-07
**Target**: `lms-portal-admin`

## Overview
Currently, API endpoint paths across service files in `src/services/` hardcode `/api/` (e.g. `/api/systems`, `/api/staff/courses`), while authentication endpoints use `/v1/` via `AUTH_PREFIX`.
This design centralizes API and Auth path prefixes into `.env` configuration and removes hardcoded `/api` strings from service implementations.

## Objectives
1. Configure `NEXT_PUBLIC_API_PREFIX` and `NEXT_PUBLIC_AUTH_PREFIX` in `.env` and `.env.example`.
2. Update `api-endpoints.constants.ts` to export `API_PREFIX` and `AUTH_PREFIX` driven by environment variables with fallback defaults (`/api` and `/v1`).
3. Refactor all service files in `src/services/` to remove `/api` from endpoint paths so that `httpClient` automatically prepends `API_PREFIX` via `formatApiPath`.
4. Ensure all Auth endpoints continue to use `AUTH_PREFIX` (`/v1`).

## Detailed Architectural Design

### 1. Environment Configuration (`.env` & `.env.example`)
```env
NEXT_PUBLIC_API_PREFIX=/api
NEXT_PUBLIC_AUTH_PREFIX=/v1
```

### 2. Endpoint Constants (`src/constants/api-endpoints.constants.ts`)
- `API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "/api"`
- `AUTH_PREFIX = process.env.NEXT_PUBLIC_AUTH_PREFIX || "/v1"`
- `formatApiPath(path)`:
  - If path starts with `http://`, `https://`, `API_PREFIX`, or `AUTH_PREFIX` (or `/v1`), return as-is.
  - Otherwise, format clean path and prepend `API_PREFIX`.

### 3. Services Refactoring (`src/services/*.ts`)
All service files using `/api/...` in `httpClient(...)` calls will have `/api` removed from the path string:
- `/api/systems` → `/systems`
- `/api/staff/courses` → `/staff/courses`
- `/api/staff/classes` → `/staff/classes`
- `/api/students` → `/students`
- ...and all other service endpoints.

Services using `API_ENDPOINTS.AUTH.*` or `AUTH_PREFIX` will use `/v1` through `AUTH_PREFIX`.

## Verification Plan
1. Type check: Run TypeScript check or build in `lms-portal-admin` to ensure no syntax/type errors.
2. Search audit: Verify that no service file retains hardcoded `/api/` prefixes.
