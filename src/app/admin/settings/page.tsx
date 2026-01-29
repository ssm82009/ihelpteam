'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save, Image as ImageIcon, Search, Phone as AppWindow, RefreshCcw } from 'lucide-react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        site_name: 'مساعد الفريق',
        site_logo_url: '',
        site_favicon_url: '',
        seo_title: '',
        seo_description: '',
        pwa_enabled: 'true',
        pwa_theme_color: '#4f46e5'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings?type=site', { cache: 'no-store' })
            .then(res => res.json())
            .then((data: any) => {
                if (!data.error) setSettings(prev => ({ ...prev, ...data }));
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/settings?type=site', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                toast.success('تم حفظ إعدادات الموقع بنجاح');
            } else {
                toast.error('فشل في الحفظ');
            }
        } catch (error) {
            toast.error('خطأ غير متوقع');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل إعدادات الموقع...</div>;

    return (
        <div className="space-y-8" dir="rtl">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Settings className="text-blue-600" />
                        إعدادات الموقع
                    </h1>
                    <p className="text-slate-500 mt-2 text-sm">تحكم في هوية الموقع وبيانات محركات البحث وتطبيق الويب</p>
                </div>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200"
                >
                    <Save size={20} />
                    حفظ التغييرات
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <ImageIcon size={18} className="text-blue-500" />
                        الهوية البصرية
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">اسم الموقع</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                                value={settings.site_name}
                                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                                placeholder="مثلاً: مساعد الفريق"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">رابط الشعار (Logo URL)</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                value={settings.site_logo_url}
                                onChange={(e) => setSettings({ ...settings, site_logo_url: e.target.value })}
                                placeholder="https://path-to-image.png"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">رابط الفاف آيكون (Favicon URL)</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                                value={settings.site_favicon_url}
                                onChange={(e) => setSettings({ ...settings, site_favicon_url: e.target.value })}
                                placeholder="https://path-to-icon.ico"
                            />
                        </div>
                    </div>
                </div>

                {/* SEO Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <Search size={18} className="text-emerald-500" />
                        تحسين محركات البحث (SEO)
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">عنوان البحث (SEO Title)</label>
                            <input
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                value={settings.seo_title}
                                onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                                placeholder="العنوان المعروض في جوجل"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">وصف الموقع (SEO Description)</label>
                            <textarea
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm min-h-[100px]"
                                value={settings.seo_description}
                                onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                                placeholder="اكتب وصفاً جذاباً لموقعك يظهر في نتائج البحث"
                            />
                        </div>
                    </div>
                </div>

                {/* PWA Settings */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 space-y-6 lg:col-span-2">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 border-b border-slate-50 pb-4">
                        <AppWindow size={18} className="text-purple-500" />
                        تطبيق الويب (PWA)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                <div>
                                    <h4 className="font-bold text-slate-800">تفعيل PWA</h4>
                                    <p className="text-xs text-slate-400">السماح بتثبيت الموقع كفني تطبيق على الجوال</p>
                                </div>
                                <div className="flex bg-slate-200 rounded-lg p-1">
                                    <button
                                        onClick={() => setSettings({ ...settings, pwa_enabled: 'true' })}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${settings.pwa_enabled === 'true' ? 'bg-white shadow text-blue-600' : 'text-slate-500'}`}
                                    >مفعل</button>
                                    <button
                                        onClick={() => setSettings({ ...settings, pwa_enabled: 'false' })}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${settings.pwa_enabled === 'false' ? 'bg-white shadow text-red-600' : 'text-slate-500'}`}
                                    >معطل</button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">لون السمة (Theme Color)</label>
                            <div className="flex gap-4">
                                <input
                                    type="color"
                                    className="w-12 h-12 bg-transparent border-0 cursor-pointer"
                                    value={settings.pwa_theme_color}
                                    onChange={(e) => setSettings({ ...settings, pwa_theme_color: e.target.value })}
                                />
                                <input
                                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono"
                                    value={settings.pwa_theme_color}
                                    onChange={(e) => setSettings({ ...settings, pwa_theme_color: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <p className="text-slate-400 text-xs flex items-center gap-2">
                    <RefreshCcw size={14} />
                    يجب إعادة تحميل الصفحة في المتصفح لتطبيق بعض التغييرات (مثل الفاف آيكون)
                </p>
            </div>
        </div>
    );
}
