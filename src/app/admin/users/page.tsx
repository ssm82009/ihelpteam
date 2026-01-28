'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Edit2, Trash2, Calendar, User, Save, X } from 'lucide-react';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [editingUser, setEditingUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUsers = () => {
        setLoading(true);
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then((data: any) => {
                setUsers(data.recentUsers);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleUpdate = async (userId: string, data: any) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) {
                toast.success('تم تحديث بيانات العضو');
                setEditingUser(null);
                fetchUsers();
            } else {
                toast.error('فشل التحديث');
            }
        } catch (error) {
            toast.error('خطأ غير متوقع');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ سيتم حذف جميع مهامه وتعليقاته أيضاً.')) return;

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('تم حذف المستخدم');
                fetchUsers();
            } else {
                toast.error('فشل الحذف');
            }
        } catch (error) {
            toast.error('خطأ في الاتصال بالسيرفر');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">جاري تحميل الأعضاء...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <User className="text-blue-600" />
                إدارة الأعضاء
            </h1>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-right border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600">الاسم والبريد</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">نوع الباقة</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-center">نهاية الاشتراك</th>
                            <th className="px-6 py-4 text-sm font-bold text-slate-600 text-left">التحكم</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-900">{user.username}</div>
                                    <div className="text-xs text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {editingUser?.id === user.id ? (
                                        <select
                                            value={editingUser.plan_type}
                                            onChange={(e) => setEditingUser({ ...editingUser, plan_type: e.target.value })}
                                            className="px-2 py-1 rounded-lg border border-slate-200 text-sm outline-none"
                                        >
                                            <option value="free">مجانية</option>
                                            <option value="pro">احترافية</option>
                                        </select>
                                    ) : (
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${user.plan_type === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {user.plan_type === 'pro' ? 'PRO' : 'FREE'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {editingUser?.id === user.id ? (
                                        <input
                                            type="date"
                                            value={editingUser.subscription_end ? editingUser.subscription_end.split('T')[0] : ''}
                                            onChange={(e) => setEditingUser({ ...editingUser, subscription_end: e.target.value })}
                                            className="px-2 py-1 rounded-lg border border-slate-200 text-sm outline-none"
                                        />
                                    ) : (
                                        <div className="text-sm text-slate-600 flex items-center justify-center gap-1">
                                            <Calendar size={14} className="text-slate-400" />
                                            {user.subscription_end ? new Date(user.subscription_end).toLocaleDateString('ar-SA') : 'غير محدد'}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {editingUser?.id === user.id ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdate(user.id, { plan_type: editingUser.plan_type, subscription_end: editingUser.subscription_end })}
                                                    className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="حفظ"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="إلغاء"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => setEditingUser(user)}
                                                    className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
