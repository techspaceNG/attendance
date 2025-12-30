'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const studentSchema = z.object({
    fullName: z.string().min(1),
    matricNumber: z.string().min(1),
    department: z.string().min(1),
    level: z.string().min(1),
});

type StudentInput = z.infer<typeof studentSchema>;

export async function bulkCreateStudents(students: StudentInput[]) {
    // Validate all records first
    const validStudents: StudentInput[] = [];
    const errors: string[] = [];

    for (let i = 0; i < students.length; i++) {
        const result = studentSchema.safeParse(students[i]);
        if (result.success) {
            validStudents.push(result.data);
        } else {
            errors.push(`Row ${i + 1}: Invalid data`);
        }
    }

    if (validStudents.length === 0) {
        return { error: 'No valid students found to upload.' };
    }

    // Insert in transaction or createMany
    try {
        // SQLite doesn't support skipDuplicates in createMany nicely in all prisma versions/adapters, 
        // but let's try strict createMany first.
        // However, if one fails (duplicate matric), all might fail.
        // For bulk upload, it's often better to try/catch each or gather IDs.
        // Let's use a loop for better error reporting on duplicates, or createMany and let it fail?
        // "Safe" bulk upload usually skips duplicates.

        // Efficient approach for SQLite:
        // 1. Get existing matric numbers
        const matrics = validStudents.map(s => s.matricNumber);
        const existing = await prisma.student.findMany({
            where: { matricNumber: { in: matrics } },
            select: { matricNumber: true }
        });
        const existingSet = new Set(existing.map(e => e.matricNumber));

        const toCreate = validStudents.filter(s => !existingSet.has(s.matricNumber));

        if (toCreate.length === 0) {
            return { error: 'All students in this list already exist.' };
        }

        await prisma.student.createMany({
            data: toCreate,
        });

        revalidatePath('/admin/students');
        return {
            success: `Successfully uploaded ${toCreate.length} students. ${existing.length} duplicates skipped.`
        };

    } catch (e) {
        console.error(e);
        return { error: 'Failed to save students to database.' };
    }
}
