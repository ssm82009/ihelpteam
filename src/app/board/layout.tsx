'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LogOut, User as UserIcon, Shield, Users, Copy, Check, Palette, Moon, Sun, Monitor, Leaf, Plus, Layout, ChevronDown } from 'lucide-react';
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
    const { team, currentUser, logout, theme, setTheme, radius, setRadius, fontFamily, setFontFamily, setTeam, setCurrentUser } = useStore();
    const [hydrated, setHydrated] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [isTeamMenuOpen, setIsTeamMenuOpen] = useState(false);
    const [userTeams, setUserTeams] = useState<any[]>([]);
    const [isFetchingTeams, setIsFetchingTeams] = useState(false);
    const [copied, setCopied] = useState(false);

    const fetchUserTeams = async () => {
        if (!currentUser?.email) return;
        setIsFetchingTeams(true);
        try {
            const res = await fetch(`/api/user/teams?email=${encodeURIComponent(currentUser.email)}`);
            const data = await res.json();
            if (res.ok) {
                setUserTeams(data.teams || []);
            }
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setIsFetchingTeams(false);
        }
    };

    const handleSwitchTeam = async (targetTeamId: string) => {
        if (!currentUser?.email || targetTeamId === team?.id) {
            setIsTeamMenuOpen(false);
            return;
        }

        const loadingToast = toast.loading('جاري الانتقال للفريق...');
        try {
            const res = await fetch('/api/teams/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentUser.email, team_id: targetTeamId })
            });
            const data = await res.json();
            if (res.ok) {
                // Clear existing tasks to avoid visual flicker
                useStore.getState().setTasks([]);

                setCurrentUser(data.user);
                setTeam(data.team);
                setIsTeamMenuOpen(false);
                toast.success(`مرحباً بك في ${data.team.name}`, { id: loadingToast });

                // Fast reload to clear hooks and state
                setTimeout(() => window.location.reload(), 100);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            toast.error(error.message || 'فشل الانتقال للفريق', { id: loadingToast });
            setIsTeamMenuOpen(false);
        }
    };

    useEffect(() => {
        if (hydrated && currentUser?.email) {
            fetchUserTeams();
        }
    }, [hydrated, currentUser?.email]);

    useEffect(() => {
        setHydrated(true);

        // Sync user data with server to prevent stale localStorage (Cache issue)
        if (currentUser?.email && team?.id) {
            fetch('/api/user/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    team_id: team.id
                }),
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
            <header className="h-20 glass-panel z-[110] sticky top-0 border-b border-border shadow-md">
                <div className="w-full h-full px-4 md:px-8 flex items-center justify-between">
                    {/* Left Side: Team & Projects */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                onClick={() => setIsTeamMenuOpen(!isTeamMenuOpen)}
                                className="flex items-center gap-2 md:gap-3 hover:bg-secondary/20 p-1.5 md:px-4 md:py-2.5 rounded-[20px] md:rounded-2xl transition-all active:scale-95 group"
                            >
                                <div className="h-9 w-9 md:h-10 md:w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black shadow-sm group-hover:scale-105 transition-transform">
                                    {team.name.charAt(0)}
                                </div>
                                <div className="hidden sm:block text-right">
                                    <div className="flex items-center gap-2">
                                        <h1 className="font-extrabold text-foreground leading-tight text-base truncate max-w-[300px]">{team.name}</h1>
                                        <ChevronDown size={14} className={`text-muted-foreground transition-transform duration-300 ${isTeamMenuOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                    <p className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter opacity-70">
                                        المشروع الحالي
                                    </p>
                                </div>
                                <ChevronDown size={16} className="sm:hidden text-muted-foreground" />
                            </button>

                            {isTeamMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-[115]" onClick={() => setIsTeamMenuOpen(false)} />
                                    <div className="absolute top-[calc(100%+12px)] right-0 w-72 bg-card border border-border rounded-[28px] shadow-2xl z-[120] overflow-hidden py-3 animate-in fade-in slide-in-from-top-3 duration-300">
                                        <div className="px-6 py-2 border-b border-border/50 mb-3 flex items-center justify-between">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">تبديل المشروع</span>
                                            <Layout size={12} className="text-muted-foreground/40" />
                                        </div>

                                        <div className="max-h-80 overflow-y-auto custom-scrollbar px-3 space-y-1.5">
                                            {userTeams.map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSwitchTeam(t.id)}
                                                    className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all ${t.id === team.id
                                                        ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm'
                                                        : 'hover:bg-muted text-foreground border border-transparent'
                                                        }`}
                                                >
                                                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black shadow-sm ${t.id === team.id ? 'bg-primary text-white' : 'bg-muted-foreground/20 text-muted-foreground'
                                                        }`}>
                                                        {t.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1 text-right overflow-hidden">
                                                        <div className="text-sm font-black truncate">{t.name}</div>
                                                        <div className="text-[10px] opacity-60 font-mono tracking-widest">#{t.secret_code}</div>
                                                    </div>
                                                    {t.id === team.id && <Check size={16} className="text-primary" />}
                                                </button>
                                            ))}
                                        </div>

                                        {currentUser.plan_type === 'pro' && (
                                            <div className="mt-3 pt-3 border-t border-border/50 px-3">
                                                <button
                                                    onClick={() => {
                                                        setIsCreateTeamOpen(true);
                                                        setIsTeamMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-emerald-600 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all font-black text-xs border border-emerald-500/10"
                                                >
                                                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                                        <Plus size={18} />
                                                    </div>
                                                    <span>إنشاء فريق جديد</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="hidden md:flex items-center gap-2 bg-secondary/20 hover:bg-secondary/40 px-3.5 py-2 rounded-2xl border border-border/50 transition-all cursor-pointer group shadow-sm" onClick={copyTeamCode}>
                            <div className="flex flex-col text-right">
                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">رمز الفريق</span>
                                <span className="text-sm font-black text-primary font-mono tracking-[0.1em]">{team.secret_code}</span>
                            </div>
                            <div className="h-8 w-8 bg-background/50 rounded-lg flex items-center justify-center border border-border/50">
                                {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} className="text-muted-foreground/60 group-hover:text-primary transition-colors" />}
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Navigation & User */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Subscribed Plan - Compact on mobile */}
                        <button
                            onClick={() => setIsSubscriptionOpen(true)}
                            className={`flex items-center md:flex-col justify-center gap-2 md:gap-0 min-w-[44px] md:min-w-[130px] h-11 px-3 md:px-0 font-bold text-xs rounded-2xl border shadow-sm transition-all active:scale-95 ${currentUser.plan_type === 'pro' ? 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10' : 'bg-secondary/50 hover:bg-secondary text-foreground border-border'}`}
                        >
                            <div className="flex items-center gap-2">
                                {currentUser.plan_type === 'pro' ? <Star size={18} className="fill-primary text-primary" /> : <CreditCard size={18} />}
                                <span className="hidden md:inline">{currentUser.plan_type === 'pro' ? 'الباقة الاحترافية' : 'الباقة المجانية'}</span>
                            </div>
                        </button>

                        <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

                        {/* Integrated Tools Group */}
                        <div className="flex items-center gap-1.5 md:gap-2.5 bg-secondary/20 p-1.5 rounded-[22px] border border-border/40 shadow-inner">
                            <button
                                onClick={() => setIsMembersModalOpen(true)}
                                className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center bg-card hover:bg-muted text-primary rounded-xl md:rounded-2xl border border-border/50 shadow-sm transition-all active:scale-95 group"
                                title="الأعضاء"
                            >
                                <Users size={18} className="group-hover:scale-110 transition-transform" />
                            </button>

                            <div className="relative">
                                <button
                                    onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                    className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center bg-card hover:bg-muted text-primary rounded-xl md:rounded-2xl border border-border/50 shadow-sm transition-all active:scale-95 group"
                                    title="المظهر"
                                >
                                    <Palette size={18} className="group-hover:rotate-12 transition-transform" />
                                </button>

                                {isThemeMenuOpen && (
                                    <>
                                        <div className="fixed inset-0 z-[115]" onClick={() => setIsThemeMenuOpen(false)} />
                                        <div className="absolute left-0 mt-3 w-56 bg-card border border-border rounded-[28px] shadow-2xl z-[120] overflow-hidden py-1 animate-in fade-in slide-in-from-right-4 duration-300 border-t-4 border-t-primary">
                                            {/* Themes Section */}
                                            <div className="px-5 py-3 border-b border-border/50 mb-1">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">مظهر النظام</span>
                                            </div>
                                            <div className="max-h-60 overflow-y-auto custom-scrollbar px-2 space-y-0.5">
                                                {themes.map((t) => (
                                                    <button
                                                        key={t.id}
                                                        onClick={() => setTheme(t.id as any)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-muted transition-colors ${theme === t.id ? 'bg-primary/10 text-primary' : 'text-foreground'}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4.5 w-4.5 rounded-full border border-border shadow-inner ${t.class}`} />
                                                            <span>{t.name}</span>
                                                        </div>
                                                        {theme === t.id && <Check size={14} className="text-primary" />}
                                                    </button>
                                                ))}
                                            </div>

                                            <div className="h-px bg-border/50 my-1.5" />

                                            {/* Radius & Font Section Simplified */}
                                            <div className="px-5 py-2">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">التخصيص المتقدم</span>
                                            </div>
                                            <div className="px-2 pb-3 space-y-1">
                                                <div className="flex gap-1">
                                                    {radii.map((r) => (
                                                        <button
                                                            key={r.id}
                                                            onClick={() => setRadius(r.id as any)}
                                                            className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${radius === r.id ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent hover:bg-muted'}`}
                                                        >
                                                            <div className="mb-1">{r.icon}</div>
                                                            <span className="text-[9px] font-black">{r.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-border/50 my-1" />

                                            <div className="px-5 py-2">
                                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest font-tajawal">نوع الخط</span>
                                            </div>
                                            <div className="px-2 pb-3 flex flex-wrap gap-1">
                                                {fonts.map((f) => (
                                                    <button
                                                        key={f.id}
                                                        onClick={() => setFontFamily(f.id as any)}
                                                        className={`flex-1 min-w-[45%] flex items-center justify-center py-2 rounded-xl border text-xs font-bold transition-all ${fontFamily === f.id ? 'bg-primary/10 border-primary/30 text-primary' : 'border-transparent hover:bg-muted opacity-60 hover:opacity-100'}`}
                                                    >
                                                        <span className={f.id === 'default' ? '' : `font-${f.id}`}>{f.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="h-8 w-px bg-border/40 mx-0.5 hidden md:block" />

                            <div className="hidden sm:flex items-center gap-3 bg-card/80 pl-1.5 pr-4 py-1.5 rounded-xl border border-border/50 shadow-sm group hover:border-primary/30 transition-all">
                                <div className="flex flex-col text-right">
                                    <span className="text-[11px] font-black text-foreground leading-none">{currentUser.username}</span>
                                    <span className="text-[8px] font-black text-primary uppercase opacity-60 tracking-tighter">الحساب الشخصي</span>
                                </div>
                                <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/20 text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                    <UserIcon size={14} />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                }}
                                className="h-9 w-9 md:h-10 md:w-10 flex items-center justify-center bg-destructive/5 hover:bg-destructive text-destructive hover:text-white rounded-xl md:rounded-2xl border border-destructive/10 shadow-sm transition-all active:scale-95 group"
                                title="تسجيل الخروج"
                            >
                                <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-hidden pt-2">
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
