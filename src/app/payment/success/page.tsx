'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    const returnPath = searchParams.get('returnPath') || '/';

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        const redirect = setTimeout(() => {
            router.push(returnPath);
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(redirect);
        };
    }, [router, returnPath]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-10 text-center border border-slate-100">
                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-bounce">
                        <CheckCircle size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4">تم الدفع بنجاح!</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    شكراً لك! تم تفعيل اشتراكك بنجاح. يمكنك الآن الاستمتاع بكافة مميزات الباقة الجديدة.
                </p>

                <div className="bg-slate-50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 text-sm text-slate-500 font-bold">
                    <Loader2 size={18} className="animate-spin text-blue-500" />
                    سيتم تحويلك تلقائياً خلال {countdown} ثواني...
                </div>

                <Link
                    href={returnPath}
                    className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                >
                    العودة الآن
                    <ArrowRight size={20} className="rotate-180" />
                </Link>
            </div>
        </div>
    );
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400">جاري التحميل...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
