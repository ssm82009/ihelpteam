'use client';
import { useEffect, useState } from 'react';

export default function AdminTeams() {
    const [teams, setTeams] = useState([]);

    useEffect(() => {
        fetch('/api/admin/stats').then(res => res.json()).then(data => setTeams(data.teams));
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">إحصائيات الفرق</h1>
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full text-right">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">اسم الفريق</th>
                            <th className="px-6 py-4">الكود السري</th>
                            <th className="px-6 py-4">عدد الأعضاء</th>
                            <th className="px-6 py-4">رئيس الفريق</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team: any) => (
                            <tr key={team.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-semibold">{team.name}</td>
                                <td className="px-6 py-4 text-blue-600 font-mono">{team.secret_code}</td>
                                <td className="px-6 py-4">{team.members_count}</td>
                                <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-[150px]">{team.admin_id || '---'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
