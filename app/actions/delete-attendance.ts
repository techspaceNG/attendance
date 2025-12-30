'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function deleteAttendance(id: string) {
    // Verify admin session
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_session')?.value;

    if (!adminId) {
        return { error: 'Unauthorized' };
    }

    try {
        await prisma.attendance.delete({
            where: { id },
        });

        revalidatePath('/admin/attendance');
        return { success: 'Attendance record deleted' };
    } catch (error) {
        return { error: 'Failed to delete record' };
    }
}
