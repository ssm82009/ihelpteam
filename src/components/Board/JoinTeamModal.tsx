'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Users, ArrowRight, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStore } from '@/lib/store';

interface JoinTeamModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function JoinTeamModal({ isOpen, onClose }: JoinTeamModalProps) {
    const { currentUser, setTeam, setCurrentUser } = useStore();
    const [secretCode, setSecretCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;

        setIsJoining(true);
        try {
            const res = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret_code: secretCode,
                    email: currentUser.email,
                    // No need for password/username as we updated the API to handle existing users
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            toast.success(`تم الانضمام لـ ${data.team.name} بنجاح!`);

            // Switch to the new team
            setTeam(data.team);
            setCurrentUser(data.user);

            onClose();

            // Fast reload to clear hooks and state
            setTimeout(() => window.location.reload(), 300);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsJoining(false);
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
                            <h2 className="text-2xl font-black text-foreground">انضمام لفريق</h2>
                            <p className="text-sm text-muted-foreground font-bold mt-1">أدخل رمز الفريق للبدء بالتعاون</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="h-10 w-10 bg-secondary/50 hover:bg-secondary rounded-full flex items-center justify-center transition-colors border border-border"
                        >
                            <X size={20} className="text-muted-foreground" />
                        </button>
                    </div>

                    <form onSubmit={handleJoin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-primary uppercase tracking-widest mr-1">كود الفريق</label>
                            <div className="relative group">
                                <LogIn className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    required
                                    autoFocus
                                    className="w-full pr-12 pl-5 py-4 bg-muted/30 border border-border rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all text-foreground font-bold font-mono tracking-widest uppercase"
                                    placeholder="مثال: ABC123"
                                    value={secretCode}
                                    onChange={(e) => setSecretCode(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                            <p className="text-[10px] text-amber-700 leading-relaxed font-bold">
                                * سيتم استخدام بيانات حسابك الحالية للانضمام لهذا الفريق تلقائياً.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isJoining}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
                        >
                            {isJoining ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>جاري الانضمام...</span>
                                </>
                            ) : (
                                <>
                                    <Users size={20} />
                                    <span>انضم الآن</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
