"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Edit2, Eye, Plus, Radio, RefreshCw, Tag, Trash2, Users } from "lucide-react";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { Button } from "@/components/base/buttons/button";
import { Dropdown } from "@/components/base/dropdown/dropdown";
import { CreateNotificationModal } from "@/components/layout/admin/modals/create-notification-modal";
import { ManageCategoriesModal } from "@/components/layout/admin/modals/manage-categories-modal";
import { NotificationDetailModal } from "@/components/layout/admin/modals/notification-detail-modal";
import { ALL_CATEGORY_KEY, DEFAULT_NOTIFICATION_CATEGORIES } from "@/constants/notification.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { notificationService } from "@/services/notification.service";
import { toast } from "@/services/toast.service";
import type { LmsNotificationEntity, NotificationCategory } from "@/types/notification.types";

const defaultLimit = 10;

export function NotificationsView() {
    const [notifications, setNotifications] = useState<LmsNotificationEntity[]>([]);
    const [categories, setCategories] = useState<NotificationCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORY_KEY);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(defaultLimit);
    const [_totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    const [selectedNotification, setSelectedNotification] = useState<LmsNotificationEntity | null>(null);
    const [editingNotification, setEditingNotification] = useState<LmsNotificationEntity | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [notifRes, catRes] = await Promise.allSettled([
                notificationService.listStaffNotifications({ limit: 100, offset: 0 }),
                notificationService.listCategories(),
            ]);

            if (notifRes.status === "fulfilled") {
                const val = notifRes.value;
                const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : [];
                setNotifications(items);
                setTotalItems(val?.totalItems ?? items.length);
            }
            if (catRes.status === "fulfilled") {
                const val = catRes.value;
                const items = Array.isArray(val?.items) ? val.items : Array.isArray(val) ? val : [];
                const cats = items.length > 0 ? items : DEFAULT_NOTIFICATION_CATEGORIES;
                setCategories(cats);
            } else {
                setCategories(DEFAULT_NOTIFICATION_CATEGORIES);
            }
        } catch (err) {
            console.error("Failed to fetch notifications list", err);
            setCategories(DEFAULT_NOTIFICATION_CATEGORIES);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        if (!confirm(UI_TEXT.notifications.confirmDelete)) return;
        try {
            await notificationService.deleteStaffNotification(id);
            toast.success(UI_TEXT.common.successTitle, UI_TEXT.notifications.toastDeleteSuccess);
            fetchData();
        } catch (err) {
            console.error("Failed to delete notification", err);
            toast.error(UI_TEXT.common.errorTitle, UI_TEXT.notifications.toastDeleteError);
        }
    };

    const handleViewDetail = (item: LmsNotificationEntity) => {
        setSelectedNotification(item);
        setIsDetailOpen(true);
    };

    const handleEdit = (item: LmsNotificationEntity, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setEditingNotification(item);
        setIsCreateOpen(true);
    };

    const handleCreateNew = () => {
        setEditingNotification(null);
        setIsCreateOpen(true);
    };

    const formatDate = (dateStr: string) => {
        try {
            return format(new Date(dateStr), "dd/MM/yyyy HH:mm");
        } catch {
            return dateStr;
        }
    };

    // Filter notifications locally by search & category
    const filteredNotifications = notifications.filter((item) => {
        const matchesCategory = selectedCategory === ALL_CATEGORY_KEY || item.categoryCode === selectedCategory;
        const query = search.toLowerCase();
        const matchesSearch =
            !query ||
            item.title.toLowerCase().includes(query) ||
            item.message.toLowerCase().includes(query) ||
            (item.categoryLabel && item.categoryLabel.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    const totalPages = Math.ceil(filteredNotifications.length / limit) || 1;
    const paginatedNotifications = filteredNotifications.slice((page - 1) * limit, page * limit);

    return (
        <div className="flex flex-1 flex-col overflow-hidden bg-cream">
            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
                {/* Search & Actions Header */}
                <div className="flex flex-col gap-4 border-b border-line p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full sm:w-80">
                        <SearchFilters
                            search={search}
                            onSearchChange={(val) => {
                                setSearch(val);
                                setPage(1);
                            }}
                            searchPlaceholder={UI_TEXT.notifications.filterPlaceholder}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button
                            color="secondary-gray"
                            size="md"
                            onClick={() => setIsCategoriesOpen(true)}
                            className="gap-2 font-bold text-slate-700"
                            iconLeading={<Tag className="size-4" />}
                        >
                            <span>{UI_TEXT.notifications.manageCategoriesBtn}</span>
                        </Button>
                        <Button
                            color="secondary-gray"
                            size="md"
                            onClick={fetchData}
                            isDisabled={isLoading}
                            className="gap-2 font-bold text-slate-700"
                            iconLeading={<RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />}
                        >
                            <span>{UI_TEXT.notifications.refreshBtn}</span>
                        </Button>
                        <Button
                            color="primary"
                            size="md"
                            onClick={handleCreateNew}
                            className="gap-2 border-none bg-wine px-5 font-bold text-white shadow-md shadow-wine/20 hover:bg-wine-deep"
                            iconLeading={<Plus className="pointer-events-none size-5 shrink-0" />}
                        >
                            {UI_TEXT.notifications.createButton}
                        </Button>
                    </div>
                </div>

                {/* Category Chips / Tabs */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-slate-50/50 px-6 py-3">
                        <button
                            onClick={() => {
                                setSelectedCategory(ALL_CATEGORY_KEY);
                                setPage(1);
                            }}
                            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                selectedCategory === ALL_CATEGORY_KEY ? "bg-wine-bright text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                            {UI_TEXT.notifications.allTab}
                            {notifications.length}
                            {UI_TEXT.notifications.closeParen}
                        </button>
                        {categories.map((cat) => {
                            const count = notifications.filter((n) => n.categoryCode === cat.code).length;
                            return (
                                <button
                                    key={cat.code}
                                    onClick={() => {
                                        setSelectedCategory(cat.code);
                                        setPage(1);
                                    }}
                                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                                        selectedCategory === cat.code ? "bg-wine-bright text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {cat.label} {"("}
                                    {count}
                                    {")"}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Table Content */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full min-w-[900px] table-auto border-collapse text-left text-sm text-ink">
                        <thead>
                            <tr className="sticky top-0 z-10 border-b border-line bg-slate-50 text-[11px] font-bold tracking-wider text-muted uppercase">
                                <th className="w-16 px-6 py-4 text-center">{UI_TEXT.notifications.thStt}</th>
                                <th className="px-6 py-4">{UI_TEXT.notifications.thTitle}</th>
                                <th className="w-40 px-6 py-4">{UI_TEXT.notifications.thCategory}</th>
                                <th className="w-44 px-6 py-4">{UI_TEXT.notifications.thRecipient}</th>
                                <th className="w-44 px-6 py-4 text-center whitespace-nowrap">{UI_TEXT.notifications.thCreatedAt}</th>
                                <th className="sticky right-0 z-20 w-16 bg-slate-50 px-4 py-4 text-center whitespace-nowrap" />
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-wine" />
                                            <span>{UI_TEXT.notifications.loading}</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedNotifications.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted">
                                        {UI_TEXT.notifications.empty}
                                    </td>
                                </tr>
                            ) : (
                                paginatedNotifications.map((item, index) => {
                                    const isTargeted = Array.isArray(item.targetStudentIds) && item.targetStudentIds.length > 0;
                                    return (
                                        <tr key={item.id} className="group transition duration-150 hover:bg-slate-50">
                                            <td className="border-b border-line px-6 py-4 text-center font-semibold text-muted group-last:border-b-0">
                                                {(page - 1) * limit + index + 1}
                                            </td>
                                            <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                                <div className="font-bold text-slate-900">{item.title}</div>
                                                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{item.message}</p>
                                            </td>
                                            <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                                <span className="inline-flex rounded-md bg-wine-soft px-2.5 py-1 text-xs font-bold text-wine-deep">
                                                    {item.categoryLabel || item.categoryCode}
                                                </span>
                                            </td>
                                            <td className="border-b border-line px-6 py-4 group-last:border-b-0">
                                                {isTargeted ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                                        <Users className="size-3.5" />
                                                        <span>
                                                            {item.targetStudentIds?.length} {UI_TEXT.notifications.studentsSuffix}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                                        <Radio className="size-3.5" />
                                                        <span>{UI_TEXT.notifications.allStudents}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="border-b border-line px-6 py-4 text-center font-medium whitespace-nowrap text-muted group-last:border-b-0">
                                                {formatDate(item.createdAt)}
                                            </td>
                                            <td className="sticky right-0 z-20 border-b border-line bg-white px-4 py-4 text-center transition-colors group-last:border-b-0 group-hover:bg-slate-50">
                                                <div className="flex justify-center">
                                                    <Dropdown.Root>
                                                        <Dropdown.DotsButton className="rounded-lg p-1.5 text-muted hover:bg-cream" />
                                                        <Dropdown.Popover className="z-50 w-44 rounded-xl border border-line bg-white shadow-xl ring-1 ring-line">
                                                            <Dropdown.Menu>
                                                                <Dropdown.Item
                                                                    icon={Eye}
                                                                    onAction={() => handleViewDetail(item)}
                                                                    className={(state) =>
                                                                        "text-blue-600 [&_svg]:text-current " +
                                                                        (state.isFocused || state.isHovered ? "[&>div]:!bg-blue-50" : "")
                                                                    }
                                                                >
                                                                    <span>{UI_TEXT.notifications.viewDetail}</span>
                                                                </Dropdown.Item>
                                                                <Dropdown.Item
                                                                    icon={Edit2}
                                                                    onAction={() => handleEdit(item)}
                                                                    className={(state) =>
                                                                        "text-amber-600 [&_svg]:text-current " +
                                                                        (state.isFocused || state.isHovered ? "[&>div]:!bg-amber-50" : "")
                                                                    }
                                                                >
                                                                    <span>{UI_TEXT.notifications.editNotification || "Chỉnh sửa thông báo"}</span>
                                                                </Dropdown.Item>
                                                                <Dropdown.Separator className="my-1 bg-line" />
                                                                <Dropdown.Item
                                                                    icon={Trash2}
                                                                    onAction={() => handleDelete(item.id)}
                                                                    className={(state) =>
                                                                        "text-red-600 [&_svg]:text-current " +
                                                                        (state.isFocused || state.isHovered ? "[&>div]:!bg-red-50" : "")
                                                                    }
                                                                >
                                                                    <span>{UI_TEXT.notifications.deleteNotification}</span>
                                                                </Dropdown.Item>
                                                            </Dropdown.Menu>
                                                        </Dropdown.Popover>
                                                    </Dropdown.Root>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {filteredNotifications.length > 0 && (
                    <TablePagination
                        total={filteredNotifications.length}
                        page={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={(p) => setPage(p)}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(1);
                        }}
                        className="shrink-0 border-t border-line px-6 py-3.5"
                    />
                )}
            </div>

            {/* Modals */}
            <NotificationDetailModal notification={selectedNotification} isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} />
            <CreateNotificationModal
                isOpen={isCreateOpen}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingNotification(null);
                }}
                onSuccess={fetchData}
                notification={editingNotification}
            />
            <ManageCategoriesModal isOpen={isCategoriesOpen} onClose={() => setIsCategoriesOpen(false)} onSuccess={fetchData} />
        </div>
    );
}
