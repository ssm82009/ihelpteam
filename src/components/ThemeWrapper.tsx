'use client';

import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { theme, radius, fontFamily } = useStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const html = document.documentElement;
        const body = document.body;

        // Remove existing theme, radius and font classes
        [html, body].forEach(el => {
            const classes = Array.from(el.classList);
            classes.forEach(c => {
                if (c.startsWith('theme-') || c.startsWith('font-') || c.startsWith('radius-')) {
                    el.classList.remove(c);
                }
            });
        });

        html.classList.add(`theme-${theme}`);
        html.classList.add(`radius-${radius}`);
        html.classList.add(`font-${fontFamily}`);
        body.classList.add(`theme-${theme}`);
        body.classList.add(`radius-${radius}`);
        body.classList.add(`font-${fontFamily}`);
    }, [theme, radius, fontFamily]);

    if (!mounted) {
        return <div className="theme-light-pro min-h-screen invisible">{children}</div>;
    }

    return (
        <div className="min-h-screen transition-colors duration-300">
            {children}
        </div>
    );
}
