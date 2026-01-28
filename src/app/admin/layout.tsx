import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, Settings, UsersRound, BarChart3, LogOut } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const admin = await isAdmin();

    if (!admin) {
        redirect('/admin-login');
    }

    const menuItems = [
        { name: 'إحصائيات الموقع', icon: <BarChart3 size={20} />, href: '/admin' },
        { name: 'إحصائيات الفرق', icon: <UsersRound size={20} />, href: '/admin/teams' },
        { name: 'إدارة الأعضاء', icon: <Users size={20} />, href: '/admin/users' },
        { name: 'إدارة الباقات', icon: <CreditCard size={20} />, href: '/admin/plans' },
        { name: 'بوابة الدفع', icon: <LayoutDashboard size={20} />, href: '/admin/payment' },
        { name: 'إعدادات الموقع', icon: <Settings size={20} />, href: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full right-0 top-0 hidden md:block z-50">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-blue-400">لوحة المشرف</h2>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                        >
                            {item.icon}
                            <span>{item.name}</span>
                        </Link>
                    ))}

                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-900/20 text-red-400 mt-10"
                    >
                        <LogOut size={20} />
                        <span>خروج للموقع</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:mr-64 p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
