'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { Users, LogIn, ArrowRight, Sparkles, Copy, Mail, Lock, User as UserIcon, Share2 } from 'lucide-react';

function HomeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { team, currentUser, setTeam, setCurrentUser } = useStore();

    const [activeTab, setActiveTab] = useState<'login' | 'join' | 'create'>('login');

    // Login Form
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Join Form State
    const [joinCode, setJoinCode] = useState('');
    const [joinName, setJoinName] = useState('');
    const [joinEmail, setJoinEmail] = useState('');
    const [joinPassword, setJoinPassword] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // Create Form State
    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);

    useEffect(() => {
        const tab = searchParams.get('tab');
        const code = searchParams.get('code');
        const success = searchParams.get('success');
        const error = searchParams.get('error');

        if (tab === 'join') {
            setActiveTab('join');
        }
        if (code) {
            setJoinCode(code.toUpperCase());
        }
        if (success === 'payment_completed') {
            toast.success('مبروك! تم تفعيل الباقة الاحترافية بنجاح.');
            // Clear URL params
            router.replace('/');
        }
        if (error) {
            let errorMsg = 'حدث خطأ أثناء معالجة الدفع.';
            if (error === 'payment_failed') errorMsg = 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.';
            if (error === 'payment_cancelled') errorMsg = 'تم إلغاء عملية الدفع والعودة للموقع.';

            toast.error(errorMsg);
            router.replace('/');
        }
    }, [searchParams, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            const res = await fetch('/api/teams/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: loginEmail, password: loginPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setTeam(data.team);
            setCurrentUser(data.user);
            toast.success(`أهلاً بك مجدداً ${data.user.username}`);
            router.push('/board');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsJoining(true);
        try {
            const res = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret_code: joinCode,
                    username: joinName,
                    email: joinEmail,
                    password: joinPassword
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setTeam(data.team);
            setCurrentUser(data.user);
            toast.success(`تم الانضمام لـ ${data.team.name} بنجاح!`);
            router.push('/board');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const res = await fetch('/api/teams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    description: teamDesc,
                    admin_name: adminName,
                    admin_email: adminEmail,
                    admin_password: adminPassword
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCreatedTeamCode(data.secret_code);
            setTeam({ id: data.id, name: data.name, description: data.description, secret_code: data.secret_code });
            setCurrentUser(data.user);
            toast.success('تم إنشاء الفريق بنجاح!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden bg-background transition-colors duration-300">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

            <div className="z-10 w-full max-w-lg">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        مُساعد الفريق
                    </h1>
                    <p className="text-muted-foreground font-medium">سجل دخولك أو انضم لفريقك المفضل</p>
                </div>

                <div className="glass-panel rounded-3xl p-2 shadow-2xl">
                    <div className="flex w-full mb-6 bg-muted/60 rounded-2xl p-1.5">
                        {[
                            { id: 'login', label: 'تسجيل دخول' },
                            { id: 'join', label: 'انضمام' },
                            { id: 'create', label: 'إنشاء فريق' }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab.id
                                    ? 'bg-card shadow-md text-primary scale-100'
                                    : 'text-muted-foreground hover:text-foreground scale-95'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4"
                    >
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' && (
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="البريد الإلكتروني"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="password"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="كلمة المرور"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-70"
                                    >
                                        {isLoggingIn ? 'جاري التحقق...' : 'دخول'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'join' && (
                                <form onSubmit={handleJoin} className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="relative">
                                            <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="الكود السري للفريق"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="اسمك بالكامل"
                                                value={joinName}
                                                onChange={(e) => setJoinName(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="البريد الإلكتروني"
                                                value={joinEmail}
                                                onChange={(e) => setJoinEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                            <input
                                                type="password"
                                                required
                                                className="w-full pr-12 pl-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                placeholder="كلمة مرور جديدة"
                                                value={joinPassword}
                                                onChange={(e) => setJoinPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isJoining}
                                        className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        {isJoining ? 'جاري الانضمام...' : 'انضم الآن'}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'create' && (
                                <div className="space-y-4">
                                    {!createdTeamCode ? (
                                        <form onSubmit={handleCreate} className="space-y-4">
                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block text-right">1. بيانات الفريق</p>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3.5 bg-background border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground"
                                                    placeholder="اسم الفريق"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg inline-block text-right">2. بيانات المسؤول</p>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                                                    placeholder="اسم المسؤول"
                                                    value={adminName}
                                                    onChange={(e) => setAdminName(e.target.value)}
                                                />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                                                    placeholder="البريد الإلكتروني للقيادة"
                                                    value={adminEmail}
                                                    onChange={(e) => setAdminEmail(e.target.value)}
                                                />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-foreground"
                                                    placeholder="كلمة مرور الأدمن"
                                                    value={adminPassword}
                                                    onChange={(e) => setAdminPassword(e.target.value)}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isCreating}
                                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-xl transition-all hover:opacity-90 active:scale-[0.98]"
                                            >
                                                {isCreating ? 'جاري التأسيس...' : 'إنشاء وتأسيس الفريق'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-6 space-y-5">
                                            <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-2">
                                                <Sparkles className="h-8 w-8 text-emerald-500" />
                                            </div>
                                            <h3 className="text-2xl font-extrabold text-foreground">تم بناء الفريق!</h3>
                                            <p className="text-sm text-muted-foreground">انسخ الكود السري وشاركه مع فريقك:</p>

                                            <div className="bg-muted/30 border-2 border-dashed border-primary/20 rounded-2xl p-5 flex items-center justify-between group cursor-pointer"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(createdTeamCode);
                                                    toast.success('تم النسخ!');
                                                }}
                                            >
                                                <code className="text-3xl font-mono font-black text-primary tracking-widest uppercase">
                                                    {createdTeamCode}
                                                </code>
                                                <Copy size={24} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>

                                            <button
                                                onClick={() => router.push('/board')}
                                                className="w-full bg-foreground text-background py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-center gap-3 transition-opacity hover:opacity-90"
                                            >
                                                الدخول للوحة التحكم <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {team && !createdTeamCode && (
                    <div className="mt-8 text-center animate-pulse">
                        <button
                            onClick={() => router.push('/board')}
                            className="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto"
                        >
                            مرحباً {currentUser?.username}, عد إلى اللوحة <ArrowRight size={18} />
                        </button>
                    </div>
                )}
            </div>

            {/* Admin Access Link */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                <Link href="/admin-login" className="text-[10px] text-muted-foreground/30 hover:text-primary/50 transition-colors uppercase tracking-widest font-bold">
                    Admin Access
                </Link>
            </div>
        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
