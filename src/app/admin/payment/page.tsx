export default function AdminPlaceholder({ params }: any) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">إدارة بوابة الدفع</h1>
            <p className="text-slate-500 max-w-md">يمكنك هنا تتبع العمليات المالية وإدارة إعدادات بوابات الدفع (Paylink).</p>
        </div>
    );
}
