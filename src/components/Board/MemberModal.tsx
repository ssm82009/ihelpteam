'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserMinus, User, Mail, Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

interface Member {
    id: string;
    username: string;
    email: string;
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

    useEffect(() => {
        if (isOpen && team?.id) {
            fetchMembers();
        }
    }, [isOpen, team?.id]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/teams/members?team_id=${team?.id}`);
            if (!res.ok) throw new Error('Failed to fetch members');
            const data = await res.json();
            setMembers(data);
        } catch (error) {
            toast.error('فشل في تحميل أعضاء الفريق');
        } finally {
            setIsLoading(false);
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
            toast.success(`تم حذف ${username} بنجاح`);
        } catch (error) {
            toast.error('فشل في حذف العضو');
        }
    };

    const copyTeamCode = () => {
        if (!team?.secret_code) return;
        navigator.clipboard.writeText(team.secret_code);
        setCopied(true);
        toast.success('تم نسخ رمز الفريق');
        setTimeout(() => setCopied(false), 2000);
    };

    const copyInviteLink = () => {
        if (!team?.secret_code) return;
        const origin = window.location.origin;
        const link = `${origin}/?tab=join&code=${team.secret_code}`;
        navigator.clipboard.writeText(link);
        toast.success('تم نسخ رابط الدعوة كاملاً');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/40 backdrop-blur-sm transition-colors duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-card w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-border"
                    >
                        <div className="p-6 border-b border-border flex items-center justify-between bg-primary/5">
                            <div>
                                <h2 className="text-xl font-black text-foreground">إدارة الفريق</h2>
                                <p className="text-xs text-primary font-bold uppercase tracking-wider">الأعضاء والوصول</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-xl transition-colors shadow-sm"
                            >
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* consolidated Invitation methods */}
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <div
                                        onClick={() => {
                                            const site = window.location.origin;
                                            const text = `انضم لفريقي على مساعد الفريق!\nالرابط: ${site}\nرمز الفريق: ${team?.secret_code}`;
                                            navigator.clipboard.writeText(text);
                                            toast.success('تم نسخ الرمز ورابط الموقع معاً');
                                        }}
                                        className="p-4 bg-muted/30 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-primary/50 uppercase tracking-widest">رمز فريقك</span>
                                                <Copy size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                                            </div>
                                            <code className="text-2xl font-mono font-black text-primary tracking-widest">
                                                {team?.secret_code}
                                            </code>
                                            <div className="h-px bg-border w-full my-1" />
                                            <div className="flex items-center gap-1.2">
                                                <span className="text-[9px] font-bold text-muted-foreground truncate">
                                                    {typeof window !== 'undefined' ? window.location.origin : ''}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors pointer-events-none" />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-center font-medium italic">انسخ الرمز والرابط بضغطة واحدة</p>
                                </div>

                                <div className="relative py-4 flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border"></div>
                                    </div>
                                    <span className="relative px-6 bg-card text-lg font-black text-muted-foreground uppercase">أو</span>
                                </div>

                                <div className="space-y-3">
                                    <button
                                        onClick={copyInviteLink}
                                        className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-xl shadow-primary/10 transition-all active:scale-[0.98] group"
                                    >
                                        <Share2 size={20} className="group-hover:rotate-12 transition-transform" />
                                        <span>نسخ رابط الانضمام المباشر</span>
                                    </button>
                                    <p className="text-[10px] text-muted-foreground text-center font-medium">رابط واحد ذكي (الأسرع)</p>
                                </div>
                            </div>

                            <div className="h-px bg-border" />

                            {/* Members List Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-foreground">
                                        أعضاء الفريق ({members.length}/{currentUser?.plan_type === 'pro' ? 10 : 5})
                                    </label>
                                    {currentUser?.plan_type === 'free' && (
                                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">باقة مجانية</span>
                                    )}
                                </div>

                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                    {isLoading ? (
                                        [1, 2, 3].map(i => (
                                            <div key={i} className="h-14 bg-muted/40 rounded-2xl animate-pulse" />
                                        ))
                                    ) : members.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground text-sm">لا يوجد أعضاء آخرين</p>
                                        </div>
                                    ) : (
                                        members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="group flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 border border-transparent hover:border-border rounded-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                        <User size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                                            {member.username}
                                                            {member.id === team?.admin_id && (
                                                                <span className="text-[9px] bg-status-exec text-white px-1.5 py-0.5 rounded-full font-black uppercase">قائد الفريق</span>
                                                            )}
                                                            {member.id === currentUser?.id && (
                                                                <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-black uppercase">أنت</span>
                                                            )}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground font-medium">{member.email}</p>
                                                    </div>
                                                </div>

                                                {member.id !== currentUser?.id && (
                                                    <button
                                                        onClick={() => handleDeleteMember(member.id, member.username)}
                                                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        title="حذف من الفريق"
                                                    >
                                                        <UserMinus size={18} />
                                                    </button>
                                                )}
                                            </div>
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
