'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CreditCard, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function AdminPlans() {
    const [plans, setPlans] = useState<any[]>([]);
    const [editingPlan, setEditingPlan] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlans = () => {
        setLoading(true);
        fetch('/api/admin/plans')
            .then(res => res.json())
            .then(data => {
                setPlans(data);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSave = async (id: string, data: any) => {
        const url = id === 'new' ? '/api/admin/plans' : `/api/admin/plans/${id}`;
        const method = id === 'new' ? 'POST' : 'PATCH';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success('تم الحفظ بنجاح');
                setEditingPlan(null);
                fetchPlans();
            } else {
                toast.error('فشل في الحفظ');
            }
        } catch (error) {
            toast.error('خطأ غير متوقع');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
        try {
            const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('تم حذف الباقة');
                fetchPlans();
            }
        } catch (error) {
            toast.error('خطأ في الحذف');
        }
    };

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CreditCard className="text-blue-600" />
                    إدارة الباقات
                </h1>
                <button
                    onClick={() => setEditingPlan({ id: 'new', name: '', max_teams: 5, max_members: 10, price: 0, duration: '1 year', is_default: false })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 transition-all font-semibold"
                >
                    <Plus size={20} />
                    إضافة باقة جديدة
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {editingPlan && editingPlan.id === 'new' && (
                    <PlanEditor plan={editingPlan} onSave={(data) => handleSave('new', data)} onCancel={() => setEditingPlan(null)} />
                )}
                {plans.map((plan) => (
                    editingPlan?.id === plan.id ? (
                        <PlanEditor key={plan.id} plan={editingPlan} onSave={(data) => handleSave(plan.id, data)} onCancel={() => setEditingPlan(null)} />
                    ) : (
                        <div key={plan.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                                    <div className="text-2xl font-black text-blue-600 mt-1">{plan.price} ر.س</div>
                                </div>
                                {plan.is_default && (
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">باقة افتراضية</span>
                                )}
                            </div>
                            <div className="space-y-3 flex-1 text-slate-600 text-sm mb-6">
                                <div className="flex items-center gap-2">✔ أقصى عدد للفرق: {plan.max_teams}</div>
                                <div className="flex items-center gap-2">✔ أقصى عدد للأعضاء: {plan.max_members} لكل فريق</div>
                                <div className="flex items-center gap-2">✔ مدة الاشتراك: {plan.duration}</div>
                            </div>
                            <div className="flex items-center gap-2 pt-4 border-t border-slate-50">
                                <button onClick={() => setEditingPlan(plan)} className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-50 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">
                                    <Edit2 size={16} /> تعديل
                                </button>
                                <button onClick={() => handleDelete(plan.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
}

function PlanEditor({ plan, onSave, onCancel }: any) {
    const [data, setData] = useState(plan);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-blue-500 scale-[1.02] transition-all">
            <h3 className="font-bold mb-4 text-blue-600">{plan.id === 'new' ? 'باقة جديدة' : 'تعديل الباقة'}</h3>
            <div className="space-y-4">
                <input
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    placeholder="اسم الباقة"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        placeholder="السعر"
                        value={data.price}
                        onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
                    />
                    <input
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        placeholder="المدة (مثلاً 1 year)"
                        value={data.duration}
                        onChange={(e) => setData({ ...data, duration: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="number"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        placeholder="أقصى عدد للفرق"
                        value={data.max_teams}
                        onChange={(e) => setData({ ...data, max_teams: Number(e.target.value) })}
                    />
                    <input
                        type="number"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                        placeholder="أقصى عدد للأعضاء"
                        value={data.max_members}
                        onChange={(e) => setData({ ...data, max_members: Number(e.target.value) })}
                    />
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                    <input type="checkbox" checked={data.is_default} onChange={(e) => setData({ ...data, is_default: e.target.checked })} />
                    تعيين كباقة افتراضية للأعضاء الجدد
                </label>
                <div className="flex gap-2 pt-2">
                    <button onClick={() => onSave(data)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-2">
                        <Save size={16} /> حفظ
                    </button>
                    <button onClick={onCancel} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200">
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
