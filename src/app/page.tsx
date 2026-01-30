'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { Users, LogIn, ArrowRight, Sparkles, Copy, Mail, Lock, User as UserIcon, CheckCircle2, Clock, Target, Zap, LayoutGrid, MessageSquare } from 'lucide-react';

// ===== ANIMATED KANBAN BOARD ILLUSTRATION =====
const KanbanIllustration = () => {
    const [activeCard, setActiveCard] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveCard(prev => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const columns = [
        { id: 'plan', title: 'الخطة', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200', count: 4 },
        { id: 'progress', title: 'قيد التنفيذ', color: 'from-amber-500 to-orange-500', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', count: 2 },
        { id: 'done', title: 'مكتمل', color: 'from-emerald-500 to-green-600', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', count: 5 },
    ];

    const teamAvatars = [
        { color: 'bg-gradient-to-br from-pink-400 to-rose-500', initials: 'أح' },
        { color: 'bg-gradient-to-br from-blue-400 to-indigo-500', initials: 'سم' },
        { color: 'bg-gradient-to-br from-emerald-400 to-teal-500', initials: 'خل' },
        { color: 'bg-gradient-to-br from-amber-400 to-orange-500', initials: 'نو' },
    ];

    return (
        <div className="hidden lg:flex flex-col items-center justify-center w-full max-w-2xl px-4 select-none">
            {/* Floating Elements */}
            <div className="relative w-full">
                {/* Animated Floating Icons */}
                <motion.div
                    animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-8 -right-4 w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center z-20"
                >
                    <Target className="w-8 h-8 text-white" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute -top-4 -left-8 w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl shadow-xl flex items-center justify-center z-20"
                >
                    <Zap className="w-7 h-7 text-white" />
                </motion.div>

                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    className="absolute top-32 -right-12 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl shadow-xl flex items-center justify-center z-20"
                >
                    <MessageSquare className="w-6 h-6 text-white" />
                </motion.div>

                {/* Main Kanban Board */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 relative overflow-hidden">
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 via-transparent to-primary/5 pointer-events-none" />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                                <LayoutGrid className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">لوحة المهام</h3>
                                <p className="text-[10px] text-slate-500">فريق التطوير</p>
                            </div>
                        </div>
                        <div className="flex -space-x-2 rtl:space-x-reverse">
                            {teamAvatars.map((avatar, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.1, duration: 0.3 }}
                                    className={`w-8 h-8 ${avatar.color} rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white`}
                                >
                                    {avatar.initials}
                                </motion.div>
                            ))}
                            <div className="w-8 h-8 bg-slate-200 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-600">
                                +3
                            </div>
                        </div>
                    </div>

                    {/* Kanban Columns */}
                    <div className="grid grid-cols-3 gap-4 relative z-10">
                        {columns.map((column, colIndex) => (
                            <div key={column.id} className={`${column.bgColor} ${column.borderColor} border rounded-2xl p-3`}>
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${column.color}`} />
                                        <span className="text-xs font-bold text-slate-700">{column.title}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 bg-white/70 px-2 py-0.5 rounded-full">
                                        {column.count}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="space-y-2">
                                    {[...Array(colIndex === 1 ? 2 : 2)].map((_, cardIndex) => {
                                        const isActive = activeCard === colIndex && cardIndex === 0;
                                        return (
                                            <motion.div
                                                key={cardIndex}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: isActive ? 1.02 : 1,
                                                    boxShadow: isActive ? '0 8px 25px -5px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                                                }}
                                                transition={{
                                                    delay: colIndex * 0.1 + cardIndex * 0.05,
                                                    scale: { duration: 0.3 }
                                                }}
                                                className={`bg-white rounded-xl p-3 border transition-all duration-300 ${isActive ? 'border-primary/30 ring-2 ring-primary/10' : 'border-slate-100'
                                                    }`}
                                            >
                                                <div className="space-y-2">
                                                    <div className={`h-2 rounded-full ${isActive ? 'bg-primary/30' : 'bg-slate-100'} w-full`} />
                                                    <div className={`h-2 rounded-full ${isActive ? 'bg-primary/20' : 'bg-slate-50'} w-2/3`} />
                                                </div>
                                                <div className="flex items-center justify-between mt-3">
                                                    <div className={`w-5 h-5 rounded-full ${teamAvatars[cardIndex % teamAvatars.length].color}`} />
                                                    {colIndex === 2 && (
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                    )}
                                                    {colIndex === 1 && (
                                                        <Clock className="w-4 h-4 text-amber-500" />
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}

                                    {/* Ghost Card for Column 1 */}
                                    {colIndex === 0 && (
                                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 opacity-50">
                                            <div className="space-y-2">
                                                <div className="h-2 rounded-full bg-slate-100 w-full" />
                                                <div className="h-2 rounded-full bg-slate-50 w-1/2" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Animated Connection Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" style={{ zIndex: 5 }}>
                        <motion.path
                            d="M 150 200 Q 250 150 350 200"
                            fill="none"
                            stroke="url(#gradient1)"
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        />
                        <defs>
                            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#10b981" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Stats Cards */}
                <div className="flex gap-3 mt-4">
                    {[
                        { label: 'المهام المنجزة', value: '24', icon: CheckCircle2, color: 'from-emerald-500 to-green-600' },
                        { label: 'أعضاء الفريق', value: '8', icon: Users, color: 'from-blue-500 to-indigo-600' },
                        { label: 'الإنتاجية', value: '94%', icon: Zap, color: 'from-amber-500 to-orange-600' },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-white/50 shadow-lg"
                        >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2 shadow-md`}>
                                <stat.icon className="w-4 h-4 text-white" />
                            </div>
                            <p className="text-lg font-black text-slate-800">{stat.value}</p>
                            <p className="text-[10px] text-slate-500">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ===== MAIN HOME CONTENT =====
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

    const tabs = [
        { id: 'login', label: 'تسجيل دخول', icon: LogIn },
        { id: 'join', label: 'انضمام', icon: Users },
        { id: 'create', label: 'إنشاء فريق', icon: Sparkles }
    ];

    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-primary/5">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-violet-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, 80, 0],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/15 to-blue-500/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.1, 0.2, 0.1]
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-gradient-to-br from-emerald-400/10 to-teal-500/5 rounded-full blur-3xl"
                />

                {/* Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen flex-col lg:flex-row-reverse items-center justify-center p-6 lg:p-12 gap-12 lg:gap-20">

                {/* Kanban Illustration */}
                <KanbanIllustration />

                {/* Form Section */}
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center lg:text-right mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-violet-500/10 border border-primary/20 mb-6"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-xs font-bold text-primary">نظام إدارة الفرق الذكي</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl lg:text-5xl font-black mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight"
                        >
                            مُساعد الفريق
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-500 font-medium text-base max-w-sm mx-auto lg:mx-0 lg:mr-0"
                        >
                            نظّم مهام فريقك بسهولة مع لوحة كانبان التفاعلية. تواصل، تعاون، وحقق أهدافك.
                        </motion.p>
                    </div>

                    {/* Auth Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl shadow-slate-200/50 border border-white/80"
                    >
                        {/* Tabs */}
                        <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mb-6">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === tab.id
                                            ? 'bg-white shadow-md text-primary'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Forms */}
                        <AnimatePresence mode="wait">
                            {activeTab === 'login' && (
                                <motion.form
                                    key="login"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleLogin}
                                    className="space-y-4"
                                >
                                    <div className="space-y-4">
                                        <div className="relative group">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                placeholder="البريد الإلكتروني"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                placeholder="كلمة المرور"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoggingIn ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                جاري التحقق...
                                            </span>
                                        ) : 'دخول'}
                                    </button>
                                </motion.form>
                            )}

                            {activeTab === 'join' && (
                                <motion.form
                                    key="join"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleJoin}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="relative group">
                                            <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400 font-mono tracking-wider uppercase"
                                                placeholder="الكود السري للفريق"
                                                value={joinCode}
                                                onChange={(e) => setJoinCode(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                placeholder="اسمك بالكامل"
                                                value={joinName}
                                                onChange={(e) => setJoinName(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                placeholder="البريد الإلكتروني"
                                                value={joinEmail}
                                                onChange={(e) => setJoinEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="password"
                                                required
                                                className="w-full pr-12 pl-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                placeholder="كلمة مرور جديدة"
                                                value={joinPassword}
                                                onChange={(e) => setJoinPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isJoining}
                                        className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                                    >
                                        {isJoining ? 'جاري الانضمام...' : 'انضم الآن'}
                                    </button>
                                </motion.form>
                            )}

                            {activeTab === 'create' && (
                                <motion.div
                                    key="create"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    {!createdTeamCode ? (
                                        <form onSubmit={handleCreate} className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl">
                                                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">1</div>
                                                    بيانات الفريق
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-slate-800 placeholder:text-slate-400"
                                                    placeholder="اسم الفريق"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                />
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-xs font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl">
                                                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">2</div>
                                                    بيانات المسؤول
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-800 placeholder:text-slate-400"
                                                    placeholder="اسم المسؤول"
                                                    value={adminName}
                                                    onChange={(e) => setAdminName(e.target.value)}
                                                />
                                                <input
                                                    type="email"
                                                    required
                                                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-800 placeholder:text-slate-400"
                                                    placeholder="البريد الإلكتروني للقيادة"
                                                    value={adminEmail}
                                                    onChange={(e) => setAdminEmail(e.target.value)}
                                                />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full px-4 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-slate-800 placeholder:text-slate-400"
                                                    placeholder="كلمة مرور الأدمن"
                                                    value={adminPassword}
                                                    onChange={(e) => setAdminPassword(e.target.value)}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isCreating}
                                                className="w-full bg-gradient-to-r from-primary to-primary/90 text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70"
                                            >
                                                {isCreating ? 'جاري التأسيس...' : 'إنشاء وتأسيس الفريق'}
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="text-center py-6 space-y-5">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/30"
                                            >
                                                <CheckCircle2 className="h-10 w-10 text-white" />
                                            </motion.div>
                                            <h3 className="text-2xl font-extrabold text-slate-800">تم بناء الفريق!</h3>
                                            <p className="text-sm text-slate-500">انسخ الكود السري وشاركه مع فريقك:</p>

                                            <div
                                                className="bg-gradient-to-r from-slate-100 to-slate-50 border-2 border-dashed border-primary/30 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(createdTeamCode);
                                                    toast.success('تم النسخ!');
                                                }}
                                            >
                                                <code className="text-3xl font-mono font-black text-primary tracking-widest uppercase">
                                                    {createdTeamCode}
                                                </code>
                                                <Copy size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                                            </div>

                                            <button
                                                onClick={() => router.push('/board')}
                                                className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                            >
                                                الدخول للوحة التحكم <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Return Link */}
                    {team && !createdTeamCode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 text-center"
                        >
                            <button
                                onClick={() => router.push('/board')}
                                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                            >
                                مرحباً {currentUser?.username}, عد إلى اللوحة <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>


        </main>
    );
}

export default function Home() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-primary/5">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">جاري التحميل...</p>
                </div>
            </div>
        }>
            <HomeContent />
        </Suspense>
    );
}
