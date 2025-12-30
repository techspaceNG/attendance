'use server'

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
});

export async function loginAction(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return { error: 'Invalid input' };
    }

    const { username, password } = result.data;

    let admin = await prisma.admin.findUnique({
        where: { username },
    });

    if (!admin) {
        // If no admins exist, create the first one automatically on first login attempt
        const adminCount = await prisma.admin.count();
        if (adminCount === 0 && username === 'admin') {
            const { hash } = await import('bcryptjs');
            const hashedPassword = await hash(password, 10);
            admin = await prisma.admin.create({
                data: {
                    username: 'admin',
                    passwordHash: hashedPassword,
                },
            });
        } else {
            return { error: 'Invalid credentials' };
        }
    }

    const isValid = await compare(password, admin.passwordHash);

    if (!isValid) {
        return { error: 'Invalid credentials' };
    }

    // simplified session for this task
    (await cookies()).set('admin_session', admin.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
    });

    redirect('/admin/dashboard');
}
