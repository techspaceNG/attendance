import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { prisma } from '@/lib/prisma';
import { Plus, Trash2, Upload, User, FileText } from 'lucide-react';
import { deleteStudent } from '@/app/actions/students';
import Search from '@/components/ui/search';

// Component for delete button with server action
function DeleteButton({ id }: { id: string }) {
    const deleteWithId = deleteStudent.bind(null, id);
    return (
        <form action={deleteWithId}>
            <Button variant="ghost" size="icon" type="submit" className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                <Trash2 size={16} />
            </Button>
        </form>
    );
}

export default async function StudentsPage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const students = await prisma.student.findMany({
        where: {
            OR: [
                { fullName: { contains: query } },
                { matricNumber: { contains: query } },
            ],
        },
        orderBy: { createdAt: 'desc' },
        include: {
            attendances: {
                where: {
                    timestamp: {
                        gte: todayStart,
                        lte: todayEnd,
                    },
                },
            },
        },
    });

    const totalStudents = await prisma.student.count();
    // Get unique departments count
    const departmentsGroup = await prisma.student.groupBy({
        by: ['department'],
    });
    const totalDepartments = departmentsGroup.length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Students</h2>
                    <p className="text-slate-500">Manage your student records here.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/students/upload">
                        <Button variant="outline" className="gap-2">
                            <Upload size={16} />
                            Bulk Upload
                        </Button>
                    </Link>
                    <Link href="/admin/students/add">
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus size={16} /> Add Student
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Total Students</CardTitle>
                        <User className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>
                        <p className="text-xs text-slate-500">Registered in the system</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Departments</CardTitle>
                        <FileText className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{totalDepartments}</div>
                        <p className="text-xs text-slate-500">Active academic units</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium text-slate-800">All Students</CardTitle>
                        <Search placeholder="Search students..." />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Full Name</th>
                                    <th className="px-6 py-4 font-medium">Matric Number</th>
                                    <th className="px-6 py-4 font-medium">Department</th>
                                    <th className="px-6 py-4 font-medium">Level</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {students.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                                                    <User size={32} />
                                                </div>
                                                <p className="text-lg font-medium text-slate-900">No students found</p>
                                                <p className="text-sm">Get started by adding a new student.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    students.map((student: any) => {
                                        const isPresent = student.attendance && student.attendance.length > 0;
                                        return (
                                            <tr key={student.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                            {student.fullName.charAt(0)}
                                                        </div>
                                                        {student.fullName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 font-mono text-xs">{student.matricNumber}</td>
                                                <td className="px-6 py-4 text-slate-600">{student.department}</td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        {student.level}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isPresent ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                            Present
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200">
                                                            Absent
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DeleteButton id={student.id} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
