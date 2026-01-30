import React from 'react';
import { useStore } from '@/lib/store';
import { Plus, Minus, Bold } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const { fontSize, setFontSize, isBold, setIsBold } = useStore();
    const pathname = usePathname();
    const isBoardPage = pathname?.startsWith('/board');

    return (
        <footer className="fixed bottom-0 left-0 right-0 w-full py-3 flex items-center justify-between px-6 border-t border-border/40 bg-background/60 backdrop-blur-md z-[100]">
            <div className="flex items-center gap-2 text-muted-foreground/60 select-none hover:text-muted-foreground/80 transition-colors duration-500">
                <span className="text-[10px] sm:text-[11px] font-medium tracking-tight" style={{ fontFamily: 'monospace, "Courier New"' }}>
                    صُنع بحب في السعودية 🇸🇦
                </span>
            </div>

            {/* Zoom & Style Controls Badge - Only visible on board page */}
            {isBoardPage && (
                <div className="flex items-center gap-1 bg-card/50 backdrop-blur-sm border border-border/50 px-2 py-1 shadow-sm rounded-full transition-all hover:border-primary/30">
                    <div className="px-2 text-[10px] font-black text-muted-foreground font-mono">
                        {fontSize}px
                    </div>

                    <div className="w-[1px] h-3 bg-border/50 mx-0.5" />

                    <button
                        onClick={() => setIsBold(!isBold)}
                        className={`p-1 rounded-full transition-all ${isBold ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'}`}
                        title={isBold ? "الخط عادي" : "الخط عريض"}
                    >
                        <Bold size={14} strokeWidth={3} />
                    </button>

                    <div className="w-[1px] h-3 bg-border/50 mx-0.5" />

                    <button
                        onClick={() => setFontSize(Math.min(24, fontSize + 1))}
                        className="p-1 text-muted-foreground/60 hover:text-primary transition-colors"
                        title="تكبير الخط"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>

                    <div className="w-[1px] h-3 bg-border/50 mx-0.5" />

                    <button
                        onClick={() => setFontSize(Math.max(10, fontSize - 1))}
                        className="p-1 text-muted-foreground/60 hover:text-primary transition-colors"
                        title="تصغير الخط"
                    >
                        <Minus size={14} strokeWidth={3} />
                    </button>
                </div>
            )}
        </footer>
    );
}
