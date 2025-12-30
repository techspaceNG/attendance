'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/app/actions/auth';
import { Lock } from 'lucide-react';

const initialState = {
    error: '',
};

export default function AdminLoginPage() {
    const [state, formAction, isPending] = useActionState(loginAction, initialState);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
            <Card className="w-full max-w-sm shadow-xl border-slate-200/60 overflow-hidden">
                <div className="bg-slate-900 p-6 flex flex-col items-center text-center text-white">
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 p-2 shadow-lg">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-2xl font-bold">Admin Portal</h2>
                    <p className="text-slate-400 text-sm">Secure Access Only</p>
                </div>

                <form action={formAction}>
                    <CardContent className="grid gap-4 pt-8 p-6">
                        {state?.error && (
                            <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm font-medium text-center border border-red-100">
                                {state.error}
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" type="text" placeholder="admin" required className="py-5" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required className="py-5" />
                        </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                        <Button className="w-full py-5 text-base bg-slate-900 hover:bg-slate-800 transition-all" disabled={isPending}>
                            {isPending ? 'Verifying...' : 'Sign In'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
