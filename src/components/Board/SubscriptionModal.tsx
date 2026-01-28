import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Clock, Users, Layout } from 'lucide-react';
import { useStore } from '@/lib/store';
import { PLANS } from '@/lib/plans';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const { currentUser, setCurrentUser } = useStore();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const currentPlan = currentUser?.plan_type || 'free';

    const handleUpgrade = async () => {
        if (!currentUser?.email) return;

        setIsUpgrading(true);
        try {
            const res = await fetch('/api/subscription/paylink/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    username: currentUser.username,
                    planType: 'pro'
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to initiate payment');
            }

            const data = await res.json();

            // Redirect to Paylink payment page
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No payment URL returned');
            }
        } catch (error: any) {
            toast.error(error.message || 'فشل تجهيز عملية الدفع. حاول مرة أخرى.');
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        className="bg-card w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-border"
                    >
                        <div className="p-8 border-b border-border flex items-center justify-between bg-primary/5">
                            <div>
                                <h2 className="text-2xl font-black text-foreground">خطط الاشتراك</h2>
                                <p className="text-sm text-primary font-bold uppercase tracking-wider">اختر الباقة المناسبة لفريقك</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 hover:bg-muted rounded-2xl transition-all"
                            >
                                <X size={24} className="text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-8 grid md:grid-cols-2 gap-8">
                            {/* Free Plan */}
                            <div className={`relative p-6 rounded-3xl border-2 transition-all ${currentPlan === 'free' ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'}`}>
                                {currentPlan === 'free' && (
                                    <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                        باقتك الحالية
                                    </div>
                                )}
                                <div className="mb-6">
                                    <div className="h-12 w-12 bg-muted rounded-2xl flex items-center justify-center mb-4 text-muted-foreground">
                                        <Zap size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground">{PLANS.free.name}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-foreground">مجاني</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>مشروع واحد (فريق واحد)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>أقصى حد 5 أعضاء</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>مدة استخدام غير محدودة</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Pro Plan */}
                            <div className={`relative p-6 rounded-3xl border-2 transition-all shadow-xl ${currentPlan === 'pro' ? 'border-primary bg-primary/5' : 'border-primary/20 hover:border-primary/40 bg-card'}`}>
                                {currentPlan === 'pro' && (
                                    <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-primary/20">
                                        باقتك الحالية
                                    </div>
                                )}
                                <div className="mb-6">
                                    <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center mb-4 text-primary-foreground shadow-lg shadow-primary/20">
                                        <Star size={24} />
                                    </div>
                                    <h3 className="text-xl font-black text-foreground">{PLANS.pro.name}</h3>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-primary">199</span>
                                        <span className="text-sm font-bold text-muted-foreground mr-1">ر.س / سنة</span>
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>10 مشاريع (فرق عمل)</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>أقصى حد 10 أعضاء لكل فريق</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>صلاحية لمدة عام كامل</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                        <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span>دعم فني وتحديثات مستمرة</span>
                                    </li>
                                </ul>

                                <button
                                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50"
                                    onClick={handleUpgrade}
                                    disabled={isUpgrading}
                                >
                                    {isUpgrading ? 'جاري التحميل...' : (currentPlan === 'pro' ? 'تجديد الاشتراك' : 'اشترك الآن بـ 199 ر.س')}
                                </button>
                            </div>
                        </div>

                        <div className="p-6 bg-muted/10 border-t border-border flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                                <Clock size={14} />
                                <span>يتم منح جميع المستخدمين الباقة المجانية فور التسجيل.</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                            >
                                ربما لاحقاً
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
