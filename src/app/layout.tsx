import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast'; // Need to install this

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'مُساعد الفريق - Team Assistant',
    description: 'Team Kanban Board with Media Support',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ar" dir="rtl">
            <body className={inter.className}>
                {children}
                <Toaster position="bottom-left" />
            </body>
        </html>
    );
}
