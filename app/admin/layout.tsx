import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, Users, ClipboardList, LayoutDashboard } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    async function logout() {
        'use server';
        (await cookies()).delete('admin_session');
        redirect('/admin/login');
    }

    return (
        <div className="flex h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
                <div className="p-6 border-b border-slate-100 flex flex-col items-center text-center">
                    <div className="w-16 h-16 mb-2">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-800 leading-tight">
                        Admin Portal
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Administrator</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <SideLink href="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SideLink>
                    <SideLink href="/admin/students" icon={Users}>Students</SideLink>
                    <SideLink href="/admin/attendance" icon={ClipboardList}>Attendance</SideLink>
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <form action={logout}>
                        <Button variant="ghost" className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50" type="submit">
                            <LogOut size={18} />
                            Logout
                        </Button>
                    </form>
                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Powered by</p>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">TechspaceNG</p>
                        <a href="mailto:Techspace544@gmail.com" className="block text-[10px] text-blue-500 hover:underline mt-1">
                            Techspace544@gmail.com
                        </a>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

function SideLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
    return (
        <Link href={href}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-slate-600 hover:text-blue-600 hover:bg-blue-50 font-medium mb-1">
                <Icon size={18} />
                {children}
            </Button>
        </Link>
    );
}
