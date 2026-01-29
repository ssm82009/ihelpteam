'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Copy, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

interface CreateTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateTeamModal({ isOpen, onClose }: CreateTeamModalProps) {
    const { currentUser, setTeam } = useStore();
    const [teamName, setTeamName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsCreating(true);
        try {
            const res = await fetch('/api/teams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName,
                    description: '',
                    // Use existing user credentials
                    admin_name: currentUser.username,
                    admin_email: currentUser.email,
                    admin_password: '', // API should handle existing users without password re-entry if needed, or we might need a specific endpoint
                    is_existing_user: true
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setCreatedTeamCode(data.secret_code);
            // Don't switch team yet, let them copy the code
            toast.success('تم إنشاء الفريق بنجاح!');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-card border border-border rounded-[32px] shadow-2xl overflow-hidden relative"
            >
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-foreground">إنشاء فريق جديد</h2>
                            <p className="text-sm text-muted-foreground font-bold mt-1">ابدأ بتأسيس مساحة عمل جديدة</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 bg-secondary/50 hover:bg-secondary rounded-full flex items-center justify-center transition-colors border border-border"
                        >
                            <X size={20} className="text-muted-foreground" />
                        </button>
                    </div>

                    {!createdTeamCode ? (
                        <form onSubmit={handleCreate} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">اسم الفريق</label>
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full px-5 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground font-bold"
                                    placeholder="مثال: فريق الإبداع"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                            >
                                {isCreating ? (
                                    <>
                                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>جاري التأسيس...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} />
                                        <span>تأسيس الفريق</span>
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-4 space-y-6 animate-in zoom-in duration-300">
                            <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center border border-emerald-500/20">
                                <Sparkles className="h-10 w-10 text-emerald-500 animate-pulse" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-foreground">مبارك! تم بناء الفريق</h3>
                                <p className="text-sm text-muted-foreground font-bold italic">انسخ الكود وشاركه مع زملائك الجدد</p>
                            </div>

                            <div
                                className="bg-primary/5 border-2 border-dashed border-primary/30 rounded-3xl p-6 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all active:scale-95"
                                onClick={() => {
                                    navigator.clipboard.writeText(createdTeamCode);
                                    toast.success('تم نسخ الرمز بنجاح!');
                                }}
                            >
                                <code className="text-4xl font-mono font-black text-primary tracking-[0.2em] uppercase">
                                    {createdTeamCode}
                                </code>
                                <Copy size={24} className="text-primary/40 group-hover:text-primary transition-colors" />
                            </div>

                            <button
                                onClick={() => {
                                    // Switch to the new team by reloading or using window.location
                                    window.location.reload();
                                }}
                                className="w-full bg-foreground text-background py-4 rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all"
                            >
                                الانتقال للفريق الجديد <ArrowRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
