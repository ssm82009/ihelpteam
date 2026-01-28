'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('تم إرسال كود التحقق لبريدك');
                setStep(2);
            } else {
                toast.error(data.error || 'فشل في إرسال الكود');
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/admin/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('تم الدخول بنجاح');
                router.push('/admin');
            } else {
                toast.error(data.error || 'كود غير صحيح');
            }
        } catch (error) {
            toast.error('حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">لوحة التحكم</h1>
                    <p className="text-slate-500">سجل دخولك للمتابعة كمسؤول</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-right"
                                placeholder="example@gmail.com"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'جاري الإرسال...' : 'إرسال كود التحقق'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">كود التحقق</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                        >
                            {loading ? 'جاري التحقق...' : 'دخول'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="w-full text-slate-500 text-sm hover:underline"
                        >
                            تغيير البريد الإلكتروني
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
