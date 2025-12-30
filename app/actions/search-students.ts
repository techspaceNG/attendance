'use server'

import { prisma } from '@/lib/prisma';

export async function searchStudents(query: string) {
    if (!query || query.length < 2) {
        return [];
    }

    try {
        const students = await prisma.student.findMany({
            where: {
                matricNumber: {
                    contains: query,
                },
            },
            select: {
                matricNumber: true,
                fullName: true,
                department: true,
                level: true,
            },
            take: 5,
        });
        return students;
    } catch (error) {
        console.error('Failed to search students:', error);
        return [];
    }
}
