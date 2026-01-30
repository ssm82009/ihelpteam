'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserMinus, User, Copy, Share2, Users, CheckCircle2, ClipboardList, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

interface Member {
    id: string;
    username: string;
    email: string;
}

interface TeamStats {
    totalMembers: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
}

interface MemberModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function MemberModal({ isOpen, onClose }: MemberModalProps) {
    const { team, currentUser } = useStore();
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [stats, setStats] = useState<TeamStats>({
        totalMembers: 0,
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0
    });

    useEffect(() => {
        if (isOpen && team?.id) {
            fetchMembers();
            fetchStats();
        }
    }, [isOpen, team?.id]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/teams/members?team_id=${team?.id}`);
            if (!res.ok) throw new Error('Failed to fetch members');
            const data = await res.json();
            setMembers(data);
            setStats(prev => ({ ...prev, totalMembers: data.length }));
        } catch (error) {
            toast.error('فشل في تحميل أعضاء الفريق');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch(`/api/tasks?team_id=${team?.id}`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            const tasks = await res.json();

            const totalTasks = tasks.length;
            const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;
            const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            setStats(prev => ({
                ...prev,
                totalTasks,
                completedTasks,
                completionRate
            }));
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const handleDeleteMember = async (userId: string, username: string) => {
        if (userId === currentUser?.id) {
            toast.error('لا يمكنك حذف نفسك من الفريق من هنا');
            return;
        }

        if (!confirm(`هل أنت متأكد من حذف العضو "${username}"؟`)) return;

        try {
            const res = await fetch(`/api/teams/members?user_id=${userId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete member');

            setMembers(members.filter(m => m.id !== userId));
            setStats(prev => ({ ...prev, totalMembers: prev.totalMembers - 1 }));
            toast.success(`تم حذف ${username} بنجاح`);
        } catch (error) {
            toast.error('فشل في حذف العضو');
        }
    };

    const copyInviteLink = () => {
        if (!team?.secret_code) return;
        const origin = window.location.origin;
        const link = `${origin}/?tab=join&code=${team.secret_code}`;
        navigator.clipboard.writeText(link);
        toast.success('تم نسخ رابط الدعوة كاملاً');
    };

    const statItems = [
        {
            label: 'أعضاء الفريق',
            value: stats.totalMembers,
            icon: Users,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            label: 'إجمالي المهام',
            value: stats.totalTasks,
            icon: ClipboardList,
            color: 'from-violet-500 to-purple-600',
            bgColor: 'bg-violet-50',
            textColor: 'text-violet-600'
        },
        {
            label: 'المهام المكتملة',
            value: stats.completedTasks,
            icon: CheckCircle2,
            color: 'from-emerald-500 to-green-600',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            label: 'نسبة الإنجاز',
            value: `${stats.completionRate}%`,
            icon: TrendingUp,
            color: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-8 md:p-12 bg-black/40 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-card w-full max-w-md max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden border border-border flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-violet-500/10 shrink-0">
                            <div>
                                <h2 className="text-lg font-black text-foreground">إدارة الفريق</h2>
                                <p className="text-[10px] text-primary font-bold uppercase tracking-wider">{team?.name}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-xl transition-colors"
                            >
                                <X size={18} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-5 space-y-5 overflow-y-auto flex-1">
                            {/* Stats Grid - Centered & Compact */}
                            <div className="grid grid-cols-4 gap-2">
                                {statItems.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`${stat.bgColor} rounded-xl p-3 text-center`}
                                    >
                                        <div className={`w-8 h-8 mx-auto rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-1.5 shadow-sm`}>
                                            <stat.icon className="w-4 h-4 text-white" />
                                        </div>
                                        <p className={`text-lg font-black ${stat.textColor}`}>{stat.value}</p>
                                        <p className="text-[8px] text-slate-500 font-bold leading-tight">{stat.label}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Invite Section - Compact */}
                            <div className="space-y-2">
                                <div
                                    onClick={() => {
                                        const site = window.location.origin;
                                        const text = `انضم لفريقي على مساعد الفريق!\nالرابط: ${site}\nرمز الفريق: ${team?.secret_code}`;
                                        navigator.clipboard.writeText(text);
                                        toast.success('تم نسخ الرمز ورابط الموقع معاً');
                                    }}
                                    className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-dashed border-primary/20 rounded-xl cursor-pointer hover:border-primary/40 transition-all group"
                                >
                                    <div className="flex flex-col gap-1 text-center">
                                        <span className="text-[9px] font-black text-primary/50 uppercase tracking-widest">رمز فريقك</span>
                                        <code className="text-2xl font-mono font-black text-primary tracking-widest">
                                            {team?.secret_code}
                                        </code>
                                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                            <Copy size={10} className="group-hover:text-primary transition-colors" />
                                            <span className="text-[9px]">اضغط للنسخ</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={copyInviteLink}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] hover:shadow-xl group"
                                >
                                    <Share2 size={16} className="group-hover:rotate-12 transition-transform" />
                                    <span>نسخ رابط الانضمام</span>
                                </button>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Members List Section - Compact */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-foreground">
                                        الأعضاء ({members.length}/{currentUser?.plan_type === 'pro' ? 10 : 5})
                                    </label>
                                    {currentUser?.plan_type === 'free' && (
                                        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">مجانية</span>
                                    )}
                                </div>

                                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1 custom-scrollbar">
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="h-14 bg-muted/40 rounded-2xl animate-pulse" />
                                        ))
                                    ) : members.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground text-sm">لا يوجد أعضاء آخرين</p>
                                        </div>
                                    ) : (
                                        members.map((member, index) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="group flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border rounded-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-xl flex items-center justify-center text-primary font-bold">
                                                        {member.username.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                                            {member.username}
                                                            {member.id === team?.admin_id && (
                                                                <span className="text-[9px] bg-gradient-to-r from-amber-500 to-orange-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase">رئيس الفريق</span>
                                                            )}
                                                            {member.id === currentUser?.id && (
                                                                <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black uppercase">أنت</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-medium">{member.email}</p>
                                                    </div>
                                                </div>

                                                {member.id !== currentUser?.id && currentUser?.id === team?.admin_id && (
                                                    <button
                                                        onClick={() => handleDeleteMember(member.id, member.username)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        title="حذف من الفريق"
                                                    >
                                                        <UserMinus size={18} />
                                                    </button>
                                                )}
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-muted/10 border-t border-border">
                            <button
                                onClick={onClose}
                                className="w-full bg-card text-foreground py-3 rounded-xl font-bold border border-border shadow-sm hover:bg-muted transition-colors"
                            >
                                إغلاق
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
