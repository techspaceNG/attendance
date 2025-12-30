import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Calendar, Trash2 } from 'lucide-react';
import Search from '@/components/ui/search';
import { Button } from '@/components/ui/button';
import { deleteAttendance } from '@/app/actions/delete-attendance';
import ExportButton from '@/components/export-button';

function DeleteButton({ id }: { id: string }) {
    const deleteWithId = async () => {
        'use server';
        await deleteAttendance(id);
    };

    return (
        <form action={deleteWithId}>
            <Button variant="ghost" size="icon" type="submit" className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8">
                <Trash2 size={16} />
            </Button>
        </form>
    );
}

export default async function AttendancePage(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || '';

    const attendances = await prisma.attendance.findMany({
        where: {
            OR: [
                { student: { fullName: { contains: query } } },
                { student: { matricNumber: { contains: query } } },
            ],
        },
        orderBy: { timestamp: 'desc' },
        include: {
            student: true,
        },
        take: 100, // Limit to last 100 for now
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Attendance Records</h2>
                    <p className="text-slate-500">View real-time student check-ins.</p>
                </div>
                <ExportButton />
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium text-slate-800">Recent Activity</CardTitle>
                        <Search placeholder="Filter records..." />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Date & Time</th>
                                    <th className="px-6 py-4 font-medium">Student</th>
                                    <th className="px-6 py-4 font-medium">Matric Number</th>
                                    <th className="px-6 py-4 font-medium">Department</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendances.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="p-4 rounded-full bg-slate-100 text-slate-400">
                                                    <Calendar size={32} />
                                                </div>
                                                <p className="text-lg font-medium text-slate-900">No attendance records yet</p>
                                                <p className="text-sm">Student check-ins will appear here.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    attendances.map((record: any) => (
                                        <tr key={record.id} className="bg-white hover:bg-slate-50/80 transition-colors">
                                            <td className="px-6 py-4 text-slate-700 font-medium">
                                                {new Date(record.timestamp).toLocaleString(undefined, {
                                                    dateStyle: 'medium',
                                                    timeStyle: 'short',
                                                })}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                {record.student.fullName}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {record.student.matricNumber}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">{record.student.department}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle2 size={12} />
                                                    Present
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <DeleteButton id={record.id} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
