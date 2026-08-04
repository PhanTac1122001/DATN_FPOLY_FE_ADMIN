export function isRouteActive(pathname: string, itemPath: string): boolean {
    if (itemPath === "/") {
        return pathname === "/";
    }
    return pathname === itemPath || pathname.startsWith(itemPath + "/");
}

export function isGroupActive(pathname: string, items: { path: string }[]): boolean {
    return items.some((item) => isRouteActive(pathname, item.path));
}
