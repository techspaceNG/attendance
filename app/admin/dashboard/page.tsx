import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, CalendarDays, TrendingUp } from 'lucide-react';

async function getStats() {
    const totalStudents = await prisma.student.count();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysAttendance = await prisma.attendance.count({
        where: {
            timestamp: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return { totalStudents, todaysAttendance };
}

export default async function AdminDashboardPage() {
    const { totalStudents, todaysAttendance } = await getStats();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h2>
                <p className="text-slate-500 mt-2">Overview of your attendance system.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: Total Students */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Students</CardTitle>
                        <Users className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{totalStudents}</div>
                        <p className="text-xs text-slate-500 mt-1">Registered in the system</p>
                    </CardContent>
                </Card>

                {/* Card 2: Today's Attendance */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Today's Attendance</CardTitle>
                        <UserCheck className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{todaysAttendance}</div>
                        <p className="text-xs text-slate-500 mt-1">Students present today</p>
                    </CardContent>
                </Card>

                {/* Card 3: Date */}
                <Card className="shadow-sm hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Current Date</CardTitle>
                        <CalendarDays className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold text-slate-900">
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Quick Actions or Charts could go here */}
                <Card className="col-span-1 shadow-sm border-slate-200">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-slate-500">
                            Recent attendance logs would appear here.
                            <br />
                            (Check the <span className="font-semibold text-blue-600">Attendance</span> tab for details)
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
