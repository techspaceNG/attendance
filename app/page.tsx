'use client';

import { useActionState } from 'react';
import { checkIn } from '@/app/actions/attendance';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { CheckCircle2, AlertCircle, ShieldCheck, Zap, Users } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import StudentSearch from '@/components/student-search';

const initialState: { error?: string; success?: string } = {};

export default function Home() {
  const [state, formAction, isPending] = useActionState(checkIn, initialState);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Admin Link - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <Link href="/admin/login">
          <Button variant="ghost" className="text-slate-500 hover:text-blue-600 gap-2">
            <ShieldCheck size={16} />
            Admin Portal
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="text-center mb-10 max-w-2xl mx-auto space-y-4 flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <img src="/logo.png" alt="School Logo" className="object-contain w-full h-full" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Federal College of Education <br />
            <span className="text-blue-600">(Technical) Bichi</span>
          </h1>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800">CBT Exam Attendance System</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Welcome to the official CBT accreditation portal.
              Students must verify their identity and check in here before proceeding to the exam hall.
            </p>
          </div>
        </div>

        <div className="w-full max-w-md">
          {/* Card: Check In */}
          <Card className="shadow-xl border-slate-200/60 overflow-hidden transform transition-all hover:scale-[1.01]">
            <div className="h-2 bg-blue-600 w-full" />
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto size-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                <Zap size={24} />
              </div>
              <CardTitle className="text-2xl">Exam Accreditation</CardTitle>
              <CardDescription className="text-base">
                Enter matric number to verify eligibility.
              </CardDescription>
            </CardHeader>
            <form action={formAction}>
              <CardContent className="grid gap-5">
                {state?.success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg">Success!</p>
                      <p className="text-base">{state.success}</p>
                    </div>
                  </div>
                )}

                {state?.error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-6 w-6 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-lg">Oops!</p>
                      <p className="text-base">{state.error}</p>
                    </div>
                  </div>
                )}

                {!state?.success && (
                  <>
                    <div className="grid gap-2 text-left">
                      <Label htmlFor="matricNumber" className="text-base font-medium text-slate-700">Matric Number</Label>
                      <StudentSearch required />
                    </div>
                    <Button className="w-full text-lg font-semibold py-6 rounded-lg bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20" disabled={isPending}>
                      {isPending ? 'Checking In...' : 'Check In Now'}
                    </Button>
                  </>
                )}
                {state?.success && (
                  <Button
                    variant="outline"
                    className="w-full text-lg py-6 rounded-lg border-2"
                    onClick={() => window.location.reload()}
                    type="button"
                  >
                    Check In Another Student
                  </Button>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      </div>

      {/* Footer/Features */}
      <div className="py-12 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Zap size={18} />
              </div>
              <h4 className="font-semibold text-base">Real-time</h4>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <Users size={18} />
              </div>
              <h4 className="font-semibold text-base">Student-Centric</h4>
            </div>
            <div className="flex flex-col items-center">
              <div className="size-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <ShieldCheck size={18} />
              </div>
              <h4 className="font-semibold text-base">Secure</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Powered By Footer */}
      <div className="bg-slate-900 py-6 text-center text-slate-400 text-sm">
        <p>
          Powered by <span className="text-white font-semibold">TechspaceNG</span>
        </p>
        <p className="mt-1 flex items-center justify-center gap-2">
          <span>Contact:</span>
          <a href="mailto:Techspace544@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            Techspace544@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
