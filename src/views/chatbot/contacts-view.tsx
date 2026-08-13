"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { ContactModal } from "@/components/application/modals/contact-modal";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { SearchFilters } from "@/components/application/search-filters/search-filters";
import { DEFAULT_INITIAL_LIMIT, DEFAULT_INITIAL_PAGE, DEFAULT_SEARCH_DEBOUNCE_MS } from "@/constants/table.constants";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { deleteContact, getContacts } from "@/services/chatbot.service";
import { toast } from "@/services/toast.service";
import type { Contact } from "@/types/chatbot.types";

export function ContactsView() {
    const t = UI_TEXT.chatbot;
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [page, setPage] = useState(DEFAULT_INITIAL_PAGE);
    const [limit, setLimit] = useState(DEFAULT_INITIAL_LIMIT);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState<Contact | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(DEFAULT_INITIAL_PAGE);
        }, DEFAULT_SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["chatbot-contacts", debouncedSearch, page, limit],
        queryFn: () => getContacts({ search: debouncedSearch, page, limit }),
    });

    const items = data?.items ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.ceil(total / limit) || 1;

    const invalidate = () => queryClient.invalidateQueries({ queryKey: ["chatbot-contacts"] });

    const openCreate = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    const openEdit = (contact: Contact) => {
        setSelected(contact);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setIsDeleting(true);
            await deleteContact(deleteTarget._id);
            toast.success(UI_TEXT.common.successTitle, t.toastDeleteContactSuccess);
            setDeleteTarget(null);
            invalidate();
        } catch (err: unknown) {
            const errMsg = err instanceof Error ? err.message : UI_TEXT.common.genericError;
            toast.error(UI_TEXT.common.errorTitle, errMsg);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
            <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <SearchFilters search={search} onSearchChange={setSearch} searchPlaceholder={t.searchContactPlaceholder} />
                <button
                    type="button"
                    onClick={openCreate}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-wine px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-wine/20 transition hover:bg-wine-deep"
                >
                    <Plus className="size-5 shrink-0" />
                    {t.addContact}
                </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-4">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                            <p className="text-sm font-semibold text-slate-500">{t.loading}</p>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex h-full min-h-[300px] flex-col items-center justify-center gap-2 p-8 text-center">
                            <AlertTriangle className="size-10 text-slate-300" />
                            <p className="text-base font-bold text-slate-800">{t.noDataTitle}</p>
                            <p className="text-sm text-slate-500">{t.noContactDesc}</p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[820px] table-auto border-collapse text-left text-sm text-slate-700">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">
                                    <th className="w-16 px-6 py-4 text-center">{t.thStt}</th>
                                    <th className="w-36 px-6 py-4">{t.thCode}</th>
                                    <th className="px-6 py-4">{t.thName}</th>
                                    <th className="w-40 px-6 py-4">{t.thDepartment}</th>
                                    <th className="w-28 px-6 py-4 text-center">{t.thDefault}</th>
                                    <th className="w-28 px-6 py-4 text-center">{t.thActive}</th>
                                    <th className="w-40 px-6 py-4 text-center">{t.thActions}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((contact, index) => (
                                    <tr key={contact._id} className="group transition duration-150 hover:bg-slate-50/40">
                                        <td className="border-b border-slate-100 px-6 py-4 text-center font-semibold text-slate-400">
                                            {(page - 1) * limit + index + 1}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-600 uppercase">{contact.code}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 font-bold text-slate-900">{contact.name}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-slate-500">{contact.department}</td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center">
                                            {contact.isDefault && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-wine">
                                                    <Star className="size-3" />
                                                    {t.badgeDefault}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4 text-center">
                                            {contact.isActive ? (
                                                <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                                                    {t.active}
                                                </span>
                                            ) : (
                                                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                                    {t.inactive}
                                                </span>
                                            )}
                                        </td>
                                        <td className="border-b border-slate-100 px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(contact)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                                                >
                                                    <Pencil className="size-3.5" />
                                                    {t.edit}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTarget(contact)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                                                >
                                                    <Trash2 className="size-3.5" />
                                                    {t.delete}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {!isLoading && items.length > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={limit}
                        onPageChange={setPage}
                        onLimitChange={(l) => {
                            setLimit(l);
                            setPage(DEFAULT_INITIAL_PAGE);
                        }}
                        className="shrink-0 border-t border-slate-100 px-6 py-4"
                    />
                )}
            </div>

            <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={invalidate} editingContact={selected} />
            <ConfirmModal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title={t.deleteContactTitle}
                message={t.deleteContactMessage}
                confirmText={t.confirmDelete}
                cancelText={UI_TEXT.common.cancel}
                variant="danger"
                isLoading={isDeleting}
                icon={<Trash2 className="size-6 text-red-500" />}
            />
        </div>
    );
}
