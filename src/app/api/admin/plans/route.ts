import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const result = await db.execute('SELECT * FROM subscription_plans ORDER BY price ASC');
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await request.json();
        const id = data.id || Math.random().toString(36).substr(2, 9);

        await db.execute({
            sql: 'INSERT INTO subscription_plans (id, name, max_teams, max_members, price, duration, is_default) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [id, data.name, data.max_teams, data.max_members, data.price, data.duration, data.is_default ? 1 : 0]
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 });
    }
}
