import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAdmin } from '@/lib/admin';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const data = await request.json();
        await db.execute({
            sql: 'UPDATE subscription_plans SET name = ?, max_teams = ?, max_members = ?, price = ?, duration = ?, is_default = ? WHERE id = ?',
            args: [data.name, data.max_teams, data.max_members, data.price, data.duration, data.is_default ? 1 : 0, params.id]
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!isAdmin()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        await db.execute({
            sql: 'DELETE FROM subscription_plans WHERE id = ?',
            args: [params.id]
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 });
    }
}
