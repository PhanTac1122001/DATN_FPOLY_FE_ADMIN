/* eslint-disable no-restricted-syntax, react/jsx-no-literals */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layers, Plus, Trash2, Calendar, UserCheck } from "lucide-react";
import { getClassesList } from "@/services/student.service";
import { getCourseClassesByClass, mapCourseClass, deleteCourseClass } from "@/services/material.service";
import { getStaffList } from "@/services/staff.service";
import { toast } from "@/services/toast.service";
import { Button } from "@/components/base/buttons/button";

export function ClassesView() {
    const queryClient = useQueryClient();
    const [selectedClassId, setSelectedClassId] = useState("");

    // Form state
    const [courseId, setCourseId] = useState("");
    const [teacherId, setTeacherId] = useState("");
    const [taId, setTaId] = useState("");
    const [status, setStatus] = useState("PENDING");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { data: classes = [] } = useQuery({
        queryKey: ["classes-list"],
        queryFn: getClassesList,
    });

    const { data: courseMappings = [], isLoading: loadingMappings } = useQuery({
        queryKey: ["course-mappings", selectedClassId],
        queryFn: () => getCourseClassesByClass(selectedClassId),
        enabled: !!selectedClassId,
    });

    const { data: staffList = [] } = useQuery({
        queryKey: ["staff-list"],
        queryFn: getStaffList,
    });

    // Dummy courses for listing, or fetch from mock
    const courses = [
        { id: "60c72b2f9b1d8b2bad000003", name: "Lập trình NodeJS" },
        { id: "60c72b2f9b1d8b2bad000004", name: "Lập trình ReactJS" },
        { id: "60c72b2f9b1d8b2bad000005", name: "Lập trình Python FastAPI" }
    ];

    const addMappingMutation = useMutation({
        mutationFn: () => mapCourseClass({
            classId: selectedClassId,
            courseId,
            teacherId,
            taId: taId || undefined,
            status,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        }),
        onSuccess: () => {
            toast.success("Thành công", "Đã phân công môn học & giảng viên vào lớp");
            queryClient.invalidateQueries({ queryKey: ["course-mappings", selectedClassId] });
            // Reset
            setCourseId("");
            setTeacherId("");
            setTaId("");
        },
        onError: (e: any) => {
            toast.error("Lỗi", e.message || "Không thể phân công");
        }
    });

    const deleteMappingMutation = useMutation({
        mutationFn: deleteCourseClass,
        onSuccess: () => {
            toast.success("Thành công", "Đã xóa phân công môn học");
            queryClient.invalidateQueries({ queryKey: ["course-mappings", selectedClassId] });
        },
        onError: () => {
            toast.error("Lỗi", "Không thể xóa phân công");
        }
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
            {/* Classes list */}
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Layers className="size-5 text-wine" />
                    <span>Danh sách Lớp hành chính</span>
                </h3>
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-1">
                    {classes.map((cls) => (
                        <button
                            key={cls.id}
                            onClick={() => setSelectedClassId(cls.id)}
                            className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                                selectedClassId === cls.id
                                    ? "border-wine bg-wine/5 font-bold text-wine shadow-sm"
                                    : "border-slate-100 hover:bg-slate-50 text-slate-700"
                            }`}
                        >
                            <span>{cls.className}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{cls.status}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Course-Class details */}
            <div className="lg:col-span-2 bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-6">
                {selectedClassId ? (
                    <>
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-base font-black text-slate-800">Cấu hình Lớp học phần</h3>
                            <p className="text-xs text-slate-400 mt-0.5 font-semibold">Gán môn học và giảng dạy</p>
                        </div>

                        {/* Quick Assign Form */}
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Môn học *</label>
                                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                    <option value="">Chọn môn học...</option>
                                    {courses.map((c) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Giảng viên *</label>
                                <select value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                    <option value="">Giảng viên...</option>
                                    {staffList.map((st: any) => (
                                        <option key={st.id} value={st.id}>{st.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Trợ giảng (Optional)</label>
                                <select value={taId} onChange={(e) => setTaId(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                    <option value="">Trợ giảng...</option>
                                    {staffList.map((st: any) => (
                                        <option key={st.id} value={st.id}>{st.fullName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Trạng thái lớp phần *</label>
                                <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none">
                                    <option value="PENDING">PENDING</option>
                                    <option value="STUDYING">STUDYING</option>
                                    <option value="FINISHED">FINISHED</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Ngày bắt đầu</label>
                                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Ngày kết thúc</label>
                                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-white border border-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none" />
                            </div>
                            <div className="col-span-2 md:col-span-3 flex justify-end mt-2">
                                <Button
                                    onClick={() => addMappingMutation.mutate()}
                                    isLoading={addMappingMutation.isPending}
                                    isDisabled={!courseId || !teacherId}
                                    className="bg-wine border-none text-white gap-1 py-1.5 text-xs font-bold"
                                    iconLeading={<Plus className="size-3.5" />}
                                >
                                    Thêm phân công
                                </Button>
                            </div>
                        </div>

                        {/* List of mappings */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-slate-700">Môn học đã phân công</h4>
                            {loadingMappings ? (
                                <div className="size-6 animate-spin rounded-full border-2 border-slate-200 border-t-wine mx-auto" />
                            ) : courseMappings.length === 0 ? (
                                <p className="text-xs text-slate-400 italic text-center py-6">Chưa có môn học học phần nào được phân công</p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {courseMappings.map((m) => (
                                        <div key={m.id} className="flex items-center justify-between border border-slate-100 p-4 rounded-xl hover:bg-slate-50/50">
                                            <div>
                                                <span className="font-bold text-slate-800 text-sm">
                                                    {typeof m.courseId === "object" ? m.courseId?.name : courses.find((x) => x.id === m.courseId)?.name || m.courseId}
                                                </span>
                                                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-semibold">
                                                    <span className="flex items-center gap-0.5">
                                                        <UserCheck className="size-3" />
                                                        GV: {typeof m.teacherId === "object" ? m.teacherId?.fullName : m.teacherId}
                                                    </span>
                                                    {m.taId && (
                                                        <span>TA: {typeof m.taId === "object" ? m.taId?.fullName : m.taId}</span>
                                                    )}
                                                    <span className="flex items-center gap-0.5">
                                                        <Calendar className="size-3" />
                                                        {m.startDate ? new Date(m.startDate).toLocaleDateString() : ""} - {m.endDate ? new Date(m.endDate).toLocaleDateString() : ""}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">{m.status}</span>
                                                <button onClick={() => deleteMappingMutation.mutate(m.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center p-12 gap-2 h-full">
                        <Layers className="size-10 text-slate-200" />
                        <p className="text-sm font-black text-slate-500">Vui lòng chọn lớp hành chính ở thanh bên trái</p>
                    </div>
                )}
            </div>
        </div>
    );
}
