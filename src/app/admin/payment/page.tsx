'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { LayoutDashboard, Save, Globe, Lock, ShieldCheck } from 'lucide-react';

export default function AdminPayment() {
    const [settings, setSettings] = useState({
        paylink_api_id: '',
        paylink_secret_key: '',
        paylink_base_url: 'https://restapi.paylink.sa',
        payment_callback_url: '',
        payment_cancel_url: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings?type=payment')
            .then(res => res.json())
            .then(data => {
                if (!data.error) setSettings(prev => ({ ...prev, ...data }));
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/settings?type=payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                toast.success('تم حفظ إعدادات الدفع بنجاح');
            } else {
                toast.error('فشل في الحفظ');
            }
        } catch (error) {
            toast.error('خطأ غير متوقع');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الإعدادات...</div>;

    return (
        <div className="space-y-8" dir="rtl">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <LayoutDashboard className="text-blue-600" />
                    إدارة بوابة الدفع
                </h1>
                <p className="text-slate-500 mt-2 text-sm">قم بضبط مفاتيح الربط مع Paylink لإتمام عمليات الدفع</p>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 max-w-2xl mx-auto space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Lock size={18} className="text-slate-400" />
                        بيانات الربط (Paylink)
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">App ID / API ID</label>
                        <input
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                            value={settings.paylink_api_id}
                            onChange={(e) => setSettings({ ...settings, paylink_api_id: e.target.value })}
                            placeholder="APP_ID_..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Secret Key</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                            value={settings.paylink_secret_key}
                            onChange={(e) => setSettings({ ...settings, paylink_secret_key: e.target.value })}
                            placeholder="••••••••••••••••••••••••••••••••"
                        />
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                        <Globe size={18} className="text-slate-400" />
                        عناوين السيرفر والتحويل
                    </h3>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">Base API URL</label>
                        <select
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                            value={settings.paylink_base_url}
                            onChange={(e) => setSettings({ ...settings, paylink_base_url: e.target.value })}
                        >
                            <option value="https://restapi.paylink.sa">الإنتاج (Production)</option>
                            <option value="https://sandbox.paylink.sa">التجربة (Sandbox)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">رابط النجاح (Callback)</label>
                            <input
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                value={settings.payment_callback_url}
                                onChange={(e) => setSettings({ ...settings, payment_callback_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500">رابط الإلغاء (Cancel)</label>
                            <input
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                value={settings.payment_cancel_url}
                                onChange={(e) => setSettings({ ...settings, payment_cancel_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        onClick={handleSave}
                        className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg active:scale-[0.98]"
                    >
                        <ShieldCheck size={20} />
                        حفظ جميع الإعدادات الأمنية
                    </button>
                </div>
            </div>
        </div>
    );
}
