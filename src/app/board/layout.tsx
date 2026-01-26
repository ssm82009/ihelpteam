'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

export default function BoardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const team = useStore((state) => state.team);
    const hydrated = useStore.persist.hasHydrated();

    useEffect(() => {
        // Wait for hydration before checking auth
        if (hydrated && !team) {
            router.push('/');
        }
    }, [team, router, hydrated]);

    if (!hydrated || !team) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <header className="h-16 glass-panel z-20 sticky top-0 px-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {team.name.charAt(0)}
                    </div>
                    <div>
                        <h1 className="font-bold text-gray-800">{team.name}</h1>
                        <p className="text-xs text-gray-500 hidden sm:block">لوحة المهام</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-500" title="كود الفريق">
                        #{team.secret_code}
                    </span>
                    <button
                        onClick={() => {
                            useStore.getState().setTeam(null);
                            router.push('/');
                        }}
                        className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        خروج
                    </button>
                </div>
            </header>

            <main className="flex-1 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
