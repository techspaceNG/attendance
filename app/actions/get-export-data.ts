'use server'

import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function getAllAttendanceForExport() {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_session')?.value;

    if (!adminId) {
        throw new Error('Unauthorized');
    }

    try {
        const data = await prisma.attendance.findMany({
            orderBy: { timestamp: 'desc' },
            include: {
                student: {
                    select: {
                        fullName: true,
                        matricNumber: true,
                        department: true,
                        level: true,
                    }
                },
            },
        });

        // Flatten data for easier consumption
        return data.map(record => ({
            timestamp: record.timestamp,
            fullName: record.student.fullName,
            matricNumber: record.student.matricNumber,
            department: record.student.department,
            level: record.student.level,
            status: 'Present'
        }));
    } catch (error) {
        console.error('Export fetch error:', error);
        return [];
    }
}
