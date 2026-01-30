import type { Metadata } from 'next';
import { Inter, Tajawal, Cairo } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ThemeWrapper from '@/components/ThemeWrapper';
import { getSiteSettings } from '@/lib/settings';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const tajawal = Tajawal({
    subsets: ['arabic'],
    weight: ['200', '300', '400', '500', '700', '800', '900'],
    variable: '--font-tajawal-google'
});
const cairo = Cairo({
    subsets: ['arabic'],
    weight: ['200', '300', '400', '500', '600', '700', '800', '900', '1000'],
    variable: '--font-cairo-google'
});

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSiteSettings();
    return {
        title: settings.seo_title || settings.site_name || 'مُساعد الفريق - Team Assistant',
        description: settings.seo_description || 'Team Kanban Board with Media Support',
        icons: {
            icon: settings.site_favicon_url ? `/api/favicon?v=${Date.now()}` : '/favicon.ico',
            shortcut: '/favicon.ico',
            apple: '/favicon.ico',
        }
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className={`${inter.variable} ${tajawal.variable} ${cairo.variable}`}>
                <ThemeWrapper>
                    {children}
                </ThemeWrapper>
                <Toaster position="bottom-left" />
            </body>
        </html>
    );
}
