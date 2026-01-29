import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Star, Zap, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';
import { toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const { currentUser } = useStore();
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const currentPlan = currentUser?.plan_type || 'free';

    useEffect(() => {
        if (isOpen) {
            fetch('/api/admin/plans', { cache: 'no-store' })
                .then(res => res.json())
                .then((data: any) => {
                    setPlans(data);
                    setLoading(false);
                });
        }
    }, [isOpen]);

    const handleUpgrade = async (planId: string) => {
        if (!currentUser?.email) return;

        setIsUpgrading(true);
        try {
            const res = await fetch('/api/subscription/paylink/create-invoice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: currentUser.email,
                    username: currentUser.username,
                    planType: planId
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to initiate payment');
            }

            const data = await res.json();

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
                        className="bg-card w-full max-w-4xl rounded-[32px] shadow-2xl overflow-hidden border border-border"
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

                        <div className="p-8">
                            {loading ? (
                                <div className="text-center py-12 text-slate-500 font-bold">جاري تحميل الباقات...</div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 overflow-y-auto max-h-[60vh] p-2">
                                    {plans.map((plan: any) => (
                                        <div key={plan.id} className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col ${currentPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40 shadow-xl shadow-black/5'}`}>
                                            {currentPlan === plan.id && (
                                                <div className="absolute -top-3 right-6 bg-primary text-primary-foreground text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                    باقتك الحالية
                                                </div>
                                            )}
                                            <div className="mb-6">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${plan.price > 0 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted text-muted-foreground'}`}>
                                                    {plan.price > 0 ? <Star size={24} /> : <Zap size={24} />}
                                                </div>
                                                <h3 className="text-xl font-black text-foreground">{plan.name}</h3>
                                                <div className="mt-2 flex items-baseline gap-1">
                                                    <span className={`text-3xl font-black ${plan.price > 0 ? 'text-primary' : 'text-foreground'}`}>{plan.price === 0 ? 'مجاني' : plan.price}</span>
                                                    {plan.price > 0 && <span className="text-sm font-bold text-muted-foreground mr-1">ر.س / {plan.duration}</span>}
                                                </div>
                                            </div>

                                            <ul className="space-y-4 mb-8 flex-1">
                                                <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                                    <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                    <span>{plan.max_teams} مشاريع (فرق عمل)</span>
                                                </li>
                                                <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                                    <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                    <span>أقصى حد {plan.max_members} أعضاء لكل فريق</span>
                                                </li>
                                                <li className="flex items-center gap-3 text-sm font-bold text-foreground/80">
                                                    <div className="h-5 w-5 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                    <span>مدة الصلاحية: {plan.duration === 'unlimited' ? 'غير محدودة' : plan.duration}</span>
                                                </li>
                                            </ul>

                                            {plan.price > 0 ? (
                                                <button
                                                    className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-[0.98] disabled:opacity-50"
                                                    onClick={() => handleUpgrade(plan.id)}
                                                    disabled={isUpgrading}
                                                >
                                                    {isUpgrading ? 'جاري التحميل...' : (currentPlan === plan.id ? 'تجديد الاشتراك' : `اشترك الآن بـ ${plan.price} ر.س`)}
                                                </button>
                                            ) : (
                                                <div className="w-full py-4 text-center text-muted-foreground font-black border border-dashed border-border rounded-2xl">
                                                    متوفر افتراضياً
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
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
