"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderOpen, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/application/modals/confirm-modal";
import { Button } from "@/components/base/buttons/button";
import { Select } from "@/components/base/select/select";
import { CreateEditResourceModal } from "@/components/classes/create-edit-resource-modal";
import { UI_TEXT } from "@/constants/ui-text.constants";
import { getClassDetail } from "@/services/class.service";
import { deleteLearningResource, getClassLearningResources } from "@/services/learning-resource.service";
import { getSessionsByCourse } from "@/services/material.service";
import { toast } from "@/services/toast.service";
import type { ClassDetail, ClassResourcesViewProps } from "@/types/class.types";
import type { LearningResourceItem } from "@/types/learning-resource.types";

export function ClassResourcesView({ classId }: ClassResourcesViewProps) {
    const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
    const [resources, setResources] = useState<LearningResourceItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [filterCourseId, setFilterCourseId] = useState("");
    const [filterSessionId, setFilterSessionId] = useState("");
    const [filterSessions, setFilterSessions] = useState<Array<{ id: string; name: string }>>([]);

    // Modal state for Create/Edit Main Resource
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [resourceToEdit, setResourceToEdit] = useState<LearningResourceItem | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Confirm Delete Modal state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    // Initial load
    const fetchInitialData = useCallback(async () => {
        try {
            setIsLoading(true);
            const detail = await getClassDetail(classId).catch(() => null);
            if (detail) {
                setClassDetail(detail);
                if (detail.courses && detail.courses.length > 0) {
                    const firstItem = detail.courses[0] as unknown as Record<string, unknown>;
                    const courseObj = (firstItem.courseId || firstItem) as Record<string, unknown>;
                    const firstCourseId = String(courseObj._id || courseObj.id || courseObj || "");
                    setFilterCourseId(firstCourseId);
                }
            }
        } catch (err: unknown) {
            console.error("Error fetching class resources:", err);
        } finally {
            setIsLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        void fetchInitialData();
    }, [fetchInitialData]);

    // Load filter sessions when filterCourseId changes
    useEffect(() => {
        if (!filterCourseId) {
            setFilterSessions([]);
            setFilterSessionId("");
            return;
        }

        const loadSessions = async () => {
            try {
                const list = await getSessionsByCourse(filterCourseId);
                const mapped = (Array.isArray(list) ? list : []).map((s: unknown) => {
                    const item = s as Record<string, unknown>;
                    return {
                        id: String(item._id || item.id),
                        name: String(item.name || `Buổi ${item.position || 1}`),
                    };
                });
                setFilterSessions(mapped);

                if (mapped.length > 0) {
                    setFilterSessionId(mapped[0].id);
                } else {
                    setFilterSessionId("");
                }
            } catch (err: unknown) {
                console.error("Error loading filter sessions:", err);
                setFilterSessions([]);
                setFilterSessionId("");
            }
        };

        void loadSessions();
    }, [filterCourseId]);

    // Re-fetch resources strictly when BOTH filterCourseId and filterSessionId are set
    const fetchFilteredResources = useCallback(async () => {
        if (!filterCourseId || !filterSessionId) {
            setResources([]);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const resList = await getClassLearningResources(classId, {
                courseId: filterCourseId,
                sessionId: filterSessionId,
            });
            setResources(resList);
        } catch (err: unknown) {
            console.error("Error filtering resources:", err);
            setResources([]);
        } finally {
            setIsLoading(false);
        }
    }, [classId, filterCourseId, filterSessionId]);

    useEffect(() => {
        void fetchFilteredResources();
    }, [fetchFilteredResources]);

    const handleOpenDeleteModal = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;

        try {
            setDeletingId(itemToDelete);
            await deleteLearningResource(itemToDelete);
            toast.success(UI_TEXT.classResourcesView.deleteConfirmTitle);
            setResources((prev) => prev.filter((item) => item._id !== itemToDelete));
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : UI_TEXT.classResourcesView.toastDeleteError;
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    const openCreateModal = () => {
        setResourceToEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (item: LearningResourceItem) => {
        setResourceToEdit(item);
        setIsModalOpen(true);
    };

    // Extract course options from classDetail
    const courseOptions = (classDetail?.courses || []).map((c: unknown) => {
        const item = c as Record<string, unknown>;
        const courseObj = (item.courseId || item) as Record<string, unknown>;
        const id = courseObj._id || courseObj.id || courseObj;
        const name = courseObj.name || item.courseName || item.name || "Môn học";
        return { id: String(id), name: String(name) };
    });

    const className = classDetail?.class?.name || classDetail?.name || "";
    const canCreate = Boolean(filterCourseId && filterSessionId);

    return (
        <div className="flex min-h-[calc(100vh-140px)] w-full flex-1 flex-col gap-4 py-2">
            {/* Header Card with Same Row Controls */}
            <div className="flex flex-col gap-3.5 rounded-2xl border border-slate-100 bg-white p-5 shadow-2xs">
                {/* Title */}
                <div className="text-xs font-bold text-slate-800">{className}</div>

                {/* Single Horizontal Row for Selects and Create Button */}
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="flex flex-wrap items-end gap-3">
                        {/* Course Select */}
                        <div className="w-[260px]">
                            <Select
                                label={UI_TEXT.classResourcesView.selectCourseLabel}
                                selectedKey={filterCourseId || null}
                                onSelectionChange={(key) => key && setFilterCourseId(String(key))}
                                items={courseOptions.map((c) => ({ id: c.id, label: c.name }))}
                                size="md"
                                placeholder={UI_TEXT.classResourcesView.selectCoursePlaceholder}
                                isClearable={false}
                                className="w-full"
                            >
                                {(item) => <Select.Item id={item.id} label={item.label} />}
                            </Select>
                        </div>

                        {/* Session Select */}
                        <div className="w-[260px]">
                            <Select
                                label={UI_TEXT.classResourcesView.selectSessionLabel}
                                selectedKey={filterSessionId || null}
                                onSelectionChange={(key) => key && setFilterSessionId(String(key))}
                                items={filterSessions.map((s) => ({ id: s.id, label: s.name }))}
                                size="md"
                                placeholder={UI_TEXT.classResourcesView.selectSessionPlaceholder}
                                isDisabled={!filterCourseId || filterSessions.length === 0}
                                isClearable={false}
                                className="w-full"
                            >
                                {(item) => <Select.Item id={item.id} label={item.label} />}
                            </Select>
                        </div>
                    </div>

                    {/* Main Action Button - ONLY SHOW WHEN BOTH COURSE & SESSION ARE SELECTED */}
                    {canCreate && (
                        <Button
                            color="primary"
                            size="md"
                            onClick={openCreateModal}
                            className="shrink-0 gap-2 rounded-full bg-wine text-xs font-bold text-white hover:bg-wine-bright"
                            iconLeading={<Plus className="size-4" />}
                        >
                            {UI_TEXT.classResourcesView.createBtnText}
                        </Button>
                    )}
                </div>
            </div>

            {/* Table / Empty List View */}
            {isLoading ? (
                <div className="flex min-h-[360px] flex-1 items-center justify-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-8">
                    <Loader2 className="size-8 animate-spin text-wine" />
                    <p className="text-sm font-semibold text-slate-500">{UI_TEXT.classResourcesView.loadingResourcesText}</p>
                </div>
            ) : resources.length === 0 ? (
                <div className="flex min-h-[360px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                        <FolderOpen className="size-7" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-800">{UI_TEXT.classResourcesView.emptyResourcesTitle}</h3>
                        <p className="mt-1 max-w-sm text-xs text-slate-500">
                            {canCreate ? UI_TEXT.classResourcesView.emptyResourcesCreatePrompt : UI_TEXT.classResourcesView.emptyResourcesSelectPrompt}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="border-b border-slate-200/80 bg-slate-50 text-[12px] font-bold text-slate-900">
                                <tr>
                                    <th className="w-14 px-4 py-3 text-center">{UI_TEXT.classResourcesView.thStt}</th>
                                    <th className="px-4 py-3">{UI_TEXT.classResourcesView.thLinkRecord}</th>
                                    <th className="px-4 py-3">{UI_TEXT.classResourcesView.thExtraMaterials}</th>
                                    <th className="w-24 px-4 py-3 text-center">{UI_TEXT.classResourcesView.thActions}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-normal">
                                {resources.map((item, index) => {
                                    const hasVideo = Boolean(item.videoUrl?.trim());
                                    const hasDoc = Boolean(item.documentUrl?.trim());

                                    return (
                                        <tr key={item._id} className="transition hover:bg-slate-50/50">
                                            {/* STT */}
                                            <td className="px-4 py-4 text-center font-semibold text-slate-700">{index + 1}</td>

                                            {/* Link record */}
                                            <td className="px-4 py-4">
                                                {hasVideo ? (
                                                    <a
                                                        href={item.videoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-xs font-normal break-all text-slate-700 hover:text-wine hover:underline"
                                                    >
                                                        {item.videoUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">{"---"}</span>
                                                )}
                                            </td>

                                            {/* Học liệu bổ sung */}
                                            <td className="px-4 py-4">
                                                {hasDoc ? (
                                                    <a
                                                        href={item.documentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block text-xs font-normal break-all text-slate-700 hover:text-wine hover:underline"
                                                    >
                                                        {item.documentUrl}
                                                    </a>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">{"---"}</span>
                                                )}
                                            </td>

                                            {/* Hành động (Edit & Delete Button) */}
                                            <td className="px-4 py-4 text-center">
                                                <div className="inline-flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition duration-200 hover:bg-emerald-600 hover:text-white"
                                                        title={UI_TEXT.classResourcesView.editTooltip}
                                                    >
                                                        <Pencil className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDeleteModal(item._id)}
                                                        disabled={deletingId === item._id}
                                                        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-rose-50 text-rose-600 transition duration-200 hover:bg-rose-600 hover:text-white disabled:opacity-50"
                                                        title={UI_TEXT.classes.deleteClass}
                                                    >
                                                        {deletingId === item._id ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal: Create/Edit Main Resource */}
            <CreateEditResourceModal
                isOpen={isModalOpen}
                classId={classId}
                courseId={filterCourseId}
                sessionId={filterSessionId}
                resourceToEdit={resourceToEdit}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    void fetchFilteredResources();
                }}
            />

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false);
                    setItemToDelete(null);
                }}
                onConfirm={handleConfirmDelete}
                title={UI_TEXT.classResourcesView.deleteConfirmTitle}
                message={UI_TEXT.classResourcesView.deleteConfirmDesc}
                confirmText={UI_TEXT.classResourcesView.deleteConfirmBtn}
                cancelText={UI_TEXT.classResourcesView.cancelBtn}
                variant="danger"
                isLoading={Boolean(deletingId)}
            />
        </div>
    );
}
