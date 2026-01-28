'use client';

import { useEffect, useState } from 'react';
import { BarChart3, Users, Briefcase, CreditCard, TrendingUp, UserCheck } from 'lucide-react';

interface Stats {
    users: number;
    teams: number;
    tasks: number;
}

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                setData(data);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>جاري تحميل البيانات...</div>;

    return (
        <div className="space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">إحصائيات الموقع</h1>
                    <p className="text-slate-500">مرحباً بك مجدداً في لوحة التحكم</p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                    مشرف الموقع
                </div>
            </header>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard
                    title="إجمالي المستخدمين"
                    value={data.stats.users}
                    icon={<Users className="text-blue-600" size={24} />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="إجمالي الفرق"
                    value={data.stats.teams}
                    icon={<Briefcase className="text-purple-600" size={24} />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="إجمالي المهام"
                    value={data.stats.tasks}
                    icon={<TrendingUp className="text-green-600" size={24} />}
                    color="bg-green-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Plan Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <CreditCard size={20} className="text-slate-400" />
                        توزيع الباقات
                    </h3>
                    <div className="space-y-4">
                        {data.planStats.map((plan: any) => (
                            <div key={plan.plan_type} className="flex items-center justify-between">
                                <span className="text-slate-600 capitalize">{plan.plan_type === 'free' ? 'الباقة المجانية' : 'الباقة الاحترافية'}</span>
                                <div className="flex items-center gap-4 flex-1 mx-8">
                                    <div className="h-2 bg-slate-100 rounded-full flex-1 overflow-hidden">
                                        <div
                                            className={`h-full ${plan.plan_type === 'pro' ? 'bg-blue-600' : 'bg-slate-400'}`}
                                            style={{ width: `${(plan.count / data.stats.users) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-mono w-8">{Math.round((plan.count / data.stats.users) * 100)}%</span>
                                </div>
                                <span className="font-bold">{plan.count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Teams */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <UserCheck size={20} className="text-slate-400" />
                        الفرق الأكثر نشاطاً
                    </h3>
                    <div className="space-y-4">
                        {data.teams.map((team: any) => (
                            <div key={team.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="w-10 h-10 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold">
                                    {team.name[0]}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-semibold text-slate-900">{team.name}</h4>
                                    <p className="text-xs text-slate-500">{team.members_count} عضو</p>
                                </div>
                                <div className="text-sm font-bold text-blue-600">
                                    {team.secret_code}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
            <div>
                <p className="text-slate-500 text-sm mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-slate-900 font-mono">{value}</h3>
            </div>
        </div>
    );
}
