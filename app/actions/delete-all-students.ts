'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function deleteAllStudents() {
    // Verify admin session
    const cookieStore = await cookies();
    const adminId = cookieStore.get('admin_session')?.value;

    if (!adminId) {
        return { error: 'Unauthorized' };
    }

    try {
        // Delete all students
        // Note: This will also delete related attendance records if cascade delete is set up, 
        // or rely on Prisma to handle it depending on schema. 
        // If strict relation, we might need to delete attendance first.
        // Let's assume standard cascade or we explicitly delete attendance first to be safe.

        await prisma.attendance.deleteMany({});
        await prisma.student.deleteMany({});

        revalidatePath('/admin/students');
        revalidatePath('/admin/dashboard');
        return { success: 'All student records and attendance logs have been permanently deleted.' };
    } catch (error) {
        console.error('Delete all error:', error);
        return { error: 'Failed to delete data.' };
    }
}
