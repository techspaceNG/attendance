'use client';

import { useActionState } from 'react';
import { createStudent } from '@/app/actions/students';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

const initialState = {
    error: '',
};

export default function AddStudentPage() {
    const [state, formAction, isPending] = useActionState(createStudent, initialState);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Add Student</h2>
                <Link href="/admin/students">
                    <Button variant="outline">Cancel</Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="grid gap-4">
                        {state?.error && (
                            <div className="text-red-500 text-sm font-medium">{state.error}</div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" name="fullName" required placeholder="John Doe" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="matricNumber">Matric Number</Label>
                            <Input id="matricNumber" name="matricNumber" required placeholder="CSC/2024/001" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Input id="department" name="department" required placeholder="Computer Science" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="level">Level</Label>
                                <Input id="level" name="level" required placeholder="100" />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Student'}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
}
