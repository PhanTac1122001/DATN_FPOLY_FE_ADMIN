"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Plus, FileSpreadsheet, Layers, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/base/buttons/button";
import { TablePagination } from "@/components/application/pagination/table-pagination";
import { getStudentsReport, getStudentsList, deleteStudent } from "@/services/student.service";
import { getSystemsList } from "@/services/system.service";
import { toast } from "@/services/toast.service";
import type { Student } from "@/types/student.types";
import { StudentFormModal } from "@/components/application/modals/student-form-modal";
import { ExcelImportModal } from "@/components/application/modals/excel-import-modal";
import { ClassEnrollmentsModal } from "@/components/application/modals/class-enrollments-modal";

export function UsersView() {
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [studentCode, setStudentCode] = useState("");
    const [systemId, setSystemId] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modal States
    const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
    const [isExcelOpen, setIsExcelOpen] = useState(false);
    const [isEnrollOpen, setIsEnrollOpen] = useState(false);
    const [activeStudent, setActiveStudent] = useState<Student | null>(null);

    const { data: report = [] } = useQuery({
        queryKey: ["students-report"],
        queryFn: getStudentsReport,
    });

    const { data: systems = [] } = useQuery({
        queryKey: ["systems"],
        queryFn: getSystemsList,
    });

    const { data: studentsData, isLoading } = useQuery({
        queryKey: ["students-list", name, studentCode, systemId, status, page, pageSize],
        queryFn: () => getStudentsList({
            page,
            pageSize,
            name: name || undefined,
            studentCode: studentCode || undefined,
            systemId: systemId || undefined,
            studentStatusSearch: status || undefined,
        }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStudent,
        onSuccess: () => {
            toast.success("Thành công", "Đã xóa học viên");
            queryClient.invalidateQueries({ queryKey: ["students-list"] });
            queryClient.invalidateQueries({ queryKey: ["students-report"] });
        },
        onError: () => {
            toast.error("Lỗi", "Không thể xóa học viên");
        }
    });

    const handleDelete = (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa học viên này?")) {
            deleteMutation.mutate(id);
        }
    };

    const items = studentsData?.items || [];
    const total = studentsData?.total || 0;
    const totalPages = Math.ceil(total / pageSize) || 1;

    return (
        <div className="flex w-full flex-1 flex-col gap-6 overflow-hidden">
            {/* Report Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {report.slice(0, 4).map((r, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-4.5 shadow-xs">
                        <span className="text-[10px] font-black text-slate-400 uppercase">{r.systemName || "Hệ Khác"}</span>
                        <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-black text-slate-800">{r.total}</span>
                            <span className="text-xs font-semibold text-slate-500">học viên</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs items-center">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tìm theo họ tên..."
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-48 bg-white"
                />
                <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Mã học viên..."
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-36 bg-white"
                />
                <select
                    value={systemId}
                    onChange={(e) => setSystemId(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-44 bg-white"
                >
                    <option value="">Tất cả hệ học</option>
                    {systems.map((sys) => (
                        <option key={sys.id} value={sys.id}>{sys.name}</option>
                    ))}
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm focus:border-wine focus:outline-none w-44 bg-white"
                >
                    <option value="">Tất cả trạng thái</option>
                    {["ĐANG HỌC", "BẢO LƯU", "CHỜ BẢO LƯU", "BỎ HỌC", "TỐT NGHIỆP", "TỐT NGHIỆP SỚM", "ĐÌNH CHỈ"].map((st) => (
                        <option key={st} value={st}>{st}</option>
                    ))}
                </select>
                <div className="ml-auto flex gap-2">
                    <Button
                        color="secondary"
                        onClick={() => setIsExcelOpen(true)}
                        className="gap-1.5 text-slate-700 bg-white border border-slate-200"
                        iconLeading={<FileSpreadsheet className="size-4" />}
                    >
                        Nhập Excel
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            setActiveStudent(null);
                            setIsStudentModalOpen(true);
                        }}
                        className="gap-1.5 bg-wine border-none text-white hover:bg-wine-deep"
                        iconLeading={<Plus className="size-4" />}
                    >
                        Thêm học viên
                    </Button>
                </div>
            </div>

            {/* Grid */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-xs flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex min-h-[250px] items-center justify-center">
                            <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-wine" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex min-h-[250px] flex-col items-center justify-center text-center p-6 gap-2">
                            <AlertTriangle className="size-8 text-slate-300" />
                            <p className="text-sm font-bold text-slate-800">Không tìm thấy học viên nào</p>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 text-xs font-bold text-slate-500 uppercase border-b border-slate-100">
                                    <th className="px-6 py-4">Học viên</th>
                                    <th className="px-6 py-4">Liên hệ</th>
                                    <th className="px-6 py-4">Cơ sở</th>
                                    <th className="px-6 py-4">Trạng thái</th>
                                    <th className="px-6 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((stu) => (
                                    <tr key={stu.id} className="hover:bg-slate-50/40 border-b border-slate-50">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="size-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 overflow-hidden border border-slate-200">
                                                {stu.avatar ? (
                                                    <img src={stu.avatar} alt="Avatar" className="size-full object-cover" />
                                                ) : (
                                                    stu.fullName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900">{stu.fullName}</div>
                                                <div className="text-xs text-slate-400 font-mono">{stu.studentCode}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-800">{stu.email}</div>
                                            <div className="text-xs text-slate-400">{stu.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-semibold">{stu.location}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                                                {stu.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setActiveStudent(stu);
                                                        setIsStudentModalOpen(true);
                                                    }}
                                                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                    title="Sửa thông tin"
                                                >
                                                    <Edit className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setActiveStudent(stu);
                                                        setIsEnrollOpen(true);
                                                    }}
                                                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                    title="Lớp học"
                                                >
                                                    <Layers className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(stu.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {total > 0 && (
                    <TablePagination
                        total={total}
                        page={page}
                        totalPages={totalPages}
                        limit={pageSize}
                        onPageChange={setPage}
                        onLimitChange={(lim) => {
                            setPageSize(lim);
                            setPage(1);
                        }}
                        className="border-t border-slate-100 px-6 py-4"
                    />
                )}
            </div>

            {/* Modals */}
            <StudentFormModal
                isOpen={isStudentModalOpen}
                onClose={() => {
                    setIsStudentModalOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
                systems={systems}
            />

            <ExcelImportModal
                isOpen={isExcelOpen}
                onClose={() => setIsExcelOpen(false)}
                systems={systems}
            />

            <ClassEnrollmentsModal
                isOpen={isEnrollOpen}
                onClose={() => {
                    setIsEnrollOpen(false);
                    setActiveStudent(null);
                }}
                student={activeStudent}
            />
        </div>
    );
}
