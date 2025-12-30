'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const checkInSchema = z.object({
    matricNumber: z.string().min(1, 'Matric Number is required'),
});

export async function checkIn(prevState: any, formData: FormData) {
    const result = checkInSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: 'Invalid input' };
    }

    const { matricNumber } = result.data;

    // 1. Find the student
    const student = await prisma.student.findUnique({
        where: { matricNumber },
    });

    if (!student) {
        return { error: 'Student not found with this Matric Number.' };
    }

    // 2. Check if already checked in TODAY
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await prisma.attendance.findFirst({
        where: {
            studentId: student.id,
            timestamp: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    if (existingAttendance) {
        return { error: `Welcome back, ${student.fullName}! You have already checked in today.` };
    }

    // 3. Create attendance record
    await prisma.attendance.create({
        data: {
            studentId: student.id,
            timestamp: new Date(),
        },
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/admin/attendance');

    return { success: `Check-in successful! Welcome, ${student.fullName}.` };
}
