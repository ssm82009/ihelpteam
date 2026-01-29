'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut, User as UserIcon, Shield, Users, Copy, Check, Palette, Moon, Sun, Monitor, Leaf } from 'lucide-react';
import MemberModal from '@/components/Board/MemberModal';
import SubscriptionModal from '@/components/Board/SubscriptionModal';
import { toast } from 'react-hot-toast';
import { CreditCard, Star } from 'lucide-react';

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { team, currentUser, logout, theme, setTheme, radius, setRadius, fontFamily, setFontFamily } = useStore();
    const [hydrated, setHydrated] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setHydrated(true);
    }, []);

    const themes = [
        { id: 'light-pro', name: 'فاتح احترافي', icon: <Sun size={14} />, class: 'bg-white text-gray-800' },
        { id: 'dark-pro', name: 'مظلم احترافي', icon: <Moon size={14} />, class: 'bg-[#0f172a] text-white' },
        { id: 'slate-pro', name: 'أزرق تقني', icon: <Monitor size={14} />, class: 'bg-[#1e293b] text-white' },
        { id: 'emerald-pro', name: 'زمردي عميق', icon: <Leaf size={14} />, class: 'bg-[#061e16] text-white' },
        { id: 'pink-pro', name: 'زهري لطيف', icon: <Palette size={14} />, class: 'bg-pink-100 text-pink-900' },
        { id: 'purple-pro', name: 'بنفسجي ملكي', icon: <Palette size={14} />, class: 'bg-[#180c28] text-white' },
        { id: 'forest-pro', name: 'أخضر رسمي', icon: <Shield size={14} />, class: 'bg-[#0a1912] text-white' },
        { id: 'contrast-pro', name: 'عمى الألوان', icon: <Shield size={14} />, class: 'bg-black text-yellow-400' },
    ];

    const radii = [
        { id: 'sharp', name: 'حاد', icon: <div className="w-3 h-3 border border-current" /> },
        { id: 'rounded', name: 'ناعم', icon: <div className="w-3 h-3 border border-current rounded-sm" /> },
    ];

    const fonts = [
        { id: 'tajawal', name: 'تجوال' },
        { id: 'cairo', name: 'كايرو' },
        { id: 'arial', name: 'أريال' },
        { id: 'default', name: 'عادي' },
    ];

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
        <div className="min-h-screen flex flex-col transition-colors duration-300">
            <header className="h-16 glass-panel z-50 sticky top-0 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black shadow-lg">
                            {team.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-foreground leading-tight">{team.name}</h1>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                لوحة التحكم للفريق <span className="text-primary ml-1">(v2.0)</span>
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 transition-colors cursor-pointer group" onClick={copyTeamCode}>
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">رمز الفريق</span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-primary font-mono tracking-widest">{team.secret_code}</span>
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-primary/60 group-hover:text-primary" />}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                            className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground font-bold text-sm px-4 py-2 rounded-xl border border-border shadow-sm transition-all active:scale-95"
                        >
                            <Palette size={16} className="text-primary" />
                            <span className="hidden sm:inline">المظهر</span>
                        </button>

                        {isThemeMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                                <div className="absolute left-0 mt-2 w-52 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Themes Section */}
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">اختر السمة</span>
                                    </div>
                                    <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                        {themes.map((t) => (
                                            <button
                                                key={t.id}
                                                onClick={() => setTheme(t.id as any)}
                                                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold hover:bg-muted transition-colors ${theme === t.id ? 'text-primary' : 'text-foreground'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-4 w-4 rounded-full border border-border ${t.class}`} />
                                                    <span>{t.name}</span>
                                                </div>
                                                {theme === t.id && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="h-px bg-border my-1" />

                                    {/* Radius Section */}
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">شكل الحواف</span>
                                    </div>
                                    <div className="flex flex-col">
                                        {radii.map((r) => (
                                            <button
                                                key={r.id}
                                                onClick={() => setRadius(r.id as any)}
                                                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold hover:bg-muted transition-colors ${radius === r.id ? 'text-primary' : 'text-foreground'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-muted-foreground">{r.icon}</div>
                                                    <span>{r.name}</span>
                                                </div>
                                                {radius === r.id && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="h-px bg-border my-1" />

                                    {/* Font Section */}
                                    <div className="px-3 py-2 border-b border-border mb-1">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">نوع الخط</span>
                                    </div>
                                    <div className="flex flex-col">
                                        {fonts.map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => setFontFamily(f.id as any)}
                                                className={`w-full flex items-center justify-between px-4 py-2 text-sm font-bold hover:bg-muted transition-colors ${fontFamily === f.id ? 'text-primary' : 'text-foreground'}`}
                                            >
                                                <span className={f.id === 'default' ? '' : `font-${f.id}`}>{f.name}</span>
                                                {fontFamily === f.id && <Check size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setIsSubscriptionOpen(true)}
                        className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl border shadow-sm transition-all active:scale-95 ${currentUser.plan_type === 'pro' ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20' : 'bg-secondary/50 hover:bg-secondary text-foreground border-border'}`}
                    >
                        <CreditCard size={16} className={currentUser.plan_type === 'pro' ? 'text-primary' : 'text-primary'} />
                        <span className="hidden sm:inline">الباقة</span>
                        {currentUser.plan_type === 'pro' && <Star size={10} className="fill-primary" />}
                    </button>

                    <button
                        onClick={() => setIsMembersModalOpen(true)}
                        className="flex items-center gap-2 bg-secondary/50 hover:bg-secondary text-foreground font-bold text-sm px-4 py-2 rounded-xl border border-border shadow-sm transition-all active:scale-95"
                    >
                        <Users size={16} className="text-primary" />
                        <span className="hidden sm:inline">الأعضاء</span>
                    </button>

                    <div className="h-8 w-px bg-border mx-1" />

                    <div className="flex items-center gap-2 bg-secondary/30 px-3 py-1.5 rounded-full border border-border">
                        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                            <UserIcon size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-bold text-foreground">{currentUser.username}</span>
                    </div>

                    <div className="h-8 w-px bg-border" />

                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex items-center gap-2 text-sm font-bold text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-all active:scale-95"
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
            <SubscriptionModal
                isOpen={isSubscriptionOpen}
                onClose={() => setIsSubscriptionOpen(false)}
            />
        </div>
    );
}
