'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut, User as UserIcon, Shield, Users, Copy, Check } from 'lucide-react';
import MemberModal from '@/components/Board/MemberModal';
import { toast } from 'react-hot-toast';

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { team, currentUser, logout } = useStore();
    const [hydrated, setHydrated] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    useEffect(() => {
        // Wait for hydration before checking auth
        if (hydrated && (!team || !currentUser)) {
            router.push('/');
        }
    }, [team, currentUser, router, hydrated]);

    const copyTeamCode = () => {
        if (!team?.secret_code) return;
        navigator.clipboard.writeText(team.secret_code);
        setCopied(true);
        toast.success('تم نسخ رمز الفريق');
        setTimeout(() => setCopied(false), 2000);
    };

    if (!hydrated || !team || !currentUser) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full mb-4 flex items-center justify-center">
                        <Shield className="text-blue-600 h-6 w-6" />
                    </div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50/30">
            <header className="h-16 glass-panel z-50 sticky top-0 px-8 flex items-center justify-between border-b border-white/20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                            {team.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-gray-900 leading-tight">{team.name}</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">لوحة التحكم للفريق</p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 transition-colors cursor-pointer group" onClick={copyTeamCode}>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">رمز الفريق</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-blue-700 font-mono tracking-widest">{team.secret_code}</span>
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-blue-400 group-hover:text-blue-600" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="flex items-center gap-2 bg-white/60 hover:bg-white text-gray-700 font-bold text-sm px-4 py-2 rounded-xl border border-white/50 shadow-sm transition-all active:scale-95"
                    >
                        <Users size={16} className="text-blue-600" />
                        <span className="hidden sm:inline">الأعضاء</span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 mx-1" />

                    <div className="flex items-center gap-2 bg-white/40 px-3 py-1.5 rounded-full border border-white/50 shadow-sm">
                        <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <UserIcon size={14} className="text-blue-600" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{currentUser.username}</span>
                    </div>

                    <div className="h-8 w-px bg-gray-200" />

                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all active:scale-95"
                    >
                        <LogOut size={16} />
                        <span className="hidden sm:inline">خروج</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden pt-2">
                {children}
            </main>

            <MemberModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
            />
        </div>
    );
}
