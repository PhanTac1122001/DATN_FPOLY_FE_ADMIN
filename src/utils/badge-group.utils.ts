const sizeClasses = {
    root: "gap-1",
    addon: "px-2 py-0.5",
    icon: "size-4",
    dot: "size-1.5",
};

export function getBadgeGroupSizeClasses(_theme: string, _hasChildren: boolean, _hasIcon: boolean) {
    return {
        leading: { sm: sizeClasses, md: sizeClasses, lg: sizeClasses },
        trailing: { sm: sizeClasses, md: sizeClasses, lg: sizeClasses },
    };
}
