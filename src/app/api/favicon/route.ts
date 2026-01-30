import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const result = await db.execute({
            sql: "SELECT value FROM site_settings WHERE key = 'site_favicon_url'",
            args: [],
        });

        if (result.rows.length > 0 && result.rows[0].value) {
            const faviconUrl = result.rows[0].value as string;

            // If it's a base64 data URL, convert it to actual image
            if (faviconUrl.startsWith('data:image')) {
                const matches = faviconUrl.match(/^data:image\/(\w+);base64,(.+)$/);
                if (matches) {
                    const imageType = matches[1];
                    const base64Data = matches[2];
                    const buffer = Buffer.from(base64Data, 'base64');

                    return new NextResponse(buffer, {
                        headers: {
                            'Content-Type': `image/${imageType}`,
                            'Cache-Control': 'public, max-age=3600',
                        },
                    });
                }
            }

            // If it's a URL, redirect to it
            return NextResponse.redirect(faviconUrl);
        }

        // Return default favicon
        return NextResponse.redirect(new URL('/favicon.ico', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
    } catch (error) {
        console.error('Error fetching favicon:', error);
        return NextResponse.redirect(new URL('/favicon.ico', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'));
    }
}
