import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'site'; // 'site' or 'payment'
    const table = type === 'payment' ? 'payment_settings' : 'site_settings';

    try {
        const result = await db.execute(`SELECT * FROM ${table}`);
        const settings: Record<string, string> = {};
        result.rows.forEach(row => {
            settings[row.key as string] = row.value as string;
        });
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'site';
    const table = type === 'payment' ? 'payment_settings' : 'site_settings';

    try {
        const data = await request.json();

        for (const [key, value] of Object.entries(data)) {
            await db.execute({
                sql: `INSERT OR REPLACE INTO ${table} (key, value) VALUES (?, ?)`,
                args: [key, String(value)]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Settings error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
