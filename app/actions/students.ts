'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const studentSchema = z.object({
    fullName: z.string().min(1, 'Full Name is required'),
    matricNumber: z.string().min(1, 'Matric Number is required'),
    department: z.string().min(1, 'Department is required'),
    level: z.string().min(1, 'Level is required'),
});

export async function createStudent(prevState: any, formData: FormData) {
    const result = studentSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: 'Invalid input data' };
    }

    const { fullName, matricNumber, department, level } = result.data;

    try {
        await prisma.student.create({
            data: {
                fullName,
                matricNumber,
                department,
                level,
            },
        });
    } catch (e: any) {
        if (e.code === 'P2002') {
            return { error: 'Matric Number already exists' };
        }
        return { error: 'Failed to create student' };
    }

    revalidatePath('/admin/students');
    redirect('/admin/students');
}

export async function deleteStudent(studentId: string) {
    try {
        await prisma.student.delete({
            where: { id: studentId },
        });
        revalidatePath('/admin/students');
    } catch (e) {
        console.error('Failed to delete student', e);
    }
}
