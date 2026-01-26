'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { Users, LogIn, ArrowRight, Sparkles, Copy } from 'lucide-react';

export default function Home() {
    const router = useRouter();
    const setTeam = useStore((state) => state.setTeam);
    const currentTeam = useStore((state) => state.team);

    // If already logged in, show button to go to board
    useEffect(() => {
        if (currentTeam?.id) {
            // Optional: Auto redirect or show "Continue as..."
        }
    }, [currentTeam]);

    const [activeTab, setActiveTab] = useState<'join' | 'create'>('join');

    // Join Form State
    const [secretCode, setSecretCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    // Create Form State
    const [teamName, setTeamName] = useState('');
    const [teamDesc, setTeamDesc] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!secretCode) return;

        setIsJoining(true);
        try {
            const res = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secret_code: secretCode }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to join team');
            }

            setTeam(data);
            toast.success(`تم الانضمام إلى ${data.name} بنجاح!`);
            router.push('/board');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsJoining(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamName) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/teams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: teamName, description: teamDesc }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create team');
            }

            setCreatedTeamCode(data.secret_code);
            setTeam(data);
            toast.success('تم إنشاء الفريق بنجاح! انسخ الكود السري.');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    const copyCode = () => {
        if (createdTeamCode) {
            navigator.clipboard.writeText(createdTeamCode);
            toast.success('تم نسخ الكود!');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        مُساعد الفريق
                    </h1>
                    <p className="text-gray-500">نظم مهام فريقك بذكاء وأناقة</p>
                </div>

                <div className="glass-panel rounded-2xl p-1 overflow-hidden">
                    <div className="flex w-full mb-6 bg-gray-100/50 rounded-xl p-1">
                        <button
                            onClick={() => setActiveTab('join')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'join'
                                    ? 'bg-white shadow-sm text-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            انضمام لفريق
                        </button>
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'create'
                                    ? 'bg-white shadow-sm text-purple-600'
                                    : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            إنشاء فريق
                        </button>
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="p-4"
                    >
                        {activeTab === 'join' ? (
                            <form onSubmit={handleJoin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الكود السري للفريق
                                    </label>
                                    <div className="relative">
                                        <LogIn className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                            placeholder="أدخل الكود هنا..."
                                            value={secretCode}
                                            onChange={(e) => setSecretCode(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isJoining || !secretCode}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isJoining ? 'جاري الانضمام...' : 'دخول للوحة المهام'}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                {!createdTeamCode ? (
                                    <form onSubmit={handleCreate} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                اسم الفريق
                                            </label>
                                            <div className="relative">
                                                <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                                    placeholder="مثال: فريق التصميم"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                وصف الفريق (اختياري)
                                            </label>
                                            <textarea
                                                className="w-full p-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                                placeholder="نبذة عن الفريق..."
                                                rows={2}
                                                value={teamDesc}
                                                onChange={(e) => setTeamDesc(e.target.value)}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isCreating || !teamName}
                                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCreating ? 'جاري الإنشاء...' : 'إنشاء الفريق الجديد'}
                                        </button>
                                    </form>
                                ) : (
                                    <div className="text-center py-4 space-y-4">
                                        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                            <Sparkles className="h-6 w-6 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800">تم إنشاء الفريق بنجاح!</h3>
                                        <p className="text-sm text-gray-500">شارك هذا الكود مع أعضاء فريقك للانضمام:</p>

                                        <div className="bg-white border-2 border-dashed border-purple-200 rounded-xl p-4 flex items-center justify-between group cursor-pointer hover:border-purple-400 transition-colors"
                                            onClick={copyCode}
                                        >
                                            <code className="text-2xl font-mono font-bold text-purple-600 tracking-wider">
                                                {createdTeamCode}
                                            </code>
                                            <button className="p-2 text-gray-400 group-hover:text-purple-600 transition-colors">
                                                <Copy size={20} />
                                            </button>
                                        </div>

                                        <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                                            احتفظ بهذا الكود! لن يظهر لك مرة أخرى.
                                        </p>

                                        <button
                                            onClick={() => router.push('/board')}
                                            className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                                        >
                                            الذهاب إلى اللوحة <ArrowRight size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {currentTeam && !createdTeamCode && (
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 mb-2">أنت عضو في {currentTeam.name}</p>
                        <button
                            onClick={() => router.push('/board')}
                            className="text-blue-600 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                        >
                            العودة إلى اللوحة <ArrowRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}
