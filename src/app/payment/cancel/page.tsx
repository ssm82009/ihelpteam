'use client';
import { XCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function CancelContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const returnPath = searchParams.get('returnPath') || '/';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
            <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl p-10 text-center border border-slate-100">
                <div className="mb-6 flex justify-center">
                    <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                        <XCircle size={48} />
                    </div>
                </div>

                <h1 className="text-3xl font-black text-slate-900 mb-4">تعذر إتمام الدفع</h1>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    لقد تم إلغاء عملية الدفع أو حدث خطأ أثناء المعالجة. لم يتم خصم أي مبالغ من حسابك.
                </p>

                <div className="grid grid-cols-1 gap-3">
                    <button
                        onClick={() => router.push(returnPath)}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        <RefreshCcw size={20} />
                        العودة للوحة الفريق
                    </button>

                    {/* Fallback link nicely tucked away */}
                    <Link
                        href="/"
                        className="text-xs text-slate-400 font-bold hover:text-slate-600 transition-colors mt-2"
                    >
                        أو العودة للصفحة الرئيسية
                    </Link>
                </div>

                <p className="mt-8 text-xs text-slate-400 font-medium">
                    إذا واجهت مشكلة مستمرة، يرجى التواصل مع الدعم الفني.
                </p>
            </div>
        </div>
    );
}

export default function PaymentCancel() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-slate-400">جاري التحميل...</div>}>
            <CancelContent />
        </Suspense>
    );
}
