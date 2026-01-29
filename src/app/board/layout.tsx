'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut, User as UserIcon, Shield, Users, Copy, Check, Palette, Moon, Sun, Monitor, Leaf, Plus } from 'lucide-react';
import MemberModal from '@/components/Board/MemberModal';
import SubscriptionModal from '@/components/Board/SubscriptionModal';
import CreateTeamModal from '@/components/Board/CreateTeamModal';
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

        // Sync user data with server to prevent stale localStorage (Cache issue)
        if (currentUser?.email) {
            fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email }),
                cache: 'no-store'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        useStore.getState().setCurrentUser(data.user);
                    }
                })
                .catch(err => console.error('Sync failed', err));
        }
    }, [currentUser?.email]);

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

    const getRemainingTime = () => {
        if (!currentUser?.subscription_end) return null;
        const end = new Date(currentUser.subscription_end);
        const now = new Date();
        const diffTime = end.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 0) return 'منتهي';
        if (diffDays > 30) {
            const months = Math.floor(diffDays / 30);
            return `بقي ${months} شهر`;
        }
        return `بقي ${diffDays} يوم`;
    };

    const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);

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
            <header className="h-16 glass-panel z-50 sticky top-0 px-8 flex items-center justify-between border-b border-border shadow-sm">
                {/* Left Side: Team Info */}
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center text-primary font-black shadow-sm group hover:scale-105 transition-transform">
                            {team.name.charAt(0)}
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-extrabold text-foreground leading-tight">{team.name}</h1>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">
                                لوحة التحكم <span className="text-primary/60 font-mono">(v4.0)</span>
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 bg-secondary/30 hover:bg-secondary/50 px-3 py-1.5 rounded-xl border border-border transition-all cursor-pointer group" onClick={copyTeamCode}>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">رمز الفريق</span>
                        <div className="flex items-center gap-1.5 bg-background/50 px-2 py-0.5 rounded-lg border border-border/50">
                            <span className="text-sm font-black text-primary font-mono tracking-widest">{team.secret_code}</span>
                            {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} className="text-muted-foreground/60 group-hover:text-primary transition-colors" />}
                        </div>
                    </div>
                </div>

                {/* Right Side: Navigation & User */}
                <div className="flex items-center gap-3">
                    {/* Subscribed Plan Button */}
                    <button
                        onClick={() => setIsSubscriptionOpen(true)}
                        className={`flex flex-col items-center justify-center min-w-[120px] h-11 font-bold text-xs rounded-xl border shadow-sm transition-all active:scale-95 ${currentUser.plan_type === 'pro' ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10' : 'bg-secondary/50 hover:bg-secondary text-foreground border-border'}`}
                    >
                        <div className="flex items-center gap-2">
                            {currentUser.plan_type === 'pro' ? <Star size={16} className="fill-primary text-primary" /> : <CreditCard size={16} />}
                            <span>{currentUser.plan_type === 'pro' ? 'الباقة الاحترافية' : 'الباقة المجانية'}</span>
                        </div>
                        {currentUser.plan_type === 'pro' && getRemainingTime() && (
                            <span className="text-[10px] font-black opacity-60 leading-none mt-0.5">{getRemainingTime()}</span>
                        )}
                    </button>

                    {/* Pro Feature: Create New Team */}
                    {currentUser.plan_type === 'pro' && (
                        <button
                            onClick={() => setIsCreateTeamOpen(true)}
                            className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 font-black text-xs px-4 py-2.5 rounded-xl border border-emerald-500/20 shadow-sm transition-all active:scale-95 group"
                        >
                            <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                            <span className="hidden md:inline">فريق جديد</span>
                        </button>
                    )}

                    <div className="h-8 w-px bg-border mx-1" />

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMembersModalOpen(true)}
                            className="h-10 w-10 flex items-center justify-center bg-secondary/50 hover:bg-secondary text-foreground rounded-xl border border-border shadow-sm transition-all active:scale-95 group"
                            title="الأعضاء"
                        >
                            <Users size={18} className="text-primary group-hover:scale-110 transition-transform" />
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                className="h-10 w-10 flex items-center justify-center bg-secondary/50 hover:bg-secondary text-foreground rounded-xl border border-border shadow-sm transition-all active:scale-95 group"
                                title="المظهر"
                            >
                                <Palette size={18} className="text-primary group-hover:rotate-12 transition-transform" />
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
                    </div>

                    <div className="h-8 w-px bg-border mx-1" />

                    <div className="flex items-center gap-3 bg-secondary/30 pl-1 pr-4 py-1.5 rounded-2xl border border-border shadow-inner">
                        <span className="text-sm font-black text-foreground">{currentUser.username}</span>
                        <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-sm">
                            <UserIcon size={16} className="text-primary" />
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            logout();
                            router.push('/');
                        }}
                        className="flex items-center gap-2 text-sm font-black text-destructive hover:bg-destructive/10 px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-transparent hover:border-destructive/20"
                    >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">خروج</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden pt-2">
                {children}
            </main>

            {/* Modals */}
            <MemberModal
                isOpen={isMembersModalOpen}
                onClose={() => setIsMembersModalOpen(false)}
            />
            <SubscriptionModal
                isOpen={isSubscriptionOpen}
                onClose={() => setIsSubscriptionOpen(false)}
            />
            <CreateTeamModal
                isOpen={isCreateTeamOpen}
                onClose={() => setIsCreateTeamOpen(false)}
            />
        </div>
    );
}
