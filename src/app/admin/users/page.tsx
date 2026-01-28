'use client';
import { useEffect, useState } from 'react';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        fetch('/api/admin/stats').then(res => res.json()).then(data => setUsers(data.recentUsers));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">إدارة الأعضاء</h1>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">الاسم</th>
                            <th className="px-6 py-4">البريد الإلكتروني</th>
                            <th className="px-6 py-4">نوع الباقة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user: any) => (
                            <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold">{user.username}</td>
                                <td className="px-6 py-4">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.plan_type === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {user.plan_type === 'pro' ? 'احترافية' : 'مجانية'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
