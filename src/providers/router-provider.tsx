"use client";

import type { PropsWithChildren } from "react";
import type { Route } from "next";
import { RouterProvider } from "react-aria-components";
import { useAppRouter } from "@/hooks/use-app-router";

declare module "react-aria-components" {
    interface RouterConfig {
        routerOptions: NonNullable<Parameters<ReturnType<typeof useAppRouter>["push"]>[1]>;
    }
}

export const RouteProvider = ({ children }: PropsWithChildren) => {
    const router = useAppRouter();

    return <RouterProvider navigate={(path, options) => router.push(path as Route, options)}>{children}</RouterProvider>;
};
